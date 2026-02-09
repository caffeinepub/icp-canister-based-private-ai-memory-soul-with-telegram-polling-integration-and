import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Thread, Event } from '../../backend';

interface ExportThreadButtonProps {
  thread: Thread;
  events: Event[];
}

export function ExportThreadButton({ thread, events }: ExportThreadButtonProps) {
  const handleExport = () => {
    try {
      const exportData = {
        thread: {
          id: thread.id,
          title: thread.title,
          participants: thread.participants,
          timestamp_created: thread.timestamp_created.toString(),
          timestamp_modified: thread.timestamp_modified.toString(),
        },
        events: events.map((event) => ({
          id: event.id,
          threadId: event.threadId,
          timestamp: event.timestamp.toString(),
          sender: event.sender,
          eventType: event.eventType,
          content: event.content,
          metadata: event.metadata,
        })),
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thread-${thread.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Thread exported successfully');
    } catch (error) {
      toast.error('Failed to export thread');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
