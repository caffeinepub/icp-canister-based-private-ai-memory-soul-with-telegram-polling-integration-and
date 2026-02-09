import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, MessageSquare, Zap, FileText } from 'lucide-react';
import type { Event, EventType } from '../../backend';

interface EventRowProps {
  event: Event;
  onDelete: () => void;
}

export function EventRow({ event, onDelete }: EventRowProps) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'telegramMessage':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'action':
        return <Zap className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (eventType: EventType) => {
    switch (eventType) {
      case 'text':
        return 'Text';
      case 'telegramMessage':
        return 'Telegram';
      case 'action':
        return 'Action';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">{getEventIcon(event.eventType)}</div>
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {getEventTypeLabel(event.eventType)}
              </Badge>
              <span className="text-xs text-muted-foreground">{event.sender}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatTimestamp(event.timestamp)}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap break-words">{event.content}</p>
            {event.metadata && event.metadata !== '{}' && (
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Metadata</summary>
                <pre className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">{event.metadata}</pre>
              </details>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this event from the thread.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
