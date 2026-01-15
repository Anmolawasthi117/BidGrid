import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// ==================== ASYNC THUNKS ====================

// Fetch all vendors
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors", 
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/vendors");
      // API returns { data: { vendors, pagination } }
      return res.data.data.vendors;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch vendors");
    }
  }
);

// Create vendor
export const createVendor = createAsyncThunk(
  "vendors/createVendor",
  async (vendorData, thunkAPI) => {
    try {
      const res = await axios.post("/vendors", vendorData);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create vendor");
    }
  }
);

// Update vendor
export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axios.patch(`/vendors/${id}`, data);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update vendor");
    }
  }
);

// Delete vendor
export const deleteVendor = createAsyncThunk(
  "vendors/deleteVendor",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/vendors/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete vendor");
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  vendors: [],
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearVendorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create vendor
      .addCase(createVendor.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.createLoading = false;
        state.vendors.unshift(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update vendor
      .addCase(updateVendor.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.vendors.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete vendor
      .addCase(deleteVendor.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.vendors = state.vendors.filter((v) => v._id !== action.payload);
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVendorError } = vendorSlice.actions;
export default vendorSlice.reducer;
