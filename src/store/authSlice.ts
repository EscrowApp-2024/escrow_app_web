import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Country interface
interface Country {
  country_id: string;
  name: string;
  currency_name: string;
  currency_code: string;
}

// Define the User interface
interface User {
  user_id: string;
  user_email: string;
  name: string;
  country: Country;
}

// Define the AuthState interface
interface AuthState {
  email: string | null;
  phoneNumber: string | null; // Add phoneNumber field
  fromPage: string | null;
  otpMethod: string | null;
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  email: null,
  phoneNumber: null,
  fromPage: null,
  otpMethod: null,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPhoneNumber: (state, action: PayloadAction<string | null>) => {
      state.phoneNumber = action.payload;
    },
    setFromPage: (state, action: PayloadAction<string>) => {
      state.fromPage = action.payload;
    },
    setOtpMethod: (state, action: PayloadAction<string>) => {
      state.otpMethod = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.user.user_email) {
        state.email = action.payload.user.user_email;
      }
    },
    clearAuth: (state) => {
      state.email = null;
      state.phoneNumber = null;
      state.fromPage = null;
      state.otpMethod = null;
      state.user = null;
      state.token = null;
    },
  },
});

export const { setEmail, setPhoneNumber, setFromPage, setOtpMethod, setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;