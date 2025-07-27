"use client";


import { useState, useCallback, useRef, useEffect } from 'react';
import NavigationMenu from "@/components/UI/navigationMenu";
import BottomSheetModal from '@/components/BottomSheetModal';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector, useDispatch } from "react-redux";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { AuthService } from "@/services/Auth_Session_Manager";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";
import { setPendingPhone } from "@/store/authSlice";


import { RootState } from "@/store/store";
import Cookies from "js-cookie";



export default function PersonalDetails() {
  const [firstName, setFirstName] = useState<string>(" ");
  const [lastName, setLastName] = useState<string>(" ");
  const [dialCode, setDialCode] = useState<string>(" ");
  const [phoneNumber, setPhoneNumber] = useState<string>(" ");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [newPhone, setNewPhone] = useState<string>(" ");;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [responseMessage, setResponseMessage] = useState<{
      success: boolean;
      message: string;
      isNetworkError?: boolean;
    } | null>(null);
  
  const dispatch = useDispatch();
  const { pendingPhone } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const getUserDetails = localStorage.getItem("user_session_data");
    const userCookie = Cookies.get("sessionData") || null;
    if(userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setDialCode(userData.country.dialing_code);
    }
    
    if (getUserDetails) {
      const parsedDetails = JSON.parse(getUserDetails);

      setFirstName(parsedDetails.first_name);
      setLastName(parsedDetails.last_name);
      setPhoneNumber(parsedDetails.mobile_number);
    }
  }, []);


  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", file);
      // TODO: Add image preview or upload logic here
    }
  };

  const handleUpdateDetails = () => {
    alert(`Updated: First Name: ${firstName}, Last Name: ${lastName}, Phone: ${phoneNumber}`);
  };

  const handleChangePhone = () => {
    setIsBottomSheetOpen(true);
    setModalStep(1);
    setMessage("");
    setNewPhone("");
    setOtp(["", "", "", "", "", ""]);
  };

  const handleProceed = async () => {
  if (!newPhone.trim()) {
    setMessage("Please enter a valid phone number.");
    return;
  }

  try {
    const payload = {
      mobile_number: `${dialCode}${newPhone}` // Combine dialCode and newPhone
    };

    const result = await AuthService.changeMobileNumber(payload);

    if (result.success) {
      dispatch(setPendingPhone(payload.mobile_number));
      setModalStep(2);
      setMessage("");
    } else {
      setMessage(result.message);
    }
  } catch (error: any) {
    const errorResult = ApiResponseHandler.handleError(error);
    setResponseMessage({ ...errorResult, isNetworkError: !error.response });
  }
};

  const handleOtpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const val = e.target.value.replace(/\D/g, "");
      if (val.length <= 1) {
        const updated = [...otp];
        updated[index] = val;
        setOtp(updated);
        if (val && index < 5) otpRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleOtpBackspace = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const updated = [...otp];
        updated[index - 1] = "";
        setOtp(updated);
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleSubmitOtp = async () => {
    const valid = otp.every((digit) => digit !== "");

    const code = otp.join('');

    if(code.length < 6) {
     setMessage("Please enter the full 6-digit OTP.");
     return;
    }
    
    try {
        const payload = {
          mobile_number: pendingPhone,
          code: code
        }
        const result = await AuthService.validateMobileChange(payload);

        if(result.success) {
          let userSessionData = JSON.parse(localStorage.getItem("user_session_data") || "{}");
          userSessionData.mobile_number = pendingPhone;
          localStorage.setItem("user_session_data", JSON.stringify(userSessionData))
          
          setMessage(result.message);
          setTimeout(() => { setIsBottomSheetOpen(false); /** Refresh Page*/ window.location.reload()}, 1200);
        } else {
         setMessage(result.message);
        }
    } catch(error: any) {
        const errorResult = ApiResponseHandler.handleError(error);
        setResponseMessage({ ...errorResult, isNetworkError: !error.response });  
    }
  };

  return (
    <div className="min-h-screen bg-white px-5 pt-4 pb-10 relative text-black">
        {responseMessage && (
                <ApiResponseMessage
                  success={responseMessage.success}
                  message={responseMessage.message}
                  onClose={() => setResponseMessage(null)}
                  isNetworkError={responseMessage.isNetworkError}
                />
        )}
      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-3 mt-1 mb-5">
        <IconButton onClick={() => history.back()} size="small">
          <ArrowBackIcon className="text-black" />
        </IconButton>
        <h3 className="text-xl font-large text-black">Personal details</h3>
      </div>

      {/* Profile Photo Upload */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-xl font-semibold text-white select-none overflow-hidden">
          {initials}
        </div>

        <input
          type="file"
          id="profile-photo-upload"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <input
            type="text"
            value={firstName}
            readOnly
            className="w-full rounded-full px-4 py-3 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text"
            value={lastName}
            readOnly
            className="w-full rounded-full px-4 py-3 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Phone Number</label>
          <div className="flex items-center gap-3">
            <input
              type="tel"
              value={phoneNumber}
              readOnly
              className="w-full rounded-full px-4 py-3 bg-gray-100 text-black focus:outline-none"
            />
            <button
              onClick={handleChangePhone}
              className="text-sm text-blue-600 underline"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <BottomSheetModal isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} height="400px">
  {/* Step 1: Enter New Phone */}
  {modalStep === 1 && (
  <div className="w-full mt-0">
    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4 mx-auto">
      <div className="w-8 h-8 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center text-lg">
        !
      </div>
    </div>

    <h3 className="text-lg font-semibold text-center text-black mb-2">Change Phone Number</h3>
    <p className="text-center text-gray-500 text-sm mb-4">
      Enter your new phone number and proceed to verify.
    </p>

    <div className="flex items-center gap-2">
      <span className="p-3 bg-gray-100 rounded-l-full border border-gray-300 text-black font-semibold">
        {dialCode}
      </span>
      <input
        type="tel"
        placeholder="801 234 5678"
        value={newPhone}
        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))} // Only allow digits
        className="w-full p-3 border border-gray-300 rounded-r-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    {message && <p className="text-red-500 text-sm mt-2">{message}</p>}

    <button
      onClick={handleProceed}
      className="w-full bg-green-900 text-white py-3 mt-5 rounded-full hover:bg-green-800 transition"
    >
      Proceed
    </button>
  </div>
)}

  {/* Step 2: OTP Verification */}
  {modalStep === 2 && (
    <div className="w-full mt-0">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4 mx-auto">
        <div className="w-8 h-8 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center text-lg">
          🔒
        </div>
      </div>

      <h3 className="text-lg font-semibold text-center text-black mb-2">Verify OTP</h3>
      <p className="text-center text-gray-500 text-sm mb-4">
        Enter the 6-digit OTP sent to your new phone number.
      </p>

      <div className="flex justify-center gap-2 mt-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            ref={(el) => (otpRefs.current[index] = el)}
            autoFocus={index === 0}
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpBackspace(e, index)}
            className="w-10 h-12 text-center border rounded-lg text-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>

      {message && <p className="text-center text-sm mt-4 text-red-500">{message}</p>}

      <button
        onClick={handleSubmitOtp}
        className="w-full bg-green-900 text-white py-3 mt-5 rounded-full hover:bg-green-800 transition"
      >
        Submit
      </button>
    </div>
  )}
</BottomSheetModal>

      {/* Reused Navigation Menu */}
        <NavigationMenu />
    </div>
  );
}

















