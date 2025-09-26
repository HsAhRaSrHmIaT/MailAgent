import { useEffect, useState } from "react";
import {
    LuRefreshCcw,
    LuChevronDown,
    LuChevronUp,
    LuCheck,
} from "react-icons/lu";
import { apiService } from "../services/apiService";
import { useTheme } from "../contexts/ThemeContext";
import type { HeaderProps } from "../types";

const MockEmailIDs = [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com",
    "user4@example.com",
    "user5@example.com",
    "default",
];

interface MockEmailListProps {
    setSelectedEmail: (email: string) => void;
    setIsDropdownOpen: (isOpen: boolean) => void;
    selectedEmail: string; // Add this prop
    currentColors: {
        text: string;
        bg: string;
    };
}

const MockEmailList = ({
    setSelectedEmail,
    setIsDropdownOpen,
    selectedEmail,
    currentColors,
}: MockEmailListProps) => {
    const handleEmailSelect = (email: string) => {
        setSelectedEmail(email);
        setIsDropdownOpen(false);
    };

    return (
        <ul className="max-h-60 overflow-y-auto">
            {MockEmailIDs.map((email, index) => (
                <li
                    key={index}
                    className="px-4 py-2 cursor-pointer transition-colors flex items-center justify-between"
                    style={{
                        color: currentColors.text,
                        backgroundColor:
                            email === selectedEmail
                                ? `${currentColors.bg}`
                                : "transparent",
                    }}
                    onMouseEnter={(e) => {
                        if (email !== selectedEmail) {
                            e.currentTarget.style.backgroundColor =
                                currentColors.bg;
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            email === selectedEmail
                                ? currentColors.bg
                                : "transparent";
                    }}
                    onClick={() => handleEmailSelect(email)}
                >
                    <span>{email}</span>
                    {email === selectedEmail && (
                        <LuCheck className="w-4 h-4 text-green-500" />
                    )}
                </li>
            ))}
        </ul>
    );
};

const Header = ({ setMessages }: HeaderProps) => {
    const { currentColors } = useTheme();
    const [status, setStatus] = useState("Offline");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState("default");

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

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isDropdownOpen && !target.closest(".dropdown-container")) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isDropdownOpen]);

    return (
        <div
            className="p-4 flex items-center justify-between select-none shadow-sm"
            style={{
                backgroundColor: currentColors.surface,
                color: currentColors.text,
                boxShadow: `0 1px 3px 0 ${currentColors.border}20`,
            }}
        >
            <div>
                <h1
                    className="text-lg font-semibold"
                    style={{ color: currentColors.text }}
                >
                    Chat & Email Assistant
                </h1>
                <div className="flex items-center space-x-1 ml-1">
                    <div
                        className={`w-2 h-2 rounded-full`}
                        style={{
                            backgroundColor:
                                status === "Online"
                                    ? "#10B981"
                                    : currentColors.border,
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

            <div className="flex items-center gap-3 relative dropdown-container">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={toggleDropdown}
                >
                    <span
                        className="text-sm"
                        style={{ color: currentColors.text }}
                    >
                        {selectedEmail.indexOf("@") > -1
                            ? selectedEmail.split("@")[0]
                            : selectedEmail}
                    </span>
                    {!isDropdownOpen ? (
                        <LuChevronDown
                            size={16}
                            style={{ color: currentColors.text }}
                        />
                    ) : (
                        <LuChevronUp
                            size={16}
                            style={{ color: currentColors.text }}
                        />
                    )}
                </div>

                {isDropdownOpen && (
                    <div
                        className="absolute top-8 right-12 w-60 border rounded-sm shadow-lg z-50"
                        style={{
                            backgroundColor: currentColors.surface,
                            borderColor: currentColors.border,
                            boxShadow: `0 4px 6px -1px ${currentColors.border}40`,
                        }}
                    >
                        <MockEmailList
                            setSelectedEmail={setSelectedEmail}
                            setIsDropdownOpen={setIsDropdownOpen}
                            selectedEmail={selectedEmail} // Pass selectedEmail prop
                            currentColors={currentColors}
                        />
                    </div>
                )}

                <button
                    className="p-2 rounded-full transition-all duration-300 cursor-pointer hover:-rotate-180"
                    style={{
                        backgroundColor: currentColors.bg,
                        color: currentColors.text,
                        border: `1px solid ${currentColors.border}`,
                    }}
                    onClick={handleRefresh}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            currentColors.border;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                            currentColors.bg;
                    }}
                >
                    <LuRefreshCcw size={20} />
                </button>
            </div>
        </div>
    );
};

export default Header;
