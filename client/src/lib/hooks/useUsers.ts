import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { supabase } from '../supabase';
import { App } from 'antd';

export function useUsers() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Setup Supabase real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['users'] });

          // Show notification for changes
          const event = payload.eventType;
          if (event === 'INSERT') {
            message.success('New user created');
          } else if (event === 'UPDATE') {
            message.success('User updated');
          } else if (event === 'DELETE') {
            message.success('User deleted');
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, message]);

  const { data: users = [], isLoading: loading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === 'PGRST116') {
            message.error('Table not found. Please ensure the users table is created.');
          } else {
            message.error(`Failed to fetch users: ${error.message}`);
          }
          throw error;
        }

        return data as User[];
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
    retry: false // Don't retry on failure to avoid spam
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<User, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      message.error(error.message || 'Failed to create user');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<User> }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      message.error(error.message || 'Failed to update user');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      message.error(error.message || 'Failed to delete user');
    }
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