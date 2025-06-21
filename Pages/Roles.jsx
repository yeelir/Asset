import React, { useState, useEffect } from "react";
import { Role } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const ALL_PERMISSIONS = [
    { id: 'asset:view', label: 'View Assets' },
    { id: 'asset:create', label: 'Create & Edit Assets' },
    { id: 'asset:delete', label: 'Delete Assets' },
    { id: 'asset:checkout', label: 'Checkout/Check-in Assets' },
    { id: 'asset:import', label: 'Import Assets via CSV' },
    { id: 'user:view', label: 'View Users' },
    { id: 'user:manage', label: 'Manage User Roles' },
    { id: 'role:manage', label: 'Manage Roles & Permissions' },
    { id: 'category:manage', label: 'Manage Categories' },
    { id: 'location:manage', label: 'Manage Locations' },
    { id: 'report:view', label: 'View Reports' },
];

function RoleForm({ role, onSave, onCancel }) {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        if (role) {
            setName(role.name || '');
            setPermissions(role.permissions || []);
        } else {
            setName('');
            setPermissions([]);
        }
    }, [role]);

    const handlePermissionToggle = (permissionId) => {
        setPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...role, name, permissions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                    id="role-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label>Permissions</Label>
                <div className="p-4 border rounded-md max-h-80 overflow-y-auto space-y-2 bg-secondary/50">
                    {ALL_PERMISSIONS.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`perm-${permission.id}`}
                                checked={permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={`perm-${permission.id}`}>{permission.label}</Label>
                        </div>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Role</Button>
            </DialogFooter>
        </form>
    );
}

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        const data = await Role.list();
        setRoles(data);
    };

    const handleSave = async (roleData) => {
        if (roleData.id) {
            await Role.update(roleData.id, roleData);
        } else {
            await Role.create(roleData);
        }
        loadRoles();
        closeModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? Users with this role will lose its permissions.")) {
            await Role.delete(id);
            loadRoles();
        }
    };

    const openModal = (role = null) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRole(null);
        setIsModalOpen(false);
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Role
                    </Button>
                </div>

                <div className="space-y-4">
                    {roles.map(role => (
                        <Card key={role.id} className="glass-morphism">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{role.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {role.permissions?.length || 0} permissions
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" onClick={() => openModal(role)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                     {roles.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">No roles found. Create one to manage user permissions.</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="glass-morphism">
                    <DialogHeader>
                        <DialogTitle>{selectedRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                    </DialogHeader>
                    <RoleForm role={selectedRole} onSave={handleSave} onCancel={closeModal} />
                </DialogContent>
            </Dialog>
        </div>
    );
}