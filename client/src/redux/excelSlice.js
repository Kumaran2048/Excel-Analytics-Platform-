import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';


export const uploadExcel = createAsyncThunk(
  'excel/upload',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'File upload failed'
      );
    }
  }
);

export const getUserUploads = createAsyncThunk(
  'excel/getUploads',
  async ({ page = 1, search = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/excel/uploads?page=${page}&search=${search}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch uploads'
      );
    }
  }
);

export const getUploadById = createAsyncThunk(
  'excel/getUpload',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/excel/uploads/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch upload'
      );
    }
  }
);

export const saveAnalysis = createAsyncThunk(
  'excel/saveAnalysis',
  async (analysisData, { rejectWithValue }) => {
    try {
      const response = await api.post('/excel/analyze', analysisData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to save analysis'
      );
    }
  }
);

export const getUserAnalyses = createAsyncThunk(
  'excel/getAnalyses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/excel/analyses');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch analyses'
      );
    }
  }
);

export const getAnalysisById = createAsyncThunk(
  'excel/getAnalysis',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/excel/analyses/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch analysis'
      );
    }
  }
);

export const deleteAnalysis = createAsyncThunk(
  'excel/deleteAnalysis',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/excel/analyses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete analysis'
      );
    }
  }
);

export const deleteUpload = createAsyncThunk(
  'excel/deleteUpload',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/excel/uploads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete upload'
      );
    }
  }
);

const initialState = {
  uploads: [],
  currentUpload: null,
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUploads: 0,
  },
};

const excelSlice = createSlice({
  name: 'excel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUpload: (state) => {
      state.currentUpload = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(uploadExcel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadExcel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUpload = action.payload.upload;
      })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getUserUploads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserUploads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.uploads = action.payload.uploads;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalUploads: action.payload.totalUploads,
        };
      })
      .addCase(getUserUploads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
     
      .addCase(getUploadById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUploadById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUpload = action.payload;
      })
      .addCase(getUploadById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(saveAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        
        state.analyses.unshift(action.payload.analysis);
      })
      .addCase(saveAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getUserAnalyses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserAnalyses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyses = action.payload;
      })
      .addCase(getUserAnalyses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getAnalysisById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnalysisById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(getAnalysisById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteAnalysis.fulfilled, (state, action) => {
        state.analyses = state.analyses.filter(analysis => analysis._id !== action.payload);
      })
    
      .addCase(deleteUpload.fulfilled, (state, action) => {
        state.uploads = state.uploads.filter(upload => upload._id !== action.payload);
        
        state.analyses = state.analyses.filter(analysis => analysis.uploadId._id !== action.payload);
      });
  },
});

export const { clearError, clearCurrentUpload, clearCurrentAnalysis } = excelSlice.actions;
export default excelSlice.reducer;