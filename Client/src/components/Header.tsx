import { useEffect, useState } from "react";
import { LuRefreshCcw } from "react-icons/lu";
import { apiService } from "../services/apiService";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "./auth/UserMenu";
import type { HeaderProps } from "../types";

const Header = ({ setMessages }: HeaderProps) => {
  const { currentColors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState("Offline");

  const handleRefresh = () => {
    // Logic to refresh messages or reset state
    setMessages([]);
  };

  useEffect(() => {
    apiService.connectWebSocket();
    const checkOnlineStatus = () => {
      if (apiService.isWebSocketConnected()) {
        setStatus("Online");
      } else {
        setStatus("Offline");
      }
    };
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="p-3 sm:p-4 flex items-center justify-between select-none shadow-sm"
      style={{
        backgroundColor: currentColors.surface,
        color: currentColors.text,
        boxShadow: `0 1px 3px 0 ${currentColors.border}20`,
      }}
    >
      <div className="flex-1 min-w-0">
        <h1
          className="text-base sm:text-lg font-semibold truncate"
          style={{ color: currentColors.text }}
        >
          Chat & Email Assistant
        </h1>
        <div className="flex items-center space-x-1 ml-1">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0`}
            style={{
              backgroundColor:
                status === "Online" ? "#10B981" : currentColors.border,
            }}
          ></div>
          <span
            className="text-xs"
            style={{ color: currentColors.textSecondary }}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative dropdown-container">
        {/* User Menu - Show if authenticated */}
        {isAuthenticated && (
          <div className="mr-2">
            <UserMenu />
          </div>
        )}

        <button
          className="p-4 sm:p-2 rounded-full transition-all duration-300 cursor-pointer hover:-rotate-180 flex-shrink-0"
          style={{
            backgroundColor: currentColors.bg,
            color: currentColors.text,
            border: `1px solid ${currentColors.border}`,
          }}
          onClick={handleRefresh}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = currentColors.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = currentColors.bg;
          }}
        >
          <LuRefreshCcw />
        </button>
      </div>
    </div>
  );
};

export default Header;
