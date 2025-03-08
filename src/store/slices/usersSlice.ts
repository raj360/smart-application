import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserFormData } from '../../types/user';
import { api } from '../../utils/api';

interface UsersState {
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  optimisticUpdates: {
    [key: number]: {
      type: 'delete' | 'update';
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
  async (user: User) => {
    const response = await api.updateUser(user);
    return response;
  }
);

export const deleteUserAsync = createAsyncThunk(
  'users/deleteUserAsync',
  async (userId: number) => {
    await api.deleteUser(userId);
    return userId;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<UserFormData>) => {
      const newUser: User = {
        id: Math.max(...state.users.map(u => u.id), 0) + 1,
        ...action.payload
      };
      state.users.push(newUser);
    },
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
        state.error = 'Failed to update user';
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
      });
  },
});

export const {
  addUser,
  updateUser,
  deleteUser,
  startOptimisticUpdate,
  startOptimisticDelete,
  rollbackOptimisticUpdate,
} = usersSlice.actions;

export default usersSlice.reducer; 