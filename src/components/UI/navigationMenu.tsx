import Link from "next/link";
import { Box, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import { usePathname } from "next/navigation";

// Define the shape of each navigation item
interface NavItem {
  href: string;
  icon: JSX.Element;
  label: string;
}

const NavigationMenu: React.FC = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: <HomeIcon sx={{ fontSize: "1.3rem" }} />, label: "Home" },
    { href: "/transactions", icon: <ReceiptLongIcon sx={{ fontSize: "1.3rem" }} />, label: "Transactions" },
    { href: "/store", icon: <AccountBalanceWalletIcon sx={{ fontSize: "1.3rem" }} />, label: "Wallet" },
    { href: "/dashboard/settings", icon: <SettingsIcon sx={{ fontSize: "1.3rem" }} />, label: "Settings" },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "background.default",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        borderTopLeftRadius: "0.8rem",
        borderTopRightRadius: "0.8rem",
        p: "6px 0",
        height: "70px",
        display: "flex",
        justifyContent: "space-around",
        zIndex: 1000,
      }}
    >
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} passHref>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 1,
              color: pathname === item.href || (item.href === "/dashboard" && pathname === "/") ? "#FFFFFF" : "text.primary",
              bgcolor: pathname === item.href || (item.href === "/dashboard" && pathname === "/") ? "#1A3C34" : "transparent",
              borderRadius: "0.4rem",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor:
                  pathname === item.href || (item.href === "/dashboard" && pathname === "/")
                    ? "#14352B"
                    : "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            {item.icon}
            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
              {item.label}
            </Typography>
          </Box>
        </Link>
      ))}
    </Box>
  );
};

export default NavigationMenu;