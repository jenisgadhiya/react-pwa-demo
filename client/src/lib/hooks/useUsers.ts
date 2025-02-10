import { useState, useEffect } from 'react';
import type { User } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../queryClient';

export function useUsers() {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Setup WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type.startsWith('user_')) {
        // Invalidate users query on any user-related WebSocket message
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [queryClient]);

  const { data: users = [], isLoading: loading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('GET', '/api/users').then(res => res.json())
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<User, 'id' | 'created_at'>) => {
      const res = await apiRequest('POST', '/api/users', userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<User> }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/users/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  return {
    users,
    loading,
    error,
    createUser: createUserMutation.mutateAsync,
    updateUser: (id: number, updates: Partial<User>) => 
      updateUserMutation.mutateAsync({ id, updates }),
    deleteUser: deleteUserMutation.mutateAsync,
  };
}