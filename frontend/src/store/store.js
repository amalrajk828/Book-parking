import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import parkingReducer from '../features/parkingSlice';
import bookingReducer from '../features/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parking: parkingReducer,
    bookings: bookingReducer,
  },
});
