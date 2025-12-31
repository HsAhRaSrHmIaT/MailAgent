import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FiChevronDown } from "react-icons/fi";
import { LuCheck } from "react-icons/lu";
import type { MockEmailListProps } from "../../types";
import Avatar from "./Avatar";

const MockEmailList = ({
  setSelectedEmail,
  setIsDropdownOpen,
  selectedEmail,
  currentColors,
}: MockEmailListProps) => {
  const { emailConfigs } = useAuth();

  const handleEmailSelect = (email: string) => {
    setSelectedEmail(email);
    setIsDropdownOpen(false);
  };

  return (
    <ul className="max-h-60 overflow-y-auto">
      {emailConfigs.length > 0 ? (
        emailConfigs.map((config, index) => (
          <li
            key={index}
            className="px-4 py-2 cursor-pointer transition-colors flex items-center justify-between"
            style={{
              color: currentColors.text,
              backgroundColor:
                config.email === selectedEmail
                  ? `${currentColors.bg}`
                  : "transparent",
            }}
            onMouseEnter={(e) => {
              if (config.email !== selectedEmail) {
                e.currentTarget.style.backgroundColor = currentColors.bg;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                config.email === selectedEmail
                  ? currentColors.bg
                  : "transparent";
            }}
            onClick={() => handleEmailSelect(config.email)}
          >
            <span>{config.email}</span>
            {config.email === selectedEmail && (
              <LuCheck className="w-4 h-4 text-green-500" />
            )}
          </li>
        ))
      ) : (
        <li
          className="px-4 py-3 text-center text-sm"
          style={{
            color: currentColors.text,
          }}
        >
          No email configurations with passwords found.
          <br />
          <span className="text-xs">
            Add them in Settings → Configurations
          </span>
        </li>
      )}
    </ul>
  );
};

const UserMenu = () => {
  const { currentColors, currentPalette } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("default");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: isOpen ? currentColors.surface : "transparent",
          border: `1px solid ${isOpen ? currentColors.border : "transparent"}`,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = currentColors.surface;
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
          className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50"
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

          <span
            className="px-4 py-2 block text-[10px] uppercase opacity-60 font-semibold"
            style={{ color: currentColors.text }}
          >
            Email ID: {selectedEmail}
          </span>

          {/* Menu Items */}
          <div className="pb-2">
            <MockEmailList
              setSelectedEmail={setSelectedEmail}
              setIsDropdownOpen={setIsOpen}
              selectedEmail={selectedEmail}
              currentColors={currentColors}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
