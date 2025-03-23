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

export default function ValidateLogin() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For Sign In button
  const [isResendLoading, setIsResendLoading] = useState(false); // New state for Resend Code link
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [keyPairError, setKeyPairError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { email, phoneNumber, fromPage } = useSelector((state: RootState) => state.auth);
  const otpMethod = searchParams.get("otpMethod");

  // Function to convert binary to PEM format
  function toPem(keyData: ArrayBuffer, type: string) {
    const base64 = Buffer.from(keyData).toString("base64");
    const pemHeader = type === "public" ? "-----BEGIN PUBLIC KEY-----" : "-----BEGIN PRIVATE KEY-----";
    const pemFooter = type === "public" ? "-----END PUBLIC KEY-----" : "-----END PRIVATE KEY-----";
    
    // Wrap Base64 at 64 characters per line (PEM standard)
    const wrappedBase64 = base64.match(/.{1,64}/g)?.join("\n") || "";
    
    // Construct PEM string
    return `${pemHeader}\n${wrappedBase64}\n${pemFooter}`;
  }

  // Function to generate ECDSA key pair using Web Crypto API
  const generateKeyPair = async () => {
    try {
      // Check if crypto.subtle is available
      if (!crypto || !crypto.subtle) {
        throw new Error("Web Crypto API (crypto.subtle) is not available. Ensure the page is loaded in a secure context (HTTPS or localhost).");
      }

      // Generate the key pair using Web Crypto API
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        true, // Extractable
        ["sign", "verify"] // Key usages
      );

      // Export the public key in SPKI format (binary)
      const publicKeyBinary = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      // Export the private key in PKCS#8 format (binary)
      const privateKeyBinary = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      // Convert to PEM format
      const publicKeyPem = toPem(publicKeyBinary, "public");
      const privateKeyPem = toPem(privateKeyBinary, "private");

      // Convert PEM strings to Base64 (matching Node.js output)
      const base64PublicKey = Buffer.from(publicKeyPem).toString("base64");
      const base64PrivateKey = Buffer.from(privateKeyPem).toString("base64");

      return {
        publicKey: base64PublicKey,
        privateKey: base64PrivateKey,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate key pair: ${error.message}`);
      } else {
        throw new Error("Failed to generate key pair: Unknown error");
      }
    }
  };

  useEffect(() => {
    const generateKeys = async () => {
      try {
        const keys = await generateKeyPair();
        setKeyPair(keys);
        setKeyPairError(null);
      } catch (error) {
        console.error("Failed to generate key pair:", error);
        setKeyPairError((error as Error).message);
      }
    };
    generateKeys();
  }, []);

  useEffect(() => {
    if (!email || !otpMethod || !fromPage || !["login"].includes(fromPage)) {
      router.replace("/auth/login");
    }
  }, [email, otpMethod, router, fromPage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      console.log("Updated code array:", newCode);

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
    console.log("code array:", code);
    console.log("codeString:", codeString);
    console.log("codeString length:", codeString.length);
    console.log("Regex test:", /^\d{6}$/.test(codeString));
    console.log("keyPair:", keyPair);

    if (!codeString || !email || !/^\d{6}$/.test(codeString) || !keyPair) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponseMessage(null);

    try {
      const payload = { 
        email, 
        code: codeString,
      };
      const session_key: string = keyPair.publicKey;

      const customHeaders = {
        "x-escrow_api-session_key": session_key,
      };
      const result = await AuthService.validateLogin(payload, customHeaders);
      setIsLoading(false);

      if (result.success) {
        Cookies.set("x-escrow_api-key", keyPair.privateKey, { expires: 1, secure: true });
        Cookies.set("x-escrow_api-session_key", keyPair.publicKey, { expires: 1, secure: true });
        Cookies.set("sessionData", JSON.stringify(result.data.user_data), { expires: 1, secure: true });
        Cookies.set("accessToken", result.data.access_token, { expires: 1, secure: true });

        dispatch(setAuth({
          user: result.data.user_data,
          token: result.data.access_token
        }));

        setResponseMessage({ success: true, message: "Login successful" });
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setResponseMessage({ success: false, message: result.message });
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
    if (canResend && email && otpMethod) {
      setIsResendLoading(true); // Use the new state
      setResponseMessage(null);

      try {
        const payload = { email, code_type: otpMethod };
        const result = await AuthService.resendCode(payload);
        setIsResendLoading(false); // Use the new state
        
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
        setIsResendLoading(false); // Use the new state
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

  if (keyPairError) {
    return (
      <div className="bg-primary-dark-green p-4" style={{ paddingTop: "90px", minHeight: "100vh" }}>
        <Header />
        <div className="form-card bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Error</h1>
          <p className="text-red-500 text-center">{keyPairError}</p>
          <p className="text-gray-600 text-center mt-4">
            Please ensure this page is loaded over HTTPS or on localhost, then refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-dark-green p-4" style={{ paddingTop: "80px", minHeight: "100vh" }}>
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
                className="w-12 h-12 text-center border border-gray-300 rounded-md focus:border-primary-dark-green focus:outline-none"
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
              className={`text-blue-500 hover:underline ${(!canResend || isResendLoading) ? "pointer-events-none text-gray-400" : ""}`} // Use isResendLoading
              disabled={!canResend || isResendLoading} // Use isResendLoading
            >
              {canResend ? 
                (isResendLoading ? "Resending..." : "Resend Code") : 
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
          div {
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}