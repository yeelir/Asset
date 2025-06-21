import React, { useState, useEffect } from 'react';
import { AssetAttachment, User } from '@/entities/all';
import { UploadFile } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Paperclip, FileText, Image, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AssetAttachments({ assetId }) {
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (assetId) {
      loadAttachments();
    }
  }, [assetId]);

  const loadAttachments = async () => {
    setIsLoading(true);
    try {
      const data = await AssetAttachment.filter({ asset_id: assetId }, '-created_date');
      setAttachments(data);
    } catch (error) {
      console.error("Error loading attachments:", error);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const currentUser = await User.me();
      const { file_url } = await UploadFile({ file });
      
      await AssetAttachment.create({
        asset_id: assetId,
        file_url,
        file_name: file.name,
        file_type: file.type,
        uploaded_by_email: currentUser.email,
        uploaded_by_full_name: currentUser.full_name,
      });

      setFile(null);
      document.getElementById('file-upload-input').value = '';
      loadAttachments();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };
  
  const handleDelete = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await AssetAttachment.delete(attachmentId);
        loadAttachments();
      } catch(e) {
        console.error("Error deleting attachment:", e)
      }
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    return <Paperclip className="w-5 h-5 text-slate-500" />;
  };

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Attachments ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input id="file-upload-input" type="file" onChange={handleFileChange} className="glass-morphism" />
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
            </Button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : attachments.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No attachments yet.</p>
            ) : (
              attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(att.file_type)}
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate" title={att.file_name}>{att.file_name}</p>
                      <p className="text-xs text-slate-500">
                        by {att.uploaded_by_full_name} on {format(new Date(att.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4 text-slate-600" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(att.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}