import React, { useReducer, useEffect } from 'react';
import { User, UserFormData } from '../types/user';

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  editingUser: User | null;
}

type FormAction = 
  | { type: 'SET_FIELD'; field: keyof UserFormData; value: string }
  | { type: 'RESET' }
  | { type: 'SET_USER'; user: User };

const initialState: UserFormData = {
  name: '',
  email: '',
  phone: '',
};

function formReducer(state: UserFormData, action: FormAction): UserFormData {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    case 'SET_USER':
      return {
        name: action.user.name,
        email: action.user.email,
        phone: action.user.phone,
      };
    default:
      return state;
  }
}

const UserForm = ({ onSubmit, editingUser }: UserFormProps) => {
  const [formState, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    if (editingUser) {
      dispatch({ type: 'SET_USER', user: editingUser });
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [editingUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
    if (!editingUser) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Name
        </label>
        <input
          type="text"
          value={formState.name}
          onChange={(e) => dispatch({ 
            type: 'SET_FIELD', 
            field: 'name', 
            value: e.target.value 
          })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-700 
            dark:border-gray-600 dark:text-white shadow-sm px-4 py-2 focus:border-indigo-500 
            focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Email
        </label>
        <input
          type="email"
          value={formState.email}
          onChange={(e) => dispatch({ 
            type: 'SET_FIELD', 
            field: 'email', 
            value: e.target.value 
          })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-700 
            dark:border-gray-600 dark:text-white shadow-sm px-4 py-2 focus:border-indigo-500 
            focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Phone
        </label>
        <input
          type="tel"
          value={formState.phone}
          onChange={(e) => dispatch({ 
            type: 'SET_FIELD', 
            field: 'phone', 
            value: e.target.value 
          })}
          className="mt-1 block w-full rounded-md border-gray-300 bg-white dark:bg-gray-700 
            dark:border-gray-600 dark:text-white shadow-sm px-4 py-2 focus:border-indigo-500 
            focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
          transition-colors dark:hover:bg-indigo-500"
      >
        {editingUser ? 'Update User' : 'Add User'}
      </button>
    </form>
  );
};

export default UserForm; 