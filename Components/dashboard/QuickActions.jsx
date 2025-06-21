
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, MapPin, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Asset",
      description: "Register a new asset",
      icon: Plus,
      href: createPageUrl("AssetForm"),
      color: "bg-gradient-to-r from-emerald-500 to-cyan-500"
    },
    {
      title: "Manage Categories",
      description: "Organize asset types",
      icon: FolderOpen,
      href: createPageUrl("Categories"),
      color: "bg-gradient-to-r from-blue-500 to-indigo-500"
    },
    {
      title: "Manage Locations",
      description: "Define asset places",
      icon: MapPin,
      href: createPageUrl("Locations"),
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      title: "View Reports",
      description: "Generate insights",
      icon: FileText,
      href: createPageUrl("Reports"),
      color: "bg-gradient-to-r from-orange-500 to-red-500"
    }
  ];

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-200 hover:shadow-md"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-800 text-sm">{action.title}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
