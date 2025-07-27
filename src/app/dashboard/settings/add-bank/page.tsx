"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme"; // Adjust path based on your project structure
import darkTheme from "@/lib/theme"; // Adjust path if darkTheme is exported separately
import { WalletManagerService } from "@/services/Wallet_Manager"; // Import your service
import ApiResponseMessage from "@/components/UI/ApiResponseMessage"; // Import your response message component
import { ApiResponseHandler } from "@/lib/ApiResponseHandler"; // Import your error handler
import Cookies from "js-cookie";
import { Autocomplete } from "@mui/material";


interface Bank {
  name: string;
  slug: string;
  code: string;
  country: string;
  nibss_bank_code: string;
}

export default function AddBankAccountPage() {
  const [bank, setBank] = useState<string | null>(null);
  const [wallet_id, setWalletId] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For submit button loading state
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);
  const router = useRouter();

  //Fetch User Wallet ID 
  useEffect(() => {
    try {
      const userCookie = Cookies.get("sessionData");
      console.log(`User`)
      if(userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        const country = userData?.country;
        const wallets = userData?.user_wallets || [];

        // Find default wallet by matching currency_id with country_id
        let defaultWallet = wallets.find(
          (w: any) => w.currency_id === country?.country_id
        );
        setWalletId(defaultWallet?.wallet_id)
      }
    } catch(error) {
      console.log(error);
    }
  })
  // Fetch banks on component mount
  useEffect(() => {
    
    const fetchBanks = async () => {
      setResponseMessage(null);
      try {
        console.log("Banks fetched successfully:")
        const result = await WalletManagerService.getAllBanks(); // Assuming endpoint for fetching banks
        console.log("Banks fetched successfully:", result)
        if (result.success && result.data) {
          setBanks(result.data);
          console.log("Banks fetched successfully:", result)
        } else {
          setResponseMessage({ success: false, message: result.message });
        }
      } catch (error: any) {
        const errorResult = ApiResponseHandler.handleError(error);
        setResponseMessage({ ...errorResult, isNetworkError: !error.response });
      }
      setTimeout(() => setResponseMessage(null), 5000); // Clear message after 5 seconds
    };
    fetchBanks();
  }, []);

  // Handle account number input (restrict to numeric values)
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) { // Assuming 10-digit account number
      setAccountNumber(value);
    }
  };

  // Handle bank account verification
  const handleVerifyAccount = async () => {
    if (!bank || !accountNumber) {
      setResponseMessage({ success: false, message: "Please select a bank and enter an account number" });
      setTimeout(() => setResponseMessage(null), 5000);
      return;
    }
    setIsVerifying(true);
    setResponseMessage(null);
    try {

      const result = await WalletManagerService.verifyBankDetails({
        bank_code: bank,
        account_number: accountNumber,
      });
      if (result.success && result.data) {
        setAccountName(result.data.account_name || "");
        setResponseMessage({ success: true, message: "Account verified successfully" });
      } else {
        setAccountName("");
        setResponseMessage({ success: false, message: result.message });
      }
    } catch (error: any) {
      const errorResult = ApiResponseHandler.handleError(error);
      setResponseMessage({ ...errorResult, isNetworkError: !error.response });
      setAccountName("");
    } finally {
      setIsVerifying(false);
    }
    setTimeout(() => setResponseMessage(null), 5000);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!bank || !accountNumber || !accountName) {
      setResponseMessage({ success: false, message: "Please complete all required fields" });
      setTimeout(() => setResponseMessage(null), 5000);
      return;
    }
    setIsLoading(true);
    setResponseMessage(null);
    try {
      const selectedBank = banks.find((b) => b.code === bank);
      let payload: {
        bank_name: string;
        account_number: string;
        bank_code: string;
        is_default?: boolean;
    } = {
      bank_name: selectedBank?.name || "",
      account_number: accountNumber,
      bank_code: bank,
};

if (isDefault) {
  payload.is_default = true; // ✅ No more error
}
      const result = await WalletManagerService.addBankDetails(payload, wallet_id);
      if (result.success) {
        setResponseMessage({ success: true, message: "Bank account added successfully" });
        setTimeout(() => {
          router.refresh(); // Redirect to bank accounts list
        }, 2000);
      } else {
        setResponseMessage({ success: false, message: result.message });
      }
    } catch (error: any) {
      const errorResult = ApiResponseHandler.handleError(error);
      setResponseMessage({ ...errorResult, isNetworkError: !error.response });
    } finally {
      setIsLoading(false);
    }
    setTimeout(() => setResponseMessage(null), 5000);
  };

  // Handle cancel (reset form)
  const handleCancel = () => {
    setBank("");
    setAccountNumber("");
    setAccountName("");
    setIsDefault(false);
    setResponseMessage(null);
  };

  // Hook to determine theme based on system preference
  const getTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return darkTheme;
    }
    return theme;
  };

  return (
    <ThemeProvider theme={getTheme()}>
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", minHeight: "100vh" }}>
        {/* Header with Back Icon */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()} sx={{ color: "text.primary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              Add Bank Account
            </Typography>
          </Stack>
        </Stack>

        {/* Form Section */}
        <Stack spacing={3}>
          <Autocomplete
  options={banks}
  getOptionLabel={(option) => `${option.name} (${option.slug})`}
  isOptionEqualToValue={(option, value) => option.code === value.code}
  value={banks.find((b) => b.code === bank) || null}
  onChange={(event, newValue) => setBank(newValue?.code || "")}
  openOnFocus // ✅ Show all banks when input is focused (even before typing)
  filterOptions={(options, state) => {
    const input = state.inputValue.trim().toLowerCase();
    // ✅ If no input, show all banks
    if (input.length === 0) return options;
    // ✅ Filter as soon as user types one character
    return options.filter((option) =>
      option.name.toLowerCase().includes(input)
    );
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Bank"
      variant="outlined"
      sx={{
        bgcolor: "background.paper",
        borderRadius: "0.5rem",
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
      }}
    />
  )}
/>


          <Stack direction="row" alignItems="center" spacing={2}>
            <TextField
              label="Bank Account Number"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              variant="outlined"
              sx={{
                flex: 1,
                bgcolor: "background.paper",
                borderRadius: "0.5rem",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "primary.main",
                color: "secondary.main",
                borderRadius: "0.75rem",
                padding: "0.75rem 1.5rem",
                "&:hover": { bgcolor: "#14352B" },
                "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
              }}
              onClick={handleVerifyAccount}
              disabled={isVerifying}
            >
              {isVerifying ? <CircularProgress size={24} color="inherit" /> : "Verify"}
            </Button>
          </Stack>
          <TextField
            label="Bank Account Name"
            value={accountName}
            InputProps={{ readOnly: true }}
            variant="outlined"
            sx={{
              bgcolor: "background.paper",
              borderRadius: "0.5rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
            label="Set as default bank account"
            sx={{ color: "text.secondary" }}
          />

          {/* API Response Message */}
          {responseMessage && (
            <ApiResponseMessage
              success={responseMessage.success}
              message={responseMessage.message}
              onClose={() => setResponseMessage(null)}
              isNetworkError={responseMessage.isNetworkError}
            />
          )}

          {/* Notice Box */}
          <Box sx={{ bgcolor: "rgba(26, 60, 52, 0.05)", p: 2, borderRadius: "0.5rem" }}>
            <Typography variant="body2" sx={{ color: "#1A3C34", fontWeight: 600, mb: 1 }}>
              <strong>Note:</strong>
            </Typography>
            <ul style={{ margin: "0", paddingLeft: "20px", color: "black" }}>
              <li>Check to ensure that the account information is accurate</li>
              <li>Withdrawal transactions will encounter errors if the account information is not accurate</li>
            </ul>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              sx={{
                flex: 1,
                color: "text.primary",
                borderColor: "grey.300",
                textTransform: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                "&:hover": { borderColor: "grey.400", bgcolor: "grey.100" },
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: "primary.main",
                color: "secondary.main",
                textTransform: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                "&:hover": { bgcolor: "#14352B" },
                "&:active": { bgcolor: "#102520" },
                "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
              }}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}