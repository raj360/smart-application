import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserFormData } from '../../types/user';
import { api } from '../../utils/api';

interface UsersState {
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  optimisticUpdates: {
    [key: number]: {
      type: 'delete' | 'update' | 'create';
      previousData?: User;
    };
  };
}

const initialState: UsersState = {
  users: [],
  status: 'idle',
  error: null,
  optimisticUpdates: {},
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await api.getUsers();
    return response;
  }
);

export const updateUserAsync = createAsyncThunk(
  'users/updateUserAsync',
  async (user: User, {rejectWithValue }) => {
    
    // Check if this is a user we originally fetched from the API (IDs 1-10 for JSONPlaceholder)
    const isOriginalUser = user.id <= 10;
    
    if (isOriginalUser) {
      try {
        const response = await api.updateUser(user);
        return response;
      } catch (error) {
        return rejectWithValue('Failed to update user. Server error occurred.');
      }
    } else {
      // For users we created locally (which aren't really on the server)
      return rejectWithValue('Cannot update user. This user exists only locally and has not been persisted on the server.');
    }
  }
);

export const deleteUserAsync = createAsyncThunk(
  'users/deleteUserAsync',
  async (userId: number, { rejectWithValue }) => {
    // Check if this is a user from the original API (IDs 1-10 for JSONPlaceholder)
    const isOriginalUser = userId <= 10;
    
    if (isOriginalUser) {
      try {
        await api.deleteUser(userId);
        return userId;
      } catch (error) {
        return rejectWithValue('Failed to delete user. Server error occurred.');
      }
    } else {
      // For locally created users, just return the ID without an error
      // This is different from update because deleting a non-existent item is idempotent
      return userId;
    }
  }
);

export const createUserAsync = createAsyncThunk(
  'users/createUserAsync',
  async (userData: UserFormData) => {
    const response = await api.createUser(userData);
    return response;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    startOptimisticUpdate: (state, action: PayloadAction<User>) => {
      const userId = action.payload.id;
      state.optimisticUpdates[userId] = {
        type: 'update',
        previousData: state.users.find(u => u.id === userId),
      };
      const index = state.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    startOptimisticDelete: (state, action: PayloadAction<number>) => {
      const userId = action.payload;
      const userToDelete = state.users.find(u => u.id === userId);
      if (userToDelete) {
        state.optimisticUpdates[userId] = {
          type: 'delete',
          previousData: userToDelete,
        };
        state.users = state.users.filter(u => u.id !== userId);
      }
    },
    startOptimisticCreate: (state, action: PayloadAction<User>) => {
      state.optimisticUpdates[action.payload.id] = {
        type: 'create',
        previousData: undefined,
      };
      state.users.push(action.payload);
    },
    rollbackOptimisticUpdate: (state, action: PayloadAction<number>) => {
      const userId = action.payload;
      const update = state.optimisticUpdates[userId];
      if (update?.previousData) {
        if (update.type === 'delete') {
          state.users.push(update.previousData);
        } else {
          const index = state.users.findIndex(u => u.id === userId);
          if (index !== -1) {
            state.users[index] = update.previousData;
          }
        }
      }
      delete state.optimisticUpdates[userId];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch users';
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        delete state.optimisticUpdates[action.payload.id];
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        if (action.meta.arg) {
          const userId = action.meta.arg.id;
          const update = state.optimisticUpdates[userId];
          if (update?.previousData) {
            const index = state.users.findIndex(u => u.id === userId);
            if (index !== -1) {
              state.users[index] = update.previousData;
            }
          }
          delete state.optimisticUpdates[userId];
        }
        
        // Use the custom error message if available
        state.error = action.payload as string || 'Failed to update user';
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        delete state.optimisticUpdates[action.payload];
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        const userId = action.meta.arg;
        const update = state.optimisticUpdates[userId];
        if (update?.previousData) {
          state.users.push(update.previousData);
        }
        delete state.optimisticUpdates[userId];
        state.error = 'Failed to delete user';
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        const tempId = Math.max(...state.users.map(u => u.id), 0);
        const index = state.users.findIndex(u => u.id === tempId);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        delete state.optimisticUpdates[tempId];
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        const tempId = Math.max(...state.users.map(u => u.id), 0);
        state.users = state.users.filter(u => u.id !== tempId);
        delete state.optimisticUpdates[tempId];
        state.error = 'Failed to create user';
      });
  },
});

export const {
  updateUser,
  deleteUser,
  startOptimisticUpdate,
  startOptimisticDelete,
  startOptimisticCreate,
  rollbackOptimisticUpdate,
  clearError,
} = usersSlice.actions;

export default usersSlice.reducer; 