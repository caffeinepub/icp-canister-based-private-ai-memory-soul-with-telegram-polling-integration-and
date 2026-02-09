import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetThread, useGetEventsByThread, useUpdateThread, useDeleteThread, useAddEvent, useDeleteEvent } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit2, Trash2, Download, Plus, Loader2 } from 'lucide-react';
import { EventRow } from '../components/threads/EventRow';
import { ExportThreadButton } from '../components/threads/ExportThreadButton';
import { toast } from 'sonner';
import { EventType } from '../backend';

export default function ThreadDetailPage() {
  const navigate = useNavigate();
  const { threadId } = useParams({ from: '/threads/$threadId' });
  const { data: thread, isLoading: threadLoading } = useGetThread(threadId);
  const { data: events = [], isLoading: eventsLoading } = useGetEventsByThread(threadId);
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();
  const addEvent = useAddEvent();
  const deleteEventMutation = useDeleteEvent();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const handleEditOpen = () => {
    setEditTitle(thread?.title || '');
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!thread || !editTitle.trim()) return;
    try {
      await updateThread.mutateAsync({
        threadId: thread.id,
        title: editTitle.trim(),
        participants: thread.participants,
      });
      toast.success('Thread updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update thread');
    }
  };

  const handleDelete = async () => {
    if (!thread) return;
    try {
      await deleteThread.mutateAsync(thread.id);
      toast.success('Thread deleted successfully');
      navigate({ to: '/threads' });
    } catch (error) {
      toast.error('Failed to delete thread');
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await addEvent.mutateAsync({
        threadId,
        sender: 'admin',
        eventType: EventType.action,
        content: noteContent.trim(),
        metadata: JSON.stringify({ type: 'admin_note' }),
      });
      toast.success('Note added successfully');
      setNoteContent('');
      setNoteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync({ eventId, threadId });
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (threadLoading || eventsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Thread not found</p>
          <Button className="mt-4" onClick={() => navigate({ to: '/threads' })}>
            Back to Threads
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/threads' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{thread.title || 'Untitled Thread'}</h2>
          <p className="text-sm text-muted-foreground">
            Created {formatTimestamp(thread.timestamp_created)} · Modified {formatTimestamp(thread.timestamp_modified)}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Admin Note</DialogTitle>
                <DialogDescription>Add a private note to this thread for administrative purposes.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder="Enter your note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!noteContent.trim() || addEvent.isPending}>
                  {addEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ExportThreadButton thread={thread} events={events} />
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleEditOpen}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Thread</DialogTitle>
                <DialogDescription>Update the thread title and metadata.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSave} disabled={!editTitle.trim() || updateThread.isPending}>
                  {updateThread.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the thread and all associated events.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteThread.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {thread.participants.map((participant, idx) => (
              <Badge key={idx} variant="secondary">
                {participant}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>{events.length} events</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No events in this thread yet</p>
          ) : (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div key={event.id}>
                  <EventRow event={event} onDelete={() => handleDeleteEvent(event.id)} />
                  {idx < events.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
