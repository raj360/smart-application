import axios, { AxiosError } from 'axios';
import { User, UserFormData } from '../types/user';

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

  createUser: async (userData: UserFormData): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error: unknown) {
      console.error('API Error:', error instanceof AxiosError ? error.message : error);
      throw new Error('Failed to create user');
    }
  },

  updateUser: async (user: User): Promise<User> => {
    try {
      // JSONPlaceholder only has users with IDs 1-10
      if (user.id <= 10) {
        const response = await axios.put(`${API_URL}/users/${user.id}`, user);
        return response.data;
      } else {
        // For users with IDs > 10 (our locally created users), simulate a successful response
        return user;
      }
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