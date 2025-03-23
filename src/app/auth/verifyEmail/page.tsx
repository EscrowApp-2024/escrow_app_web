"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";
import Header from "@/components/UI/header";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { AuthService } from "@/services/Auth_Session_Manager";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { clearAuth } from "@/store/authSlice";
import { RootState } from "@/store/store";

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For Verify Email button
  const [isResendLoading, setIsResendLoading] = useState(false); // New state for Resend Code
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const { email, fromPage } = useSelector((state: RootState) => state.auth);

  // Check if the page is accessed from Register or Login
  useEffect(() => {
    if (!email || !fromPage || !["register", "login"].includes(fromPage)) {
      return router.replace("/auth/register");
    }
  }, [email, fromPage, router, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeString = code.join("");
    if (!codeString || !email || !/^\d{6}$/.test(codeString)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponseMessage(null);

    try {
      const payload = { email, code: codeString };
      const result = await AuthService.verifyEmail(payload);
      setIsLoading(false);
      setResponseMessage(result);

      if (result.success) {
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorResult = ApiResponseHandler.handleError(error);
      setResponseMessage({ ...errorResult, isNetworkError: !error.response });
    }

    setTimeout(() => setResponseMessage(null), 3000);
  };

  const resetCountdown = useCallback(() => {
    setTimeLeft(60);
    setCanResend(false);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = async () => {
    if (canResend && email) {
      setIsResendLoading(true); // Use the new state for resend loading
      setResponseMessage(null);

      try {
        const query_params = { email, code_type: "verifyEmail" };
        const result = await AuthService.resendCode(query_params);
        setIsResendLoading(false); // Update the new state
        
        if (result.success) {
          resetCountdown();
          setResponseMessage(result);
        } else {
          resetCountdown();
          setResponseMessage(result);
        }
      } catch (error: any) {
        setIsResendLoading(false); // Update the new state
        const errorResult = ApiResponseHandler.handleError(error);
        setResponseMessage({ 
          ...errorResult, 
          isNetworkError: !error.response 
        });
      }

      setTimeout(() => setResponseMessage(null), 3000);
    }
  };

  if (!email) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-primary-dark-green p-4" style={{ paddingTop: "90px", minHeight: "100vh" }}>
      <Header />
      {responseMessage && (
        <ApiResponseMessage
          success={responseMessage.success}
          message={responseMessage.message}
          onClose={() => setResponseMessage(null)}
          isNetworkError={responseMessage.isNetworkError}
        />
      )}
      <div className="form-card bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
        <button
          className="text-text-gray mb-4 focus:outline-none"
          aria-label="Back"
          onClick={() => router.push("/auth/register")}
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Email Confirmation</h1>
        <p className="text-gray-600 mb-6">
          A confirmation code has been sent to <strong>{email}</strong>. Please enter the 6-digit code below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="w-11 h-11 text-center border border-gray-300 rounded-md focus:border-primary-dark-green focus:outline-none"
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              className={`text-blue-500 hover:underline ${(!canResend || isResendLoading) ? "pointer-events-none text-gray-400" : ""}`} // Use isResendLoading here
              disabled={!canResend || isResendLoading} // Use isResendLoading here
            >
              {canResend ? 
                (isResendLoading ? "Resending..." : "Resend Code") : // Use isResendLoading here
                `Resend Code (${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? "0" : ""}${timeLeft % 60})`}
            </button>
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
              isLoading || code.join("").length !== 6 ? "opacity-75 cursor-not-allowed" : "hover:bg-button-hover"
            }`}
            style={{ backgroundColor: "var(--primary-dark-green)", color: "var(--secondary-white)" }}
            disabled={isLoading || code.join("").length !== 6} // Still uses isLoading
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          .form-card {
            min-height: 0 !important;
          }
        }
        .digit-input {
          width: 12px;
          height: 12px;
          text-align: center;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}