import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, PieChart, FileDown, ArrowRight, CalendarDays, Archive, DollarSign } from "lucide-react";

export default function Reports() {
  const reports = [
    {
      title: "Inventory Summary",
      description: "Complete list of all assets. Exportable to CSV.",
      icon: BarChart,
      action: "Generate",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Checked Out Assets",
      description: "All assets currently assigned to users.",
      icon: PieChart,
      action: "View",
      color: "from-emerald-500 to-cyan-500"
    },
    {
      title: "Event Manifests",
      description: "View and export asset lists for specific live events.",
      icon: CalendarDays,
      action: "Go to Events",
      href: "/Events",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Asset Depreciation",
      description: "Calculate asset value over time. (Coming Soon)",
      icon: DollarSign,
      action: "Unavailable",
      color: "from-slate-400 to-slate-500",
      disabled: true
    },
    {
      title: "Retired Assets",
      description: "A log of all assets that have been retired.",
      icon: Archive,
      action: "View",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Reports
          </h1>
          <p className="text-slate-600">
            Generate insights and export data from your inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            const content = (
              <Card className="glass-morphism border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${report.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-800">{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-slate-600">{report.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full" disabled={report.disabled}>
                    {report.action}
                    {!report.disabled && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </Card>
            );

            return report.href ? (
              <a href={report.href} key={report.title}>{content}</a>
            ) : (
              <div key={report.title}>{content}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}