import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';


export const getDashboardStats = createAsyncThunk(
  'admin/dashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async ({ page = 1, search = '', limit = 10, role = '', includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (includeInactive) params.append('includeInactive', 'true');
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const getUserById = createAsyncThunk(
  'admin/getUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

export const reactivateUser = createAsyncThunk(
  'admin/reactivateUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/users/${id}/reactivate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reactivate user'
      );
    }
  }
);

export const bulkDeleteUsers = createAsyncThunk(
  'admin/bulkDeleteUsers',
  async (userIds, { rejectWithValue }) => {
    try {
      await api.post('/admin/users/bulk-delete', { userIds });
      return userIds;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete users'
      );
    }
  }
);

export const bulkReactivateUsers = createAsyncThunk(
  'admin/bulkReactivateUsers',
  async (userIds, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/users/bulk-reactivate', { userIds });
      return { 
        userIds, 
        message: response.data.message,
        reactivatedCount: response.data.reactivatedCount
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reactivate users'
      );
    }
  }
);

const initialState = {
  dashboardStats: null,
  users: [],
  currentUser: null,
  isLoading: false,
  isOperationLoading: false,
  error: null,
  success: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    search: '',
    role: '',
    includeInactive: false,
  },
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
        includeInactive: false,
      };
    },
    resetAdminState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalUsers: action.payload.totalUsers,
          limit: action.payload.limit,
          hasNextPage: action.payload.hasNextPage,
          hasPrevPage: action.payload.hasPrevPage,
        };
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
    
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createUser.pending, (state) => {
        state.isOperationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isOperationLoading = false;
        
        state.users.unshift(action.payload.user);
      
        state.pagination.totalUsers += 1;
        state.success = 'User created successfully';
        
        
        if (state.pagination.currentPage === 1 && 
            state.users.length > state.pagination.limit) {
          state.users.pop();
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isOperationLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateUser.pending, (state) => {
        state.isOperationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isOperationLoading = false;
        state.currentUser = action.payload.user;
       
        const index = state.users.findIndex(user => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        state.success = 'User updated successfully';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isOperationLoading = false;
        state.error = action.payload;
      })
     
      .addCase(deleteUser.pending, (state) => {
        state.isOperationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isOperationLoading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
       
        state.pagination.totalUsers -= 1;
        state.success = 'User deactivated successfully';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isOperationLoading = false;
        state.error = action.payload;
      })
      
      .addCase(reactivateUser.pending, (state) => {
        state.isOperationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        state.isOperationLoading = false;
        
        const index = state.users.findIndex(user => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], isActive: true };
        }
        
        if (state.currentUser && state.currentUser._id === action.payload.user._id) {
          state.currentUser = { ...state.currentUser, isActive: true };
        }
        state.success = 'User reactivated successfully';
      })
      .addCase(reactivateUser.rejected, (state, action) => {
        state.isOperationLoading = false;
        state.error = action.payload;
      })
     
      .addCase(bulkDeleteUsers.pending, (state) => {
        state.isOperationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.isOperationLoading = false;
        state.users = state.users.filter(user => !action.payload.includes(user._id));
        state.pagination.totalUsers -= action.payload.length;
        state.success = `${action.payload.length} users deactivated successfully`;
      })
      .addCase(bulkDeleteUsers.rejected, (state, action) => {
        state.isOperationLoading = false;
        state.error = action.payload;
      })
      
      .addCase(bulkReactivateUsers.pending, (state) => {
        state.isOperationLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(bulkReactivateUsers.fulfilled, (state, action) => {
        state.isOperationLoading = false;
        
        state.users = state.users.map(user => 
          action.payload.userIds.includes(user._id) 
            ? { ...user, isActive: true } 
            : user
        );
        state.pagination.totalUsers += action.payload.reactivatedCount;
        state.success = action.payload.message;
      })
      .addCase(bulkReactivateUsers.rejected, (state, action) => {
        state.isOperationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearCurrentUser, 
  setFilters, 
  clearFilters, 
  resetAdminState 
} = adminSlice.actions;

export default adminSlice.reducer;