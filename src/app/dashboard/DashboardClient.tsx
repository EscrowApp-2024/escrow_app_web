"use client";
import Link from "next/link";
import {
  Avatar,
  Stack,
  Typography,
  IconButton,
  Badge,
  Button,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentIcon from "@mui/icons-material/Payment";
import HandshakeIcon from "@mui/icons-material/Handshake";
import NavigationMenu from "@/components/UI/navigationMenu";
import dynamic from "next/dynamic";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { WalletManagerService } from "@/services/Wallet_Manager";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";

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

export default function DashboardClient() {
    const [currencyCode, setCurrencyCode] = useState<string>("");
    const [currencySymbol, setCurrencySymbol] = useState<string>("");
    const [userDetails, setUserdetails] = useState<any | null>(null)
    const [availableBalance, setAvailableBalance] = useState<string>("");
    const [lockedBalance, setLockedBalance] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [responseMessage, setResponseMessage] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState<boolean>(true);
    const [transactionsError, setTransactionsError] = useState<string>("");

    // Fetch functions
    const fetchBalances = async (walletId: string) => {
        setIsLoading(true);
        setResponseMessage(null);
        try {
            const result = await WalletManagerService.getWalletBalances(walletId);
            setIsLoading(false);
            setResponseMessage(result);

            if (result.success && result.data) {
                setAvailableBalance(result.data.available_balance);
                setLockedBalance(result.data.locked_balance);
            } else {
                setAvailableBalance("");
                setLockedBalance("");
            }
        } catch (error: any) {
            setIsLoading(false);
            const errorResult = ApiResponseHandler.handleError(error);
            setResponseMessage({ ...errorResult, isNetworkError: !error.response });
            setAvailableBalance("");
            setLockedBalance("");
        }
        setTimeout(() => setResponseMessage(null), 3000);
    };

    const fetchTransactions = async (walletId: string) => {
        setTransactionsLoading(true);
        setTransactionsError("");
        try {
            const result = await WalletManagerService.walletRecentTransactions(walletId);
            setTransactionsLoading(false);
            if (result.success && Array.isArray(result.data)) {
                setTransactions(result.data);
            } else {
                setTransactions([]);
                setTransactionsError(result.error || "Failed to load transactions");
            }
        } catch (error: any) {
            setTransactionsLoading(false);
            const errorResult = ApiResponseHandler.handleError(error);
            setTransactionsError(errorResult.message || "Error fetching transactions");
        }
    };

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
    }, []);
    
    // Parallel fetch for balances and transactions
    useEffect(() => {
        if (userDetails?.wallet_id) {
            Promise.all([
                fetchBalances(userDetails.wallet_id),
                fetchTransactions(userDetails.wallet_id)
            ]);
        }
    }, [userDetails?.wallet_id]);

      // Helper to render balance text
      const renderBalance = (balance: string, isError: boolean = false) => {
        if (isLoading) return "Loading balance...";
        if (isError) return `${currencySymbol} _ _ _ _`;
        if (balance === "") return `${currencySymbol} _ _ _ _`;
        return `${currencySymbol} ${balance}`;
      };
  
    // Helper for transaction amount formatting
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date
            .toLocaleString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
            .replace(",", "");
    };

  return (
    <div className="min-h-screen bg-background text-foreground p-4" style={{ paddingBottom: "80px" }}>
      {/* Top Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.5, bgcolor: "background.default", mb: 1, mt: 0}}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : ""}
            src={userDetails?.profileImage || "/placeholder-profile.jpg"}
            sx={{ width: 36, height: 36 }}
          />
          <Stack>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "text.primary", fontSize: "1.1rem" }}
            >
              Hello, {userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "User"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              Welcome back! 😊
            </Typography>
          </Stack>
        </Stack>
        <IconButton>
          <Badge badgeContent={2} color="error">
            <NotificationsIcon sx={{ color: "text.primary", fontSize: "1.3rem" }} />
          </Badge>
        </IconButton>
      </Stack>

      {/* Wallet Balance Cards (Client-side) */}
      <Box sx={{ mb: 1, position: "relative", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            overflowX: "auto", // Enable horizontal scroll/swipe
            whiteSpace: "nowrap", // Prevent wrapping
            transition: "transform 0.3s ease-in-out",
            transform: `translateX(0%)`,
            scrollbarWidth: "none", // Hide scrollbar for Firefox
            "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for Chrome/Safari
          }}
        >
          {/* Available Balance Card */}
          <Box
            sx={{
              minWidth: "100%",
              maxWidth: "100%",
              display: "inline-block",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "#FFFFFF",
              borderRadius: "0.8rem",
              p: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              flexShrink: 0,
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
              pl: 2,
              minHeight: "120px",
              mr: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "black", mb: 1, fontWeight: 500, fontSize: "0.9rem" }}
            >
              Available Balance
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ pl: 1, display: "inline-flex" }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 400, color: "#FFFFFF", fontSize: "1.5rem", lineHeight: "1.5rem" }}
              >
                {renderBalance(
                    availableBalance,
                    responseMessage && responseMessage.success === false
                )}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{ color: "#B0B0B0", mt: 1, fontSize: "0.8rem", pl: 1 }}
            >
              {currencyCode}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          </Box>
          {/* Escrow Balance Card */}
          <Box
            sx={{
              minWidth: "100%",
              maxWidth: "100%",
              display: "inline-block",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: "#FFFFFF",
              borderRadius: "0.8rem",
              p: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              flexShrink: 0,
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
              pl: 2,
              minHeight: "120px",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "black", mb: 1, fontWeight: 500, fontSize: "0.9rem" }}
            >
              Escrow Balance
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ pl: 1, display: "inline-flex" }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 400, color: "#FFFFFF", fontSize: "1.5rem", lineHeight: "1.5rem" }}
              >
                {renderBalance(
                    lockedBalance,
                    responseMessage && responseMessage.success === false
                )}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{ color: "#B0B0B0", mt: 1, fontSize: "0.8rem", pl: 1 }}
            >
              {currencyCode}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
          </Box>
        </Box>
        {/* Carousel indicators (optional, keep as before) */}
        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
          <Box
            sx={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#1A3C34",
              border: "2px solid #1A3C34",
            }}
          />
          <Box
            sx={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#666",
              border: "2px solid #1A3C34",
            }}
          />
        </Stack>
        {/* API error message */}
        {responseMessage && responseMessage.success === false && (
          <ApiResponseMessage
            success={false}
            message={responseMessage.message}
            onClose={() => setResponseMessage(null)}
            isNetworkError={responseMessage.isNetworkError}
          />
        )}
      </Box>
      {/* <WalletBalancesSection /> */}

      {/* Wallet Actions with Links */}
      <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Link href="/fund-wallet" passHref style={{ flex: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: "#1A3C34",
              color: "#FFFFFF",
              p: 1.5,
              borderRadius: "0.8rem",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": { backgroundColor: "#14352B" },
              "&:active": { backgroundColor: "#102520" },
            }}
            startIcon={<AccountBalanceWalletIcon sx={{ fontSize: "1.3rem" }} />}
          >
            Fund Wallet
          </Button>
        </Link>
        <Link href="/withdraw" passHref style={{ flex: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: "#1A3C34",
              color: "#FFFFFF",
              p: 1.5,
              borderRadius: "0.8rem",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": { backgroundColor: "#14352B" },
              "&:active": { backgroundColor: "#102520" },
            }}
            startIcon={<PaymentIcon sx={{ fontSize: "1.3rem" }} />}
          >
            Withdraw
          </Button>
        </Link>
      </Stack>

      {/* New Escrow Transaction Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{
          backgroundColor: "#1A3C34",
          color: "#FFFFFF",
          p: 1.5,
          borderRadius: "0.8rem",
          textTransform: "none",
          width: "100%",
          mb: 6,
          fontSize: "0.9rem",
          "&:hover": { backgroundColor: "#14352B" },
          "&:active": { backgroundColor: "#102520" },
        }}
      >
        New Escrow Transaction
      </Button>

      {/* Recent Transactions Section (moved here, not lazy loaded) */}
      <Box sx={{ mb: 1, position: "relative" }}>
                {/* Fixed Header */}
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        bgcolor: "background.default",
                        zIndex: 10,
                        pt: 1,
                        pb: 1,
                    }}
                >
                    <div className="flex justify-between">
                        <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.1rem" }}>
                            Recent Transactions
                        </Typography>
                        <Link href="/transactions" passHref>
                            <Typography variant="body2" sx={{ color: "#1A3C34", cursor: "pointer", fontSize: "0.9rem" }}>
                                See all
                            </Typography>
                        </Link>
                    </div>
                </Box>
                {/* Scrollable Transaction List */}
                <Box
                    sx={{
                        maxHeight: "calc(100vh - 350px)",
                        overflowY: "visible",
                        px: 1,
                    }}
                >
                    {transactionsLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
                            <span className="loader" />
                        </Box>
                    ) : transactionsError ? (
                        <Box sx={{ color: "red", p: 2 }}>{transactionsError}</Box>
                    ) : transactions.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 4, color: "#888" }}>
                            <HandshakeIcon sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="body1">No recent transactions made yet</Typography>
                        </Box>
                    ) : (
                        transactions.map((t: any, idx: number) => {
                            const amount =
                                (t.trans_category === "credit" ? "+" : t.trans_category === "debit" ? "-" : "") +
                                (getCurrencyIcon(t.currency)) +
                                t.transaction_amount;
                            const icon =
                                t.trans_type === "Wallet Funded"
                                    ? <AccountBalanceWalletIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />
                                    : t.type === "Wallet Withdrawal"
                                        ? <PaymentIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />
                                        : <HandshakeIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />;
                            return (
                                <Box
                                    key={t.id || idx}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        bgcolor: "background.paper",
                                        borderRadius: "0.8rem",
                                        p: 1.5,
                                        mb: 2,
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                        transition: "transform 0.2s ease",
                                        "&:hover": { transform: "translateY(-2px)" },
                                    }}
                                >
                                    <Box sx={{ mr: 1.5 }}>
                                        {icon}
                                    </Box>
                                    <Stack flex={1}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ color: "text.primary", fontWeight: 500, fontSize: "0.95rem" }}
                                        >
                                            {t.trans_type}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                            {formatDate(t.transaction_date)}
                                        </Typography>
                                    </Stack>
                                    <Stack alignItems="flex-end">
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color:
                                                    amount.startsWith("+")
                                                        ? "#2E7D32"
                                                        : amount.startsWith("-")
                                                            ? "#D32F2F"
                                                            : "#424242",
                                                fontWeight: 600,
                                                fontSize: "1.1rem",
                                            }}
                                        >
                                            {amount}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color:
                                                    t.status === "Completed" || t.status === "Dispute"
                                                        ? "#2E7D32"
                                                        : t.status === "Pending" || t.status === "Ongoing"
                                                            ? "#ED6C02"
                                                            : "#D32F2F",
                                                bgcolor: "rgba(0, 0, 0, 0.05)",
                                                p: "2px 6px",
                                                borderRadius: "0.4rem",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            {t.status}
                                        </Typography>
                                    </Stack>
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Box>

      {/* Reused Navigation Menu */}
      <NavigationMenu />
    </div>
  );
}
