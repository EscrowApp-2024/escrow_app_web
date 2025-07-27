// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard/settings");
  };

  return (
    <div className="text-center py-12">
      <h1>Welcome to Escrow App</h1>
      <p>Securely transact with buyers and sellers.</p>
      <button className="btn-primary mt-4" onClick={handleGetStarted}>
        Get Started
      </button>
    </div>
  );
}