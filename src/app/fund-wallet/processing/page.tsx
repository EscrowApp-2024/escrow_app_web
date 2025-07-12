// app/fund-processing/page.tsx (App Router version)
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WalletManagerService } from "@/services/Wallet_Manager";
import Cookies from "js-cookie";

export default function FundProcessingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionRef = searchParams.get("reference");
  const [WalletId, setWalletId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userCookie = Cookies.get("sessionData");
      if(userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        const country = userData?.country;
        const wallets = userData?.user_wallets || [];
          // Find default wallet by matching currency_id with country_id
          let defaultWallet = wallets.find(
            (w: any) => w.currency_id === country?.country_id
          );

          let walletId = defaultWallet?.wallet_id || null;
          setWalletId(walletId)
      }
    } catch(error) {
      console.log(error);
    }
  }, [router])

  useEffect(() => {
    const processFunding = async () => {
      if (WalletId && transactionRef) {
        try {
          await WalletManagerService.fundWalletProcessing(WalletId, transactionRef);
        } catch (error) {
          console.log(error); // handle error if needed
        }
      }
    };
    processFunding();
  }, [transactionRef, WalletId]);

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-white-100 flex flex-col items-center px-4 pt-16 justify-start relative">
      {/* Animated Modern Hourglass SVG */}
      <div className="mb-8 flex justify-center">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl animate-pulse"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <g strokeWidth="2">
            <path
              d="M60 10C40 10 20 30 20 50s20 40 40 40 40-20 40-40S80 10 60 10z"
              stroke="url(#gradient1)"
              className="opacity-70"
            />
            <path
              d="M60 20C45 20 30 35 30 50s15 30 30 30 30-15 30-30S75 20 60 20z"
              stroke="url(#gradient2)"
              className="opacity-70"
            />
            <path
              d="M60 30C55 30 50 35 50 40s5 10 10 10 10-5 10-10-5-10-10-10z"
              stroke="url(#gradient1)"
              className="opacity-70"
            />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="w-full max-w-xl flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Funding in Progress</h2>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Your Wallet funding request has been successfully received and is now being processed, your wallet will be funded once payment process completes<br />
          Wallet funding typically takes <span className="font-semibold text-yellow-600">2–10 minutes</span> depending on the gateway's processing time.
        </p>
      </div>
      {/* Button at bottom */}
      <button
        onClick={handleGoHome}
        className="fixed left-0 right-0 bottom-8 mx-auto w-10/11 max-w-xl py-5 text-2xl font-bold bg-green-900 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
        style={{zIndex: 10}}
      >
        Go Home
      </button>
    </main>
  );
}
