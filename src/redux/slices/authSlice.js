import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signIn, signUp, signOut } from '../../api/authApi';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await signIn(email, password);
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, firstName, lastName }, { rejectWithValue }) => {
    try {
      const data = await signUp(email, password, firstName, lastName);
      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  user: null,
  session: null,
  authenticated: false,
  // False until the initial supabase.auth.getSession() resolves on page load.
  // Route guards must wait for this before redirecting to /login, otherwise
  // every hard refresh bounces through /login and loses the current page.
  sessionChecked: false,
  status: 'idle',
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      const session = action.payload;
      state.sessionChecked = true;
      if (session) {
        state.session = session;
        state.user = session.user;
        state.authenticated = true;
      } else {
        state.session = null;
        state.user = null;
        state.authenticated = false;
      }
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.authenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Register (accept invite)
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.authenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.authenticated = false;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { setSession, clearError } = authSlice.actions;

export default authSlice.reducer;
