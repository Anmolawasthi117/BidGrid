import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// ==================== HELPERS ====================

// Save auth data to localStorage
const saveToStorage = (data) => {
  try {
    if (data.user) {
      localStorage.setItem("bidgrid_user", JSON.stringify(data.user));
    }
    if (data.accessToken) {
      localStorage.setItem("bidgrid_token", data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem("bidgrid_refresh", data.refreshToken);
    }
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
};

// Clear auth data from localStorage
const clearStorage = () => {
  try {
    localStorage.removeItem("bidgrid_user");
    localStorage.removeItem("bidgrid_token");
    localStorage.removeItem("bidgrid_refresh");
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
};

// Load user from localStorage
const loadUserFromStorage = () => {
  try {
    const user = localStorage.getItem("bidgrid_user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

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
    // Clear storage if token is invalid
    clearStorage();
    return thunkAPI.rejectWithValue("Unable to fetch user");
  }
});

// Logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await axios.post("/users/logout");
    clearStorage();
    return true;
  } catch (err) {
    // Clear storage even if API fails
    clearStorage();
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
    clearStorage();
    return thunkAPI.rejectWithValue("Token refresh failed");
  }
});

// Check auth on app load - tries to restore session
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, thunkAPI) => {
  const token = localStorage.getItem("bidgrid_token");
  if (!token) {
    return thunkAPI.rejectWithValue("No token");
  }
  
  try {
    const res = await axios.get("/users/current-user");
    return res.data;
  } catch (err) {
    clearStorage();
    return thunkAPI.rejectWithValue("Session expired");
  }
});

// ==================== SLICE ====================

const initialState = {
  user: loadUserFromStorage(),
  loading: false,
  checkingAuth: true, // New state for initial auth check
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
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.checkingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.user = action.payload.data;
        saveToStorage({ user: action.payload.data });
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkingAuth = false;
        state.user = null;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        saveToStorage({ user: action.payload.data });
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
        const userData = action.payload.data?.user || action.payload.data;
        state.user = userData;
        saveToStorage({
          user: userData,
          accessToken: action.payload.data?.accessToken,
          refreshToken: action.payload.data?.refreshToken,
        });
        state.message = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        saveToStorage({ user: action.payload.data });
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.message = "Logged out successfully";
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear user even on error
        state.user = null;
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
        saveToStorage({ user: action.payload });
        state.message = "Account updated successfully";
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        saveToStorage({
          user: action.payload.user,
          accessToken: action.payload.accessToken,
        });
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
