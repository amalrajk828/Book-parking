import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Fetch settings public thunk
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/config');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to retrieve website settings'
      );
    }
  }
);

// Update settings admin thunk
export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.put('/config', settingsData);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update website settings'
      );
    }
  }
);

const cachedSettings = localStorage.getItem('website_settings');
let parsedSettings = null;
if (cachedSettings) {
  try {
    parsedSettings = JSON.parse(cachedSettings);
  } catch (err) {
    console.error('Failed to parse cached website settings:', err);
  }
}

const defaultSettings = {
  websiteName: 'Smart Parking',
  websiteLogo: '',
  contactEmail: 'amalrajk828@gmail.com',
  contactPhone: '+91 7594005431',
  supportAddress: '123 Smart Way, Tech City',
  currency: 'INR',
  currencySymbol: '₹',
  themeMode: 'system',
  primaryColor: '#3b82f6',
  maintenanceMode: false,
  maintenanceMessage: 'System under maintenance. We will be back shortly.',
  footerText: 'Next-generation IoT smart parking reservation and gate checkout platform.',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  }
};

const initialState = {
  settings: parsedSettings || defaultSettings,
  loading: false,
  initialized: parsedSettings ? true : false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.settings = action.payload;
        localStorage.setItem('website_settings', JSON.stringify(action.payload));
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If fetch fails, keep initialized true to still display cached layout
        state.initialized = true;
      })
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
        localStorage.setItem('website_settings', JSON.stringify(action.payload));
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
