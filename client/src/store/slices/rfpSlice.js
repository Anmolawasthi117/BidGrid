import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosInstance";

// ==================== ASYNC THUNKS ====================

// Send chat message
export const sendMessage = createAsyncThunk(
  "rfp/sendMessage",
  async ({ message, rfpId }, thunkAPI) => {
    try {
      const res = await axios.post("/rfps/chat", { message, rfpId });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to send message"
      );
    }
  }
);

// Fetch all RFPs
export const fetchRFPs = createAsyncThunk(
  "rfp/fetchRFPs",
  async (status, thunkAPI) => {
    try {
      const url = status ? `/rfps?status=${status}` : "/rfps";
      const res = await axios.get(url);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch RFPs"
      );
    }
  }
);

// Fetch single RFP
export const fetchRFPById = createAsyncThunk(
  "rfp/fetchRFPById",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(`/rfps/${id}`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch RFP"
      );
    }
  }
);

// Update RFP
export const updateRFP = createAsyncThunk(
  "rfp/updateRFP",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axios.patch(`/rfps/${id}`, data);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update RFP"
      );
    }
  }
);

// Delete RFP
export const deleteRFP = createAsyncThunk(
  "rfp/deleteRFP",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`/rfps/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to delete RFP"
      );
    }
  }
);

// Finalize RFP
export const finalizeRFP = createAsyncThunk(
  "rfp/finalizeRFP",
  async (id, thunkAPI) => {
    try {
      const res = await axios.post(`/rfps/${id}/finalize`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to finalize RFP"
      );
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  // Current chat session
  currentRfpId: null,
  chatMessages: [],
  currentRfp: null,
  isComplete: false,
  
  // RFP list
  rfps: [],
  
  // Loading states
  loading: false,
  sending: false,
  error: null,
};

const rfpSlice = createSlice({
  name: "rfp",
  initialState,
  reducers: {
    clearChat: (state) => {
      state.currentRfpId = null;
      state.chatMessages = [];
      state.currentRfp = null;
      state.isComplete = false;
      state.error = null;
    },
    addUserMessage: (state, action) => {
      state.chatMessages.push({
        role: "user",
        content: action.payload,
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.currentRfpId = action.payload.rfpId;
        state.chatMessages.push({
          role: "assistant",
          content: action.payload.message,
        });
        state.isComplete = action.payload.isComplete;
        if (action.payload.rfp) {
          state.currentRfp = action.payload.rfp;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      // Fetch RFPs
      .addCase(fetchRFPs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRFPs.fulfilled, (state, action) => {
        state.loading = false;
        state.rfps = action.payload;
      })
      .addCase(fetchRFPs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single RFP
      .addCase(fetchRFPById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRFPById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRfpId = action.payload._id;
        state.currentRfp = action.payload;
        state.chatMessages = action.payload.chatHistory || [];
        state.isComplete = action.payload.isComplete;
      })
      .addCase(fetchRFPById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update RFP
      .addCase(updateRFP.fulfilled, (state, action) => {
        state.currentRfp = action.payload;
        const index = state.rfps.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.rfps[index] = action.payload;
        }
      })

      // Delete RFP
      .addCase(deleteRFP.fulfilled, (state, action) => {
        state.rfps = state.rfps.filter((r) => r._id !== action.payload);
        if (state.currentRfpId === action.payload) {
          state.currentRfpId = null;
          state.currentRfp = null;
          state.chatMessages = [];
          state.isComplete = false;
        }
      })

      // Finalize RFP
      .addCase(finalizeRFP.fulfilled, (state, action) => {
        state.currentRfp = action.payload;
        const index = state.rfps.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.rfps[index] = action.payload;
        }
      });
  },
});

export const { clearChat, addUserMessage, clearError } = rfpSlice.actions;
export default rfpSlice.reducer;
