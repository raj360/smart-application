'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { User, UserFormData } from '../types/user';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, addUser, updateUser, deleteUser, startOptimisticUpdate, startOptimisticDelete, updateUserAsync, deleteUserAsync } from '../store/slices/usersSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const { users, status, error } = useAppSelector((state) => state.users);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [status, dispatch]);

  const handleAddUser = (formData: UserFormData) => {
    dispatch(addUser(formData));
  };

  const handleUpdateUser = async (formData: UserFormData) => {
    if (!editingUser) return;
    
    const updatedUser = { ...editingUser, ...formData };
    
    // Apply optimistic update
    dispatch(startOptimisticUpdate(updatedUser));
    setEditingUser(null);
    
    try {
      // Perform actual update
      await dispatch(updateUserAsync(updatedUser)).unwrap();
    } catch (error) {
      // Redux slice will handle the rollback
      console.error('Failed to update user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    // Apply optimistic delete
    dispatch(startOptimisticDelete(id));
    
    try {
      // Perform actual delete
      await dispatch(deleteUserAsync(id)).unwrap();
    } catch (error) {
      // Redux slice will handle the rollback
      console.error('Failed to delete user:', error);
    }
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            User Management
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Manage your users efficiently
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-md bg-red-50 dark:bg-red-900 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search users..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="mt-8 flex gap-8">
          <div className="w-[35%] bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <UserForm
                onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                editingUser={editingUser}
              />
            </div>
          </div>

          <div className="w-[65%]">
            <UserTable
              users={filteredUsers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
