"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Button,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme";
import darkTheme from "@/lib/theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { JSX } from "react/jsx-runtime";
import Cookies from "js-cookie";
import { WalletManagerService } from "@/services/Wallet_Manager";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";
// Define the Payment Method interface
interface PaymentMethod {
  value: string;
  label: string;
  fee: string;
  icon: JSX.Element;
}

// Helper to get currency symbol from code
const getCurrencyIcon = (currencyCode: string): string => {
    switch (currencyCode?.toUpperCase()) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "$";
    }
};

// Hook to determine theme based on system preference
const getTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return darkTheme;
  }
  return theme;
};

const FundWallet: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string>("");
  const [currencySymbol, setCurrencySymbol] = useState<string>("");
  const [userDetails, setUserdetails] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);


  const router = useRouter();

  // List of payment methods "card", "bank_transfer", "pay_with_bank"
  const paymentMethods: PaymentMethod[] = [
    {
      value: "bank_transfer",
      label: "Direct Bank Transfer",
      fee: "₦100.00",
      icon: <AccountBalanceIcon sx={{ color: "#FFFFFF", fontSize: "1.5rem" }} />,
    },
    {
      value: "pay_with_bank",
      label: "Pay with Bank",
      fee: "₦100.00",
      icon: <AccountBalanceIcon sx={{ color: "#FFFFFF", fontSize: "1.5rem" }} />,
    },
    {
      value: "card",
      label: "NGN Debit/Credit Card (Korapay)",
      fee: "₦70.00",
      icon: <CreditCardIcon sx={{ color: "#FFFFFF", fontSize: "1.5rem" }} />,
    },
  ];

  // Get currency code and wallet from user session (cookie)
      useEffect(() => {
          try {
              const userCookie = Cookies.get("sessionData");
              if (userCookie) {
                  const userData = JSON.parse(decodeURIComponent(userCookie));
                  const country = userData?.country;
                  const wallets = userData?.user_wallets || [];
                  
  
                  // Find default wallet by matching currency_id with country_id
                  let defaultWallet = wallets.find(
                      (w: any) => w.currency_id === country?.country_id
                  );
  
                  let code = defaultWallet.currency_code;
                  let symbol = getCurrencyIcon(defaultWallet.currency_code);
                  // If needed, you can use defaultWallet.wallet_id for API calls
                  setUserdetails({
                      firstName: userData?.firstName,
                      lastName: userData?.lastName,
                      wallet_id: defaultWallet?.wallet_id
                  })
                  setCurrencyCode(code);
                  setCurrencySymbol(symbol);
              }
          } catch(error: any) {
            console.log(error);
          }
        
      }, [router]);

      // Parallel fetch for balances and transactions
      useEffect(() => {
          if (userDetails) {
            Promise.all([
              fetchBalances(userDetails.wallet_id),
          ]);
          }
      }, [userDetails?.wallet_id]);

  // Fetch functions
      const fetchBalances = async (walletId: string) => {
        setResponseMessage(null);
        try {
              const result = await WalletManagerService.getWalletBalances(walletId);
              setIsLoading(false);
              setResponseMessage(result);
  
              if (result.success && result.data) {
                  setAvailableBalance(result.data.available_balance || 0);
              } else {
                  setAvailableBalance(null);
              }
        } catch (error: any) {
            setIsLoading(false);
            const errorResult = ApiResponseHandler.handleError(error);
            setResponseMessage({ ...errorResult, isNetworkError: !error.response });
            setAvailableBalance(null);
        }
          setTimeout(() => setResponseMessage(null), 3000);
      };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric values with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleProceed = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setResponseMessage({ success: false, message: "Please enter a valid amount." });
      return;
    }
    if (!userDetails.wallet_id || !currencyCode) {
      setResponseMessage({ success: false, message: "Required wallet or currency information is missing." });
      return;
    }

    // Construct payload
    const payload = {
      amount: parseFloat(amount),
      currency: currencyCode,
      channel: paymentMethod as "bank_transfer" | "card" | "pay_with_bank",
    };

    setIsLoading(true);
    setResponseMessage(null);

    try {
      const result = await WalletManagerService.fundWallet(payload, userDetails.wallet_id);
      setIsLoading(true);

      if (result.success) {
        window.location.href = result.data;
        return; 
      } else {
        setIsLoading(false);
        setResponseMessage({ success: false, message: result.message });
      }
    } catch (error: any) {
      setIsLoading(false);
      setResponseMessage({
        success: false,
        message: "An Error Occured while processing Wallet Funding",
        isNetworkError: true,
      });
    }

    setTimeout(() => setResponseMessage(null), 5000);
  };

  return (
    <ThemeProvider theme={getTheme()}>
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          p: { xs: 2, sm: 3 },
        }}
        style={{ paddingBottom: "80px" }}
      >
        {responseMessage && (
          <ApiResponseMessage
            success={responseMessage.success}
            message={responseMessage.message}
            onClose={() => setResponseMessage(null)}
            isNetworkError={responseMessage.isNetworkError}
          />
        )}
        {/* Header with Back Icon */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()} sx={{ color: "text.primary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A3C34" }}>
              Fund Wallet
            </Typography>
          </Stack>
        </Stack>

        {/* Amount Input Section */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Amount to Fund
          </Typography>
          <TextField
            type="number"
            variant="outlined"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            InputProps={{
              startAdornment: (
                <Typography sx={{ color: "text.primary", mr: 1, fontSize: "1.5rem" }}>{currencySymbol}</Typography>
              ),
              sx: {
                borderRadius: "0.5rem",
                bgcolor: "background.paper",
                border: "1px solid #e0e0e0",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:focus-within": {
                  borderColor: "#1A3C34",
                  boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.1)",
                },
              },
            }}
            sx={{ "& .MuiInputBase-input": { fontSize: "1.5rem", color: "text.primary", p: "0.75rem" } }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Balance: {availableBalance !== null ? availableBalance : "Loading..."} {currencyCode}
          </Typography>
        </Stack>

        {/* Select Payment Type Section */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Select Payment Type
            </Typography>
          </Stack>
          <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
            {paymentMethods.map((method) => (
              <Box
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                sx={{
                  bgcolor: "background.paper",
                  p: 2,
                  borderRadius: "0.5rem",
                  mb: 1,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                  },
                  cursor: "pointer",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: "#1A3C34",
                      borderRadius: "0.4rem",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {method.icon}
                  </Box>
                  <Stack>
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
                      {method.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Fee: {method.fee}
                    </Typography>
                  </Stack>
                </Stack>
                <FormControlLabel
                  value={method.value}
                  control={<Radio sx={{ color: "#1A3C34", "&.Mui-checked": { color: "#1A3C34" } }} />}
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            ))}
          </RadioGroup>
        </Stack>

        {/* Note Section */}
        <Box
          sx={{
            bgcolor: "rgba(26, 60, 52, 0.05)",
            p: 2,
            borderRadius: "0.5rem",
            mb: 4,
          }}
        >
          <Typography variant="body2" sx={{ color: "#1A3C34", fontWeight: 600, mb: 1 }}>
            Note:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "black" }}>
            <li>Check the funding details above to verify that it is correct</li>
            <li>Third party funding is not allowed</li>
            <li>Estimated time to complete: a few seconds</li>
          </ul>
        </Box>

        {/* Proceed Button */}
        <Button
          variant="contained"
          onClick={handleProceed}
          disabled={isLoading}
          sx={{
            bgcolor: "#1A3C34",
            color: "#FFFFFF",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "0.75rem",
            padding: "0.75rem 1.5rem",
            "&:hover": { bgcolor: "#14352B" },
            "&:active": { bgcolor: "#102520" },
            "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
            "&:disabled": { bgcolor: "#A9A9A9" },
          }}
          fullWidth
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : null}
          {isLoading ? "Processing..." : "Proceed"}
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default FundWallet;