"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength rules
  const isLongEnough = newPassword.length >= 12;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

  const isPasswordValid =
    isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return (
    <div className="max-w-md mx-auto mt-10  shadow rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold">Change Password</h2>

      {/* Old Password */}
      <div>
        <label className="block font-medium mb-1">Old Password</label>
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Enter old password"
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-500"
            onClick={() => setShowOld(!showOld)}
          >
            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block font-medium mb-1">New Password</label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full border rounded px-4 py-2 pr-10 focus:outline-none ${
              isPasswordValid
                ? "border-green-500 focus:ring-green-400"
                : "border-red-500 focus:ring-red-400"
            }`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-500"
            onClick={() => setShowNew(!showNew)}
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password rules */}
        {!isPasswordValid && (
          <div className="mt-2 text-sm text-red-500 space-y-1">
            <p className="font-semibold">Please add all necessary characters:</p>
            <ul className="ml-4 list-disc">
              <li className={isLongEnough ? "text-gray-400" : "text-red-600"}>Minimum 12 characters</li>
              <li className={hasUppercase ? "text-gray-400" : "text-red-600"}>One uppercase character</li>
              <li className={hasLowercase ? "text-gray-400" : "text-red-600"}>One lowercase character</li>
              <li className={hasSpecialChar ? "text-gray-400" : "text-red-600"}>One special character</li>
              <li className={hasNumber ? "text-gray-400" : "text-red-600"}>One number</li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block font-medium mb-1">Confirm New Password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Re-enter new password"
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-500"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition"
        disabled={!isPasswordValid || confirmPassword !== newPassword}
      >
        Change Password
      </button>
    </div>
  );
}
