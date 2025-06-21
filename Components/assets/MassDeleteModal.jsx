import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Asset } from '@/entities/all';

export default function MassDeleteModal({ isOpen, onClose, onDeleteSuccess }) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResults, setDeleteResults] = useState(null);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE ALL ASSETS') return;
    
    setIsDeleting(true);
    try {
      // Get all assets
      const allAssets = await Asset.list();
      
      let successCount = 0;
      let failedCount = 0;
      
      // Delete assets in small batches to avoid rate limiting
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < allAssets.length; i += batchSize) {
        batches.push(allAssets.slice(i, i + batchSize));
      }
      
      for (const batch of batches) {
        const deletePromises = batch.map(asset => 
          Asset.delete(asset.id).then(() => ({ success: true, id: asset.id }))
            .catch(error => ({ success: false, id: asset.id, error }))
        );
        
        const results = await Promise.all(deletePromises);
        successCount += results.filter(r => r.success).length;
        failedCount += results.filter(r => !r.success).length;
        
        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setDeleteResults({
        total: allAssets.length,
        success: successCount,
        failed: failedCount
      });
      
      if (successCount > 0) {
        onDeleteSuccess();
      }
    } catch (error) {
      setDeleteResults({
        total: 0,
        success: 0,
        failed: 0,
        error: error.message
      });
    }
    setIsDeleting(false);
  };

  const handleClose = () => {
    setConfirmText('');
    setDeleteResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-morphism">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Mass Delete All Assets
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete ALL assets from the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {!deleteResults ? (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action cannot be undone. All asset data will be permanently lost.
                </AlertDescription>
              </Alert>
              
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  To confirm, type <strong>DELETE ALL ASSETS</strong> in the box below:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE ALL ASSETS to confirm"
                  className="font-mono"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {deleteResults.success > 0 && (
                <Alert>
                  <AlertDescription>
                    Successfully deleted {deleteResults.success} assets.
                  </AlertDescription>
                </Alert>
              )}
              
              {deleteResults.failed > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to delete {deleteResults.failed} assets.
                  </AlertDescription>
                </Alert>
              )}
              
              {deleteResults.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error: {deleteResults.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {deleteResults ? 'Close' : 'Cancel'}
          </Button>
          
          {!deleteResults && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE ALL ASSETS' || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Assets
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}