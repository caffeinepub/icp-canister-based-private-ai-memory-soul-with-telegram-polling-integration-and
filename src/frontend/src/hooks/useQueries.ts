import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Thread, Event, EventType, UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetAllThreads() {
  const { actor, isFetching } = useActor();

  return useQuery<Thread[]>({
    queryKey: ['threads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllThreads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetThread(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Thread | null>({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getThread(threadId);
    },
    enabled: !!actor && !isFetching && !!threadId,
  });
}

export function useGetEventsByThread(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events', threadId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEventsByThread(threadId);
    },
    enabled: !!actor && !isFetching && !!threadId,
  });
}

export function useCreateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, participants }: { title: string; participants: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createThread(title, participants);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useUpdateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, title, participants }: { threadId: string; title: string; participants: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateThread(threadId, title, participants);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['thread', variables.threadId] });
    },
  });
}

export function useDeleteThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteThread(threadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useAddEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, sender, eventType, content, metadata }: { threadId: string; sender: string; eventType: EventType; content: string; metadata: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addEvent(threadId, sender, eventType, content, metadata);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['thread', variables.threadId] });
    },
  });
}

export function useDeleteEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, threadId }: { eventId: string; threadId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteEvent(eventId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useDeleteAll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAll();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
