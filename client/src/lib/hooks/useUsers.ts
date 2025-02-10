import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { User } from '@shared/schema';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchUsers(); // Refetch when data changes
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(userData: Omit<User, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      await fetchUsers();
      return data;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  async function updateUser(id: number, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchUsers();
      return data;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  async function deleteUser(id: number) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchUsers();
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
  };
}