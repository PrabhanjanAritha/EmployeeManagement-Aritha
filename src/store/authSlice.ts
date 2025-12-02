import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: localStorage.getItem('authToken') ? true : false,
  user: localStorage.getItem('userEmail')
    ? { email: localStorage.getItem('userEmail') || '' }
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('authToken', 'token-' + Date.now());
      localStorage.setItem('userEmail', action.payload.email);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
