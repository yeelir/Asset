import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutHistory, User } from "@/entities/all";
import { format } from "date-fns";
import { History, ArrowRight, ArrowLeft, Settings } from "lucide-react";

export default function AssetHistory({ assetId }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (assetId) {
      loadHistory();
    }
  }, [assetId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await CheckoutHistory.filter({ asset_id: assetId }, '-created_date');
      
      // Load user details for each history record
      const userEmails = [...new Set(historyData.map(h => h.user_email))];
      const users = {};
      
      if (userEmails.length > 0) {
        const usersData = await User.filter({ email: { in: userEmails } });
        usersData.forEach(user => {
          users[user.email] = user;
        });
      }

      const enrichedHistory = historyData.map(record => ({
        ...record,
        user: users[record.user_email] || null
      }));

      setHistory(enrichedHistory);
    } catch (error) {
      console.error("Error loading asset history:", error);
    }
    setIsLoading(false);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'checkout':
        return <ArrowRight className="w-4 h-4 text-blue-600" />;
      case 'checkin':
        return <ArrowLeft className="w-4 h-4 text-green-600" />;
      case 'install':
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'checkout':
        return "bg-blue-100 text-blue-800";
      case 'checkin':
        return "bg-green-100 text-green-800";
      case 'install':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5" />
            Asset History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5" />
          Asset History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No history records found for this asset.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(record.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getActionColor(record.action)} font-medium capitalize`}>
                      {record.action.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {format(new Date(record.created_date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-800">
                      <span className="font-medium">
                        {record.user?.full_name || record.user_email}
                      </span>
                      {record.action === 'checkout' && ' checked out this asset'}
                      {record.action === 'checkin' && ' returned this asset'}
                      {record.action === 'install' && ' installed this asset'}
                    </p>
                    {(record.checkout_date || record.expected_return_date || record.actual_return_date) && (
                      <div className="text-sm text-slate-500 space-y-1">
                        {record.checkout_date && (
                          <p>Checkout: {format(new Date(record.checkout_date), 'MMM d, yyyy')}</p>
                        )}
                        {record.expected_return_date && (
                          <p>Expected return: {format(new Date(record.expected_return_date), 'MMM d, yyyy')}</p>
                        )}
                        {record.actual_return_date && (
                          <p>Returned: {format(new Date(record.actual_return_date), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    )}
                    {record.notes && (
                      <p className="text-sm text-slate-600 italic">"{record.notes}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}