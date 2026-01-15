import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// ==================== ASYNC THUNKS ====================

// Register
export const registerUser = createAsyncThunk("auth/registerUser", async (formData, thunkAPI) => {
  try {
    const res = await axios.post("/users", formData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

// Login
export const loginUser = createAsyncThunk("auth/loginUser", async (formData, thunkAPI) => {
  try {
    const res = await axios.post("/users/login", formData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// Get current user
export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, thunkAPI) => {
  try {
    const res = await axios.get("/users/current-user");
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue("Unable to fetch user");
  }
});

// Logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await axios.post("/users/logout");
    return true;
  } catch (err) {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

// Change password
export const changePassword = createAsyncThunk("auth/changePassword", async (data, thunkAPI) => {
  try {
    const res = await axios.post("/users/change-password", data);
    return res.data.message;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Password change failed");
  }
});

// Update account
export const updateAccount = createAsyncThunk("auth/updateAccount", async (formData, thunkAPI) => {
  try {
    const res = await axios.patch("/users/update-account", formData);
    return res.data.updatedUser;
  } catch (err) {
    return thunkAPI.rejectWithValue("Account update failed");
  }
});

// Refresh token
export const refreshToken = createAsyncThunk("auth/refreshToken", async (_, thunkAPI) => {
  try {
    const res = await axios.post("/users/refresh-token");
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue("Token refresh failed");
  }
});

// ==================== SLICE ====================

const initialState = {
  user: null,
  loading: false,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = "Registration successful";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.message = "Logged out successfully";
      })

      // Change password
      .addCase(changePassword.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update account
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.user = action.payload;
        state.message = "Account updated successfully";
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
