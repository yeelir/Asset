import React, { useState, useEffect } from 'react';
import { AssetNote, User } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function AssetNotes({ assetId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (assetId) {
      loadNotes();
    }
  }, [assetId]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const data = await AssetNote.filter({ asset_id: assetId }, '-created_date');
      setNotes(data);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
    setIsLoading(false);
  };

  const handlePostNote = async () => {
    if (!newNote.trim()) return;

    setIsPosting(true);
    try {
      const currentUser = await User.me();
      await AssetNote.create({
        asset_id: assetId,
        note: newNote,
        user_email: currentUser.email,
        user_full_name: currentUser.full_name,
      });
      setNewNote('');
      loadNotes();
    } catch (error) {
      console.error("Error posting note:", error);
    }
    setIsPosting(false);
  };

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              className="glass-morphism"
            />
            <Button onClick={handlePostNote} disabled={isPosting}>
              {isPosting ? '...' : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : notes.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No notes yet.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="p-3 bg-white/50 rounded-lg">
                  <p className="text-slate-800 whitespace-pre-wrap">{note.note}</p>
                  <p className="text-xs text-slate-500 mt-2 text-right">
                    - {note.user_full_name} on {format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}