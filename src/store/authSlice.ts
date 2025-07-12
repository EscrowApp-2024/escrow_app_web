// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Country {
  country_id: string;
  name: string;
  currency_name: string;
  currency_code: string;
}

interface User {
  user_id: string;
  user_email: string;
  name: string;
  country: Country;
}

interface AuthState {
  email: string | null;
  phoneNumber: string | null;
  fromPage: string | null;
  otpMethod: string | null;
  user: User | null;
  token: string | null;
  privateKey: CryptoKey | null; // Changed to CryptoKey
}

const initialState: AuthState = {
  email: null,
  phoneNumber: null,
  fromPage: null,
  otpMethod: null,
  user: null,
  token: null,
  privateKey: null,
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
    setAuth: (state, action: PayloadAction<{ 
      user: User; 
      token: string;
      //privateKey: CryptoKey; // Changed to CryptoKey
    }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      //state.privateKey = action.payload.privateKey;
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
      state.privateKey = null;
    },
  },
});

export const { setEmail, setPhoneNumber, setFromPage, setOtpMethod, setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;