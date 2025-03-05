'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { User, UserFormData } from '../types/user';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import useLocalStorage from '../hooks/useLocalStorage';
import { api } from '../utils/api';

export default function Home() {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (users.length === 0) {
          const fetchedUsers = await api.getUsers();
          setUsers(fetchedUsers);
        }
      } catch (error: unknown) {
        console.error('Fetch error:', error);
        setError('Failed to fetch users');
      }
    };

    fetchUsers();
  }, [users.length, setUsers]);

  const handleAddUser = (formData: UserFormData) => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      ...formData
    };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (formData: UserFormData) => {
    if (!editingUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? { ...user, ...formData } : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search users..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <UserForm
            onSubmit={editingUser ? handleUpdateUser : handleAddUser}
            editingUser={editingUser}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
