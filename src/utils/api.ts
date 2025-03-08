import axios, { AxiosError } from 'axios';
import { User } from '../types/user';

const API_URL = 'https://jsonplaceholder.typicode.com';

export const api = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error: unknown) {
      console.error('API Error:', error instanceof AxiosError ? error.message : error);
      throw new Error('Failed to fetch users');
    }
  },

  updateUser: async (user: User): Promise<User> => {
    try {
      const response = await axios.put(`${API_URL}/users/${user.id}`, user);
      return response.data;
    } catch (error: unknown) {
      console.error('API Error:', error instanceof AxiosError ? error.message : error);
      throw new Error('Failed to update user');
    }
  },

  deleteUser: async (userId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
    } catch (error: unknown) {
      console.error('API Error:', error instanceof AxiosError ? error.message : error);
      throw new Error('Failed to delete user');
    }
  }
}; 