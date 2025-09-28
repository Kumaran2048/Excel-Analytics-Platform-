import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import excelReducer from './excelSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    excel: excelReducer,
    admin: adminReducer,
  },
});