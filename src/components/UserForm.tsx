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
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formState.name}
          onChange={(e) => dispatch({ 
            type: 'SET_FIELD', 
            field: 'name', 
            value: e.target.value 
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formState.email}
          onChange={(e) => dispatch({ 
            type: 'SET_FIELD', 
            field: 'email', 
            value: e.target.value 
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          value={formState.phone}
          onChange={(e) => dispatch({ 
            type: 'SET_FIELD', 
            field: 'phone', 
            value: e.target.value 
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {editingUser ? 'Update User' : 'Add User'}
      </button>
    </form>
  );
};

export default UserForm; 