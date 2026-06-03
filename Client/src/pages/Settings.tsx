import { useReducer, useState } from "react";
import { Link } from "react-router-dom";

import Variables from "../settings/Variables";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

import { FiHome, FiMenu, FiX } from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5";
import { SlWrench } from "react-icons/sl";
import { VscAccount } from "react-icons/vsc";
import { LuLogs } from "react-icons/lu";
import { MdDataObject, MdLogout, MdPrivacyTip, MdDescription  } from "react-icons/md";

import Config from "../settings/Config";
import Themes from "../settings/Themes";
import Account from "../settings/account/Account";
import Logs from "../settings/extra/Logs";
import ExportData from "../settings/extra/ExportData";

type State = { activeTab: string };
type Action = { type: "SET_ACTIVE_TAB"; payload: string };

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "SET_ACTIVE_TAB":
            return { ...state, activeTab: action.payload };
        default:
            return state;
    }
};

const initialState: State = { activeTab: "account" };

const mainNav = [
    { key: "home", label: "Home", icon: FiHome, isLink: true },
    { key: "account", label: "Account", icon: VscAccount, isLink: false },
    { key: "config", label: "Configuration", icon: SlWrench, isLink: false },
    { key: "env", label: "Variables", icon: null, isLink: false },
    {
        key: "theme",
        label: "Customize Theme",
        icon: IoColorPaletteOutline,
        isLink: false,
    },
];

const advancedNav = [
    { key: "logs", label: "View Logs", icon: LuLogs, isLink: false },
    { key: "export", label: "Export Data", icon: MdDataObject, isLink: false },
    { key: "terms", label: "Terms & Conditions", icon: MdDescription, isLink: true, path: "/terms-and-conditions" },
    { key: "privacy", label: "Privacy Policy", icon: MdPrivacyTip, isLink: true, path: "/privacy-policy" },
];

