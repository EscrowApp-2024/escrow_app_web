"use client";

import { SetStateAction, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme"; // Adjust path based on your project structure
import darkTheme from "@/lib/theme"; // Adjust path if darkTheme is exported separately

// Mock data (replace with real API data)
const user = { firstName: "Godwin", availableBalance: 10000 }; // NGN
const bankAccounts = [
  {
    id: 1,
    bankName: "Guaranty Trust Bank",
    accountNumber: "****8333",
    accountName: "Salawu Abdulazeez AyoMide",
    isDefault: true,
  },
  {
    id: 2,
    bankName: "Access Bank",
    accountNumber: "****8674",
    accountName: "Abdulazeez AyoMide Salawu",
    isDefault: false,
  },
];

// Hook to determine theme based on system preference
const getTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return darkTheme;
  }
  return theme;
};

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [selectedBank, setSelectedBank] = useState(bankAccounts.find((acc) => acc.isDefault)?.id || "");
  const [openConfirm, setOpenConfirm] = useState(false);
  const router = useRouter();

  const handleAmountChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    setAmount(value);
    if (parseFloat(value) > user.availableBalance) {
      setError(`Not Enough Money: Balance is ${user.availableBalance} NGN`);
    } else {
      setError("");
    }
  };

  const handleBankSelect = (bankId: SetStateAction<string | number>) => {
    setSelectedBank(bankId);
  };

  const handleContinue = () => {
    if (!selectedBank) {
      setError("Please select a bank account.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (parseFloat(amount) > user.availableBalance) {
      setError(`Not Enough Money: Balance is ${user.availableBalance} NGN`);
      return;
    }
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    console.log("Transaction confirmed:", { amount, selectedBank });
    setOpenConfirm(false);
  };

  const handleClose = () => {
    setOpenConfirm(false);
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
              Withdraw NGN
            </Typography>
          </Stack>
        </Stack>

        {/* Amount Input - Changed to Number Input */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Amount to withdraw
          </Typography>
          <TextField
            type="number"
            variant="outlined"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            InputProps={{
              sx: {
                borderRadius: "0.5rem",
                bgcolor: "background.paper",
                border: "1px solid #e0e0e0",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:focus-within": {
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.1)",
                },
              },
            }}
            sx={{ "& .MuiInputBase-input": { fontSize: "1.5rem", color: "text.primary", p: "0.75rem" } }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Balance: {user.availableBalance} NGN
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>

        {/* Bank Account Section */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
              To bank account
            </Typography>
            <Link href="/dashboard/add-bank" passHref>
              <Button
                variant="text"
                startIcon={<AddIcon />}
                sx={{ color: "primary.main", textTransform: "none", fontWeight: 600 }}
              >
                Add Bank
              </Button>
            </Link>
          </Stack>
          {bankAccounts.length > 0 ? (
            <RadioGroup value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
              {bankAccounts.map((account) => (
                <Box
                  key={account.id}
                  onClick={() => handleBankSelect(account.id)} // Make entire box clickable
                  sx={{
                    bgcolor: "rgba(0, 0, 0, 0.03)", // Dimmed background (dark white)
                    p: 2,
                    borderRadius: "0.5rem",
                    mb: 1,
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer", // Indicate the box is clickable
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.05)", // Slight hover effect
                    },
                  }}
                >
                  <Stack>
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
                      {account.bankName} (****{account.accountNumber.slice(-4)})
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {account.accountName}
                    </Typography>
                  </Stack>
                  <FormControlLabel
                    value={account.id}
                    control={<Radio sx={{ color: "primary.main" }} />}
                    label={account.isDefault ? "Default" : ""}
                    sx={{ "& .MuiTypography-root": { fontSize: "0.875rem", color: "primary.main" } }}
                  />
                </Box>
              ))}
            </RadioGroup>
          ) : (
            <Box
              sx={{
                bgcolor: "background.paper",
                p: 3,
                borderRadius: "0.5rem",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                No bank account added yet
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Notice Box - Each Sentence as Unordered List Item */}
        <Box
          sx={{
            bgcolor: "rgba(26, 60, 52, 0.05)", // Light tint of primary-dark-green
            p: 2,
            borderRadius: "0.5rem",
            mb: 4,
          }}
        >
          <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
            Note:
          </Typography>
          <ul style={{ margin: "0", paddingLeft: "20px", color: "text.secondary" }}>
            <li>Check the withdrawal details above to verify that it is correct</li>
            <li>Third party withdrawal is not allowed</li>
            <li>Estimated time to complete: a few seconds</li>
          </ul>
        </Box>

        {/* Continue Button */}
        <Button
          variant="contained"
          sx={{
            bgcolor: "primary.main",
            color: "secondary.main",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "0.75rem",
            padding: "0.75rem 1.5rem",
            "&:hover": { bgcolor: "#14352B" },
            "&:active": { bgcolor: "#102520" },
            "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
          }}
          fullWidth
          onClick={handleContinue}
        >
          Continue
        </Button>

        {/* Confirmation Dialog */}
        <Dialog open={openConfirm} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ bgcolor: "primary.main", color: "secondary.main", textAlign: "center" }}>
            Confirm Transaction
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ textAlign: "center", mb: 2, color: "text.primary" }}>
              Withdraw NGN
            </Typography>
            <Typography variant="h4" sx={{ textAlign: "center", mb: 3, color: "text.primary" }}>
              {amount} NGN
            </Typography>
            <Stack spacing={2}>
              <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
                Transaction Info
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  <strong>Withdrawal method:</strong> Bank transfer
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  <strong>Bank name:</strong> {bankAccounts.find((acc) => acc.id === selectedBank)?.bankName}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  <strong>Bank account name:</strong>{" "}
                  {bankAccounts.find((acc) => acc.id === selectedBank)?.accountName}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  <strong>Bank account number:</strong>{" "}
                  {bankAccounts.find((acc) => acc.id === selectedBank)?.accountNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  <strong>Transfer fees:</strong> Recipient pays
                </Typography>
              </Stack>
              <Box
                sx={{
                  bgcolor: "rgba(26, 60, 52, 0.05)",
                  p: 2,
                  borderRadius: "0.5rem",
                  mt: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
                  Note:
                </Typography>
                <ul style={{ margin: "0", paddingLeft: "20px", color: "text.secondary" }}>
                  <li>Check the withdrawal details above to verify that it is correct</li>
                  <li>Third party withdrawal is not allowed</li>
                  <li>Estimated time to complete: a few seconds</li>
                </ul>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 2 }}>
            <Button
              onClick={handleClose}
              sx={{
                flex: 1,
                bgcolor: "grey.200",
                color: "text.primary",
                textTransform: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                "&:hover": { bgcolor: "grey.300" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              sx={{
                flex: 1,
                bgcolor: "primary.main",
                color: "secondary.main",
                textTransform: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                "&:hover": { bgcolor: "#14352B" },
                "&:active": { bgcolor: "#102520" },
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}