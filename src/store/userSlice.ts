// store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface UserState {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phoneNumber: string | null;
}

const initialState: UserState = {
  first_name: null,
  last_name: null,
  email: null,
  phoneNumber: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setfirst_name: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setlast_name: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPhoneNumber: (state, action: PayloadAction<string | null>) => {
      state.phoneNumber = action.payload;
    },
   
    clearUser: (state) => {
      state.first_name = null,
      state.last_name = null,
      state.email = null;
      state.phoneNumber = null;
    },
  },
});

export const { setEmail, setPhoneNumber, setfirst_name, setlast_name, clearUser} = userSlice.actions;
export default userSlice.reducer;