import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import parkingReducer from '../features/parkingSlice';
import bookingReducer from '../features/bookingSlice';
import settingsReducer from '../features/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parking: parkingReducer,
    bookings: bookingReducer,
    settings: settingsReducer,
  },
});
