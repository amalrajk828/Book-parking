import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  areas: [],
  selectedArea: null,
  slots: [],
  loading: false,
  error: null,
};

// Fetch all parking areas thunk
export const fetchAreas = createAsyncThunk('parking/fetchAreas', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/areas?${params}`);
    return response.data.areas;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch parking areas');
  }
});

// Fetch single parking area details with slots thunk
export const fetchAreaDetails = createAsyncThunk('parking/fetchAreaDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/areas/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch area details');
  }
});

// Create a new parking area thunk
export const createArea = createAsyncThunk('parking/createArea', async (areaData, { rejectWithValue }) => {
  try {
    const response = await api.post('/areas', areaData);
    return response.data.parkingArea;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create parking area');
  }
});

// Update parking area thunk
export const updateArea = createAsyncThunk('parking/updateArea', async ({ id, areaData }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/areas/${id}`, areaData);
    return response.data.area;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update parking area');
  }
});

// Delete parking area thunk
export const deleteArea = createAsyncThunk('parking/deleteArea', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/areas/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete parking area');
  }
});

// Assign guide to area thunk
export const assignAreaGuide = createAsyncThunk('parking/assignGuide', async ({ areaId, guideId }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/areas/${areaId}/assign-guide`, { guideId });
    return response.data.area;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to assign guide');
  }
});

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    clearSelectedArea: (state) => {
      state.selectedArea = null;
      state.slots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Areas
      .addCase(fetchAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchAreaDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreaDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArea = action.payload.area;
        state.slots = action.payload.slots;
      })
      .addCase(fetchAreaDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Area
      .addCase(createArea.fulfilled, (state, action) => {
        state.areas.push(action.payload);
      })
      // Update Area
      .addCase(updateArea.fulfilled, (state, action) => {
        const index = state.areas.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
        if (state.selectedArea && state.selectedArea._id === action.payload._id) {
          state.selectedArea = action.payload;
        }
      })
      // Delete Area
      .addCase(deleteArea.fulfilled, (state, action) => {
        state.areas = state.areas.filter((a) => a._id !== action.payload);
      })
      // Assign Guide
      .addCase(assignAreaGuide.fulfilled, (state, action) => {
        if (state.selectedArea && state.selectedArea._id === action.payload._id) {
          state.selectedArea = action.payload;
        }
        const index = state.areas.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.areas[index] = action.payload;
        }
      });
  },
});

export const { clearSelectedArea } = parkingSlice.actions;
export default parkingSlice.reducer;
