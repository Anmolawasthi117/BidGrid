import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";
import authReducer from "./slices/authSlice";
import vendorReducer from "./slices/vendorSlice";
import rfpReducer from "./slices/rfpSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    vendors: vendorReducer,
    rfp: rfpReducer,
  },
});
