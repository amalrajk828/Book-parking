import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  myBookings: [],
  activeBooking: null,
  scannedBooking: null,
  loading: false,
  error: null,
};

// Create a new booking thunk
export const createNewBooking = createAsyncThunk('bookings/create', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Booking creation failed');
  }
});

// Fetch my bookings thunk
export const fetchMyBookings = createAsyncThunk('bookings/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/bookings/my-bookings');
    return response.data.bookings;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch your bookings');
  }
});

// Fetch single booking details thunk
export const fetchBookingById = createAsyncThunk('bookings/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking details');
  }
});

// Guide QR Verification thunk
export const verifyTicketQR = createAsyncThunk('bookings/verifyQR', async (bookingId, { rejectWithValue }) => {
  try {
    const trimmedId = bookingId.trim().toUpperCase();
    console.log(`[FRONTEND DEBUG] Triggering API GET request for: "/bookings/lookup/${trimmedId}"`);
    const response = await api.get(`/bookings/lookup/${trimmedId}`);
    console.log('[FRONTEND DEBUG] Verification API call success:', response.data);
    return response.data.booking;
  } catch (error) {
    console.error('[FRONTEND DEBUG] Verification API call failed:', error);
    return rejectWithValue(error.response?.data?.message || 'Ticket verification failed');
  }
});

// Guide Check-In confirmation thunk
export const guideConfirmCheckIn = createAsyncThunk('bookings/checkIn', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/bookings/${id}/checkin`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Check-in failed');
  }
});

// Guide Check-Out confirmation thunk
export const guideConfirmCheckOut = createAsyncThunk('bookings/checkOut', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/bookings/${id}/checkout`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Check-out failed');
  }
});

// Cancel a booking thunk
export const userCancelBooking = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data.booking;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Booking cancellation failed');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearActiveBooking: (state) => {
      state.activeBooking = null;
    },
    clearScannedBooking: (state) => {
      state.scannedBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createNewBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBooking = action.payload;
        state.myBookings.unshift(action.payload);
      })
      .addCase(createNewBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Bookings
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Details
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify QR Ticket
      .addCase(verifyTicketQR.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTicketQR.fulfilled, (state, action) => {
        state.loading = false;
        state.scannedBooking = action.payload;
      })
      .addCase(verifyTicketQR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check-In
      .addCase(guideConfirmCheckIn.fulfilled, (state, action) => {
        state.scannedBooking = action.payload;
        const index = state.myBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      // Check-Out
      .addCase(guideConfirmCheckOut.fulfilled, (state, action) => {
        state.scannedBooking = action.payload;
        const index = state.myBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      })
      // Cancel Booking
      .addCase(userCancelBooking.fulfilled, (state, action) => {
        if (state.activeBooking && state.activeBooking._id === action.payload._id) {
          state.activeBooking = action.payload;
        }
        const index = state.myBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.myBookings[index] = action.payload;
        }
      });
  },
});

export const { clearActiveBooking, clearScannedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
