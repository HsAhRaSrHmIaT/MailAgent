import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import Avatar from "./Avatar";

const UserMenu = () => {
    const { currentColors, currentPalette } = useTheme();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                style={{
                    backgroundColor: isOpen
                        ? currentColors.surface
                        : "transparent",
                    border: `1px solid ${
                        isOpen ? currentColors.border : "transparent"
                    }`,
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor =
                            currentColors.surface;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }
                }}
            >
                <Avatar
                    name={user.username}
                    email={user.email}
                    size="sm"
                    imageUrl={user.profilePicture}
                />
                <span
                    className="text-sm font-medium hidden md:block"
                    style={{ color: currentColors.text }}
                >
                    {user.username || user.email.split("@")[0]}
                </span>
                <FiChevronDown
                    size={16}
                    style={{
                        color: currentColors.textSecondary,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                    }}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden z-50"
                    style={{
                        backgroundColor: currentColors.surface,
                        border: `1px solid ${currentColors.border}`,
                    }}
                >
                    {/* User Info Section */}
                    <div
                        className="p-4"
                        style={{
                            backgroundColor: `${currentPalette.primary}10`,
                            borderBottom: `1px solid ${currentColors.border}`,
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={user.username}
                                email={user.email}
                                size="md"
                                imageUrl={user.profilePicture}
                            />
                            <div className="flex-1 overflow-hidden">
                                <p
                                    className="font-semibold truncate"
                                    style={{ color: currentColors.text }}
                                >
                                    {user.username || "User"}
                                </p>
                                <p
                                    className="text-xs truncate"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{ color: currentColors.text }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    currentColors.bg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            <FiUser size={18} />
                            <span className="text-sm font-medium">
                                My Profile
                            </span>
                        </Link>

                        <Link
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 transition-colors"
                            style={{ color: currentColors.text }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    currentColors.bg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            <FiSettings size={18} />
                            <span className="text-sm font-medium">
                                Settings
                            </span>
                        </Link>

                        <div
                            style={{
                                borderTop: `1px solid ${currentColors.border}`,
                                margin: "8px 0",
                            }}
                        />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
                            style={{ color: "#EF4444" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    currentColors.bg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            <FiLogOut size={18} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
