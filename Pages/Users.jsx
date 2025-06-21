import React, { useState, useEffect } from "react";
import { User, Role } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function UserEditModal({ user, roles, onSave, onCancel }) {
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);

    useEffect(() => {
        if (user) {
            setSelectedRoleIds(user.role_ids || []);
        }
    }, [user]);

    const handleRoleToggle = (roleId) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSave = () => {
        onSave({ ...user, role_ids: selectedRoleIds });
    };

    if (!user) return null;

    return (
        <Dialog open={!!user} onOpenChange={onCancel}>
            <DialogContent className="glass-morphism">
                <DialogHeader>
                    <DialogTitle>Edit User: {user.full_name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div>
                        <h4 className="font-medium mb-2">Assign Roles</h4>
                        <div className="space-y-2 p-4 rounded-md bg-secondary/50 max-h-64 overflow-y-auto">
                            {roles.map(role => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedRoleIds.includes(role.id)}
                                        onCheckedChange={() => handleRoleToggle(role.id)}
                                    />
                                    <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [usersData, rolesData] = await Promise.all([User.list(), Role.list()]);
        setUsers(usersData);
        setRoles(rolesData);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
    };

    const handleSaveUser = async (updatedUser) => {
        await User.update(updatedUser.id, { role_ids: updatedUser.role_ids });
        setEditingUser(null);
        fetchData();
    };
    
    const getRoleNames = (roleIds) => {
        if (!roleIds || roleIds.length === 0) return <Badge variant="secondary">No Roles</Badge>;
        return roleIds.map(id => {
            const role = roles.find(r => r.id === id);
            return role ? <Badge key={id} variant="outline" className="mr-1">{role.name}</Badge> : null;
        });
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    {/* The platform handles user invites, so we don't need an invite button here */}
                </div>

                <Card className="glass-morphism">
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>System Role</TableHead>
                                        <TableHead>Assigned Roles</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.full_name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getRoleNames(user.role_ids)}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Manage Roles
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <UserEditModal
                    user={editingUser}
                    roles={roles}
                    onSave={handleSaveUser}
                    onCancel={() => setEditingUser(null)}
                />
            </div>
        </div>
    );
}