const Settings = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { currentColors } = useTheme();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();

    const isActive = (key: string) => state.activeTab === key;
    const isHovered = (key: string) => hoveredTab === key;

    const navItemStyle = (key: string) => ({
        backgroundColor: isActive(key)
            ? currentColors.textSecondary + "22"
            : isHovered(key)
              ? currentColors.textSecondary + "12"
              : "transparent",
        color: isActive(key) ? currentColors.text : currentColors.textSecondary,
        borderLeft: isActive(key)
            ? `2px solid ${currentColors.textSecondary}`
            : "2px solid transparent",
        transition: "all 0.18s ease",
    });

    const setTab = (key: string) => {
        dispatch({ type: "SET_ACTIVE_TAB", payload: key });
        setSidebarOpen(false);
    };

    return (
        <div
            className="flex h-screen relative overflow-hidden"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div
                className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
                style={{
                    backgroundColor: currentColors.bg + "f8",
                    borderBottom: `1px solid ${currentColors.border}`,
                    backdropFilter: "blur(12px)",
                }}
            >
                <Logo />
                <button
                    className="p-2 rounded-lg"
                    style={{
                        backgroundColor: currentColors.textSecondary + "18",
                        color: currentColors.text,
                        border: `1px solid ${currentColors.border}`,
                        transition: "background 0.15s",
                    }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <div className="relative w-5 h-5 flex items-center justify-center">
                        <span
                            style={{
                                position: "absolute",
                                transition: "opacity 0.2s, transform 0.2s",
                                opacity: sidebarOpen ? 0 : 1,
                                transform: sidebarOpen
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                            }}
                        >
                            <FiMenu size={18} />
                        </span>
                        <span
                            style={{
                                position: "absolute",
                                transition: "opacity 0.2s, transform 0.2s",
                                opacity: sidebarOpen ? 1 : 0,
                                transform: sidebarOpen
                                    ? "rotate(0deg)"
                                    : "rotate(-90deg)",
                            }}
                        >
                            <FiX size={18} />
                        </span>
                    </div>
                </button>
            </div>

            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(3px)",
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`sidebar-scrollbar
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 fixed lg:relative
                    w-72 lg:w-[240px] xl:w-[260px]
                    h-full flex flex-col z-40
                    transition-transform duration-250 ease-in-out`}
                style={{
                    backgroundColor: currentColors.bg,
                    borderRight: `1px solid ${currentColors.border}`,
                    paddingTop: "0",
                    overflow: "hidden auto",
                }}
            >
                {/* Logo area */}
                <div
                    className="hidden lg:flex items-end gap-2 px-5 pt-6 pb-5"
                    style={{
                        borderBottom: `1px solid ${currentColors.border}`,
                    }}
                >
                    <Logo />
                    <span
                        className="text-xs font-medium italic mb-0.5"
                        style={{ color: currentColors.textSecondary }}
                    >
                        / Settings
                    </span>
                </div>

                {/* Mobile top padding */}
                <div className="lg:hidden" style={{ height: "60px" }} />

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {/* Main items */}
                    {mainNav.map(({ key, label, icon: Icon, isLink }) => {
                        const inner = (
                            <div
                                key={key}
                                className="nav-item"
                                style={navItemStyle(
                                    key === "home" ? "home" : key,
                                )}
                                onMouseEnter={() => setHoveredTab(key)}
                                onMouseLeave={() => setHoveredTab(null)}
                                onClick={() => key !== "home" && setTab(key)}
                            >
                                {key === "env" ? (
                                    <span
                                        style={{
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            padding: "1px 5px",
                                            borderRadius: "4px",
                                            border: `1px solid ${currentColors.border}`,
                                            color: currentColors.textSecondary,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        .env
                                    </span>
                                ) : Icon ? (
                                    <Icon size={17} />
                                ) : null}
                                {label}
                                {isActive(key) && key !== "home" && (
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            width: 5,
                                            height: 5,
                                            borderRadius: "50%",
                                            backgroundColor:
                                                currentColors.textSecondary,
                                            opacity: 0.7,
                                        }}
                                    />
                                )}
                            </div>
                        );
                        return isLink ? (
                            <Link
                                to="/email-form"
                                key={key}
                                style={{ textDecoration: "none" }}
                            >
                                {inner}
                            </Link>
                        ) : (
                            inner
                        );
                    })}

                    {/* Divider */}
                    <div className="mx-1 mt-3 mb-1">
                        <div
                            style={{
                                borderTop: `1px solid ${currentColors.border}`,
                            }}
                        />
                        <p
                            className="mt-2 px-2 text-xs font-semibold uppercase tracking-widest"
                            style={{
                                color: currentColors.textSecondary,
                                opacity: 0.55,
                            }}
                        >
                            Advanced
                        </p>
                    </div>

                    {/* Advanced items */}
                    {advancedNav.map(({ key, label, icon: Icon, isLink, path }) => {
                        const inner = (
                            <div
                                key={key}
                                className="nav-item"
                                style={navItemStyle(key)}
                                onMouseEnter={() => setHoveredTab(key)}
                                onMouseLeave={() => setHoveredTab(null)}
                                onClick={() => !isLink && setTab(key)}
                            >
                                <Icon size={17} />
                                {label}
                                {!isLink && isActive(key) && (
                                    <span
                                        style={{
                                            marginLeft: "auto",
                                            width: 5,
                                            height: 5,
                                            borderRadius: "50%",
                                            backgroundColor:
                                                currentColors.textSecondary,
                                            opacity: 0.7,
                                        }}
                                    />
                                )}
                            </div>
                        );
                        return isLink ? (
                            <Link
                                to={path || "/"}
                                key={key}
                                style={{ textDecoration: "none" }}
                            >
                                {inner}
                            </Link>
                        ) : (
                            inner
                        );
                    })}

                    {/* Spacer */}
                    <div style={{ flex: 1, minHeight: 16, borderBottom: `1px solid ${currentColors.border}` }} />

                    {/* Logout */}
                    <div
                        className="nav-item"
                        style={{
                            ...navItemStyle("logout"),
                            color: isHovered("logout")
                                ? "#f87171"
                                : currentColors.textSecondary,
                            marginBottom: 8,
                        }}
                        onMouseEnter={() => setHoveredTab("logout")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={logout}
                    >
                        <MdLogout size={17} />
                        Logout
                    </div>
                </nav>
            </aside>

            <main
                className="flex-1 overflow-auto"
                style={{
                    paddingTop: "0",
                    backgroundColor: currentColors.bg,
                }}
            >
                {/* Mobile top spacing */}
                <div className="lg:hidden" style={{ height: "60px" }} />

                <div
                    className="shadow-2xl"
                    style={{
                        margin: "20px",
                        padding: "28px 32px",
                        borderRadius: "14px",
                        border: `1px solid ${currentColors.border}`,
                        backgroundColor: currentColors.bg,
                        minHeight: "calc(100% - 40px)",
                    }}
                >
                    <div
                        style={{
                            display:
                                state.activeTab === "account"
                                    ? "block"
                                    : "none",
                        }}
                    >
                        <Account />
                    </div>
                    <div
                        style={{
                            display:
                                state.activeTab === "config" ? "block" : "none",
                        }}
                    >
                        <Config />
                    </div>
                    <div
                        style={{
                            display:
                                state.activeTab === "env" ? "block" : "none",
                        }}
                    >
                        <Variables />
                    </div>
                    <div
                        style={{
                            display:
                                state.activeTab === "theme" ? "block" : "none",
                        }}
                    >
                        <Themes />
                    </div>
                    <div
                        style={{
                            display:
                                state.activeTab === "logs" ? "block" : "none",
                        }}
                    >
                        <Logs />
                    </div>
                    <div
                        style={{
                            display:
                                state.activeTab === "export" ? "block" : "none",
                        }}
                    >
                        <ExportData />
                    </div>
                </div>
            </main>
        </div>
    );
};


const Logo = () => (
    <div
        style={{
            fontWeight: 700,
            fontSize: "1.35rem",
            letterSpacing: "-0.02em",
            lineHeight: 1,
        }}
    >
        m<span style={{ color: "#3b82f6" }}>AI</span>lAgent
    </div>
);

export default Settings;
