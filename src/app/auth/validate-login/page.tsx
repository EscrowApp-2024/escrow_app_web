"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MdArrowBack } from "react-icons/md";
import Header from "@/components/UI/header";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { AuthService } from "@/services/Auth_Session_Manager";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "@/store/authSlice";

import { RootState } from "@/store/store";
import Cookies from "js-cookie";

// Generate key pair and return public key as string, private key as CryptoKey
/*
async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: CryptoKey;
}> {
  try {
    if (!window.isSecureContext) {
      throw new Error("This application requires a secure context (HTTPS)");
    }

    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false, // Non-extractable
      ["sign", "verify"]
    );

    const publicKeyArrayBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyArrayBuffer)));

    return {
      publicKey: publicKeyBase64,
      privateKey: keyPair.privateKey, // Keep as CryptoKey
    };
  } catch (error) {
    throw new Error("Failed to generate key pair: " + error);
  }
}
*/
export default function ValidateLogin() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { email, phoneNumber, fromPage } = useSelector((state: RootState) => state.auth);

  const otpMethod = searchParams.get("otpMethod");

  useEffect(() => {
    if (!email || !otpMethod || !fromPage || !["login"].includes(fromPage)) {
      router.replace("/auth/login");
    }
  }, [email, otpMethod, router, fromPage]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  }, [code]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputsRef.current[index - 1]?.focus();
    }
  }, [code]);

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
      // Generate key pair on submit
      //const { publicKey, privateKey } = await generateKeyPair();

      const payload = { 
        email, 
        code: codeString,
      };
      //const session_key: string = publicKey;

      /*
      const customHeaders = {
        "x-escrow_api-session_key": session_key,
      };*/
      
      const result = await AuthService.validateLogin(payload);
      setIsLoading(false);

      if (result.success) {
        // Set publicKey in cookie
        /*
        Cookies.set("x-escrow_api-session_key", publicKey, { 
          expires: 1, 
          secure: true,
          sameSite: 'strict'
        });*/
        
        // Set other session data in cookies
        Cookies.set("sessionData", JSON.stringify(result.data.user_data), {  
          //secure: true,
          sameSite: 'strict'
        });
        Cookies.set("accessToken", result.data.access_token, { 
          expires: 1, 
          //
          // secure: true,
          sameSite: 'strict'
        });
        // Store privateKey as CryptoKey in Redux
        dispatch(setAuth({
          user: result.data.user_data,
          token: result.data.access_token,
          //privateKey: privateKey
        }));
        // Store user details in localStorage
        const user_session_data = {
          email: result.data.user_data.user_email,
          first_name: result.data.user_data.firstName,
          last_name: result.data.user_data.lastName,
          mobile_number: result.data.user_data.mobile_number
        }
        localStorage.setItem("user_session_data", JSON.stringify(user_session_data))
        setResponseMessage({ success: true, message: "Login successful" });
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setResponseMessage({ success: false, message: result.message });
      }
    } catch (error: any) {
      setIsLoading(false);
      setResponseMessage({ 
        success: false,
        message: "Login failed. Please try again.",
        isNetworkError: !error.response 
      });
      console.error("Login error:", error); // Log detailed error separately
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
    if (canResend && email && otpMethod) {
      setIsResendLoading(true);
      setResponseMessage(null);

      try {
        const payload = { email, code_type: otpMethod };
        const result = await AuthService.resendCode(payload);
        setIsResendLoading(false);
        
        if (result.success) {
          resetCountdown();
          setResponseMessage({ 
            success: true, 
            message: "Login code resent successfully" 
          });
        } else {
          setResponseMessage({ 
            success: false, 
            message: result.message 
          });
        }
      } catch (error: any) {
        setIsResendLoading(false);
        const errorResult = ApiResponseHandler.handleError(error);
        setResponseMessage({ 
          ...errorResult, 
          isNetworkError: !error.response 
        });
      }

      setTimeout(() => setResponseMessage(null), 3000);
    }
  };

  if (!email || !otpMethod) {
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
          onClick={() => router.push("/auth/login")}
        >
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Validate Login</h1>
        <p className="text-gray-600 mb-6">
          A login code has been sent to{" "}
          <strong>{otpMethod === "sms" ? phoneNumber : email}</strong> via {otpMethod}. 
          Please enter the 6-digit code below.
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
              className="w-11 h-11 text-center border border-gray-300 rounded-md dark:text-black focus:border-primary-dark-green focus:outline-none"
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
            />
            ))}
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}

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
              isLoading || code.some(digit => !digit) ? "opacity-75 cursor-not-allowed" : "hover:bg-button-hover"
            }`}
            style={{ backgroundColor: "var(--primary-dark-green)", color: "var(--secondary-white)" }}
            disabled={isLoading || code.some(digit => !digit)} 
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
            {isLoading ? "Signing In..." : "Sign In"} 
          </button>
        </form>
      </div>
      <style jsx>{`
        @media (max-width: 600px) {
          .form-card {
            min-height: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}