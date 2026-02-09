import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllThreads } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MessageSquare, Clock } from 'lucide-react';
import type { Thread } from '../backend';

export default function ThreadsPage() {
  const navigate = useNavigate();
  const { data: threads = [], isLoading } = useGetAllThreads();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const query = searchQuery.toLowerCase();
    return threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.participants.some((p) => p.toLowerCase().includes(query))
    );
  }, [threads, searchQuery]);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Memory Threads</h2>
          <p className="text-sm text-muted-foreground">
            {threads.length} {threads.length === 1 ? 'thread' : 'threads'} stored
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredThreads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No threads found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search query' : 'Threads will appear here as they are created'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredThreads.map((thread) => (
            <Card
              key={thread.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate({ to: '/threads/$threadId', params: { threadId: thread.id } })}
            >
              <CardHeader>
                <CardTitle className="line-clamp-1 text-base">{thread.title || 'Untitled Thread'}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(thread.timestamp_modified)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {thread.participants.slice(0, 3).map((participant, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {participant}
                    </Badge>
                  ))}
                  {thread.participants.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{thread.participants.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
