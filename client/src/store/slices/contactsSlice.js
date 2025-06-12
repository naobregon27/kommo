import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Async thunk for fetching contacts
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/contacts');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('No autenticado. Por favor, inicia sesión con Google.');
      }
      return rejectWithValue(error.response?.data?.error || 'Error al obtener contactos');
    }
  }
);

export const validateContact = createAsyncThunk(
  'contacts/validateContact',
  async (contactId, { getState, rejectWithValue }) => {
    try {
      const contacts = getState().contacts.items;
      const contact = contacts.find(c => c.id === contactId);
      
      if (!contact) {
        return rejectWithValue('Contacto no encontrado');
      }
      
      const response = await api.post(`/api/contacts/validate/${contactId}`, {
        phoneNumber: contact.phoneNumber
      });
      
      return {
        id: contactId,
        isValid: response.data.isValid,
        formattedNumber: response.data.formattedNumber
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al validar contacto');
    }
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    validationStatus: 'idle',
    selectedContactIds: []
  },
  reducers: {
    selectContact: (state, action) => {
      const contactId = action.payload;
      if (!state.selectedContactIds) {
        state.selectedContactIds = [];
      }
      const index = state.selectedContactIds.indexOf(contactId);
      if (index === -1) {
        state.selectedContactIds.push(contactId);
      } else {
        state.selectedContactIds.splice(index, 1);
      }
    },
    clearSelectedContacts: (state) => {
      state.selectedContactIds = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAll: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
      state.validationStatus = 'idle';
      state.selectedContactIds = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(validateContact.pending, (state, action) => {
        const contactId = action.meta.arg;
        const contact = state.items.find(item => item.id === contactId);
        if (contact) {
          contact.validating = true;
        }
      })
      .addCase(validateContact.fulfilled, (state, action) => {
        const contact = state.items.find(item => item.id === action.payload.id);
        if (contact) {
          contact.isValid = action.payload.isValid;
          contact.formattedNumber = action.payload.formattedNumber;
          contact.lastValidated = new Date().toISOString();
          contact.validating = false;
        }
      })
      .addCase(validateContact.rejected, (state, action) => {
        const contactId = action.meta.arg;
        const contact = state.items.find(item => item.id === contactId);
        if (contact) {
          contact.validating = false;
        }
      });
  },
});

export const { 
  selectContact, 
  clearSelectedContacts, 
  clearError 
} = contactsSlice.actions;

export default contactsSlice.reducer; 