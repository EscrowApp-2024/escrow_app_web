// src/app/ClientProvider.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import ThemeWrapper from "@/components/UI/ThemeWrapper"; // Adjust path if needed
import { ReactNode } from "react";

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
        <ThemeWrapper>{children}</ThemeWrapper>
    </Provider>
  );
}