import { Box, Typography, IconButton } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Success icon
import ErrorIcon from "@mui/icons-material/Error"; // Error icon
import SignalWifiOffIcon from "@mui/icons-material/SignalWifiOff"; // Network error icon
import theme from "@/lib/theme"; // Light theme
import darkTheme from "@/lib/theme"; // Dark theme (adjust path if separate)

const getTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return darkTheme;
  }
  return theme;
};

interface ResponseHandlerResult {
  success: boolean;
  message: string;
  data?: any;
  isNetworkError?: boolean; // Added to distinguish network errors
}

interface ApiResponseMessageProps extends ResponseHandlerResult {
  onClose: () => void;
}

const ApiResponseMessage: React.FC<ApiResponseMessageProps> = ({ success, message, onClose, isNetworkError = false, data }) => {
  const muiTheme = useTheme();

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Determine style based on message type
  const getMessageStyle = () => {
    if (isNetworkError) {
      return {
        bgcolor: "linear-gradient(135deg, #ff4d4d 0%, #cc0000 50%)", // Bright red gradient for network errors
        solidBg: "#ff4d4d", // Solid fallback for opacity
        border: "2px solid #ff9999",
        icon: <SignalWifiOffIcon />,
        iconColor: "#ffcccc",
      };
    } else if (success) {
      return {
        bgcolor: "linear-gradient(135deg, #1A3C34 0%, #0F2A24 50%)", // Dark green gradient for success
        solidBg: "#1A3C34", // Solid fallback for opacity
        border: "2px solid #2E7D7A",
        icon: <CheckCircleIcon />,
        iconColor: "#A3BFFA",
      };
    } else {
      return {
        bgcolor: "linear-gradient(135deg, #D32F2F 0%, #9A0007 100%)", // Red gradient for API errors
        solidBg: "#D32F2F", // Solid fallback for opacity
        border: "2px solid #EF5350",
        icon: <ErrorIcon />,
        iconColor: "#FFCDD2",
      };
    }
  };

  const messageStyle = getMessageStyle();

  return (
    <ThemeProvider theme={getTheme()}>
      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          style={{ position: "relative", width: "100%" }}
        >
          <Box
            sx={{
              position: "fixed",
              top: { xs: "70px", md: "80px" }, // Responsive top offset
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1300,
              background: messageStyle.solidBg, // Solid background as a fallback
              backgroundImage: messageStyle.bgcolor, // Gradient overlay
              color: "#FFFFFF",
              p: { xs: 1.5, md: 2 },
              borderRadius: "0.75rem",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: { xs: "90%", md: "500px" },
              width: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 24px rgba(0, 0, 0, 0.4), 0 6px 12px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", pl: { xs: 1, md: 2 } }}>
              {messageStyle.icon && (
                <Box sx={{ mr: 1, color: messageStyle.iconColor }}>
                  {messageStyle.icon}
                </Box>
              )}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", md: "1rem" },
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {message}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: messageStyle.iconColor,
                p: { xs: 0.5, md: 1 },
                "&:hover": { color: "#FFFFFF" },
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />
            </IconButton>
          </Box>
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default ApiResponseMessage;