import { useReducer, useState } from "react";
import { Link } from "react-router-dom";

import Variables from "../settings/Variables";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

import { FiHome, FiMenu, FiX } from "react-icons/fi";
import { IoColorPaletteOutline } from "react-icons/io5"; // IoNotificationsOutline
import { SlWrench } from "react-icons/sl";
import { VscAccount } from "react-icons/vsc";
import { LuLogs } from "react-icons/lu";
import { MdDataObject, MdLogout } from "react-icons/md";

// import EmailNotification from "../settings/EmailNotification";
import Config from "../settings/Config";
import Themes from "../settings/Themes";
import Account from "../settings/account/Account";
import Logs from "../settings/extra/Logs";
import ExportData from "../settings/extra/ExportData";

type State = {
    activeTab: string;
};

type Action = {
    type: "SET_ACTIVE_TAB";
    payload: string;
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "SET_ACTIVE_TAB":
            return { ...state, activeTab: action.payload };
        default:
            return state;
    }
};

const initialState: State = {
    activeTab: "account",
};

const Settings = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { currentColors } = useTheme();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();

    const getTabBg = (tabKey: string) => {
        if (state.activeTab === tabKey || hoveredTab === tabKey) {
            return currentColors.textSecondary + "30";
        }
        return "";
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex h-screen relative">
            {/* Mobile Menu Button */}
            <div
                style={{
                    backgroundColor: currentColors.bg + "f0",
                }}
            >
                <button
                    className="lg:hidden fixed top-4 right-4 z-50 p-3 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                    style={{
                        backgroundColor: currentColors.bg + "f0",
                        color: currentColors.text,
                        border: `2px solid ${currentColors.border}`,
                        boxShadow: `0 8px 25px -5px ${currentColors.border}40, 0 10px 10px -5px ${currentColors.border}20`,
                    }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <div className="relative w-5 h-5">
                        {/* Animated hamburger to X transition */}
                        <div
                            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                                sidebarOpen
                                    ? "opacity-0 rotate-180"
                                    : "opacity-100 rotate-0"
                            }`}
                        >
                            <FiMenu size={20} />
                        </div>
                        <div
                            className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                                sidebarOpen
                                    ? "opacity-100 rotate-0"
                                    : "opacity-0 -rotate-180"
                            }`}
                        >
                            <FiX size={20} />
                        </div>
                    </div>
                </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className={`lg:hidden fixed inset-0 bg-black z-30 transition-opacity duration-300 ease-in-out ${
                        sidebarOpen ? "bg-opacity-60" : "bg-opacity-0"
                    }`}
                    style={{
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } 
                    lg:translate-x-0 fixed lg:relative w-80 lg:w-1/5 h-full p-4 select-none flex flex-col z-40 transition-transform duration-300 ease-in-out`}
                style={{ backgroundColor: currentColors.bg }}
            >
                <div className="text-4xl font-semibold dark:text-white p-2 italic lg:block hidden">
                    @Settings
                </div>
                {/* Left Side Panel */}
                <ul className="space-y-3 p-2 mt-4 flex-1 flex flex-col">
                    <Link to="/email-form">
                        <li
                            className="flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer"
                            style={{
                                backgroundColor: getTabBg("home"),
                            }}
                            onMouseEnter={() => setHoveredTab("home")}
                            onMouseLeave={() => setHoveredTab(null)}
                        >
                            <FiHome size={24} />
                            Home
                        </li>
                    </Link>
                    <li
                        className="flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer"
                        style={{
                            backgroundColor: getTabBg("account"),
                        }}
                        onMouseEnter={() => setHoveredTab("account")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "account",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <VscAccount size={24} />
                        Account
                    </li>
                    {/* <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("notifications"),
                        }}
                        onMouseEnter={() => setHoveredTab("notifications")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "notifications",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <IoNotificationsOutline size={24} />
                        Email Notifications
                    </li> */}
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("config"),
                        }}
                        onMouseEnter={() => setHoveredTab("config")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "config",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <SlWrench size={24} />
                        Configuration
                    </li>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("env"),
                        }}
                        onMouseEnter={() => setHoveredTab("env")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "env",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <span className="font-mono text-xs">.env</span>
                        Environment Variables
                    </li>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("theme"),
                        }}
                        onMouseEnter={() => setHoveredTab("theme")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "theme",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <IoColorPaletteOutline size={24} />
                        Customize Theme
                    </li>
                    <div
                        className="border-t my-4"
                        style={{
                            borderColor: currentColors.border,
                        }}
                    >
                        <span
                            className="font-bold p-2 text-xs uppercase"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Advanced Settings
                        </span>
                    </div>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("logs"),
                        }}
                        onMouseEnter={() => setHoveredTab("logs")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "logs",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <LuLogs size={24} />
                        View Logs
                    </li>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("export"),
                        }}
                        onMouseEnter={() => setHoveredTab("export")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() => {
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "export",
                            });
                            setSidebarOpen(false);
                        }}
                    >
                        <MdDataObject size={24} />
                        Export Data
                    </li>
                    <div
                        className="flex-1 border-b"
                        style={{
                            borderColor: currentColors.border,
                        }}
                    />
                    <button
                        className="flex items-center gap-2 text-lg font-semibold hover:text-red-400 p-2 rounded cursor-pointer"
                        style={{
                            backgroundColor: getTabBg("logout"),
                        }}
                        onMouseEnter={() => setHoveredTab("logout")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={handleLogout}
                    >
                        <MdLogout size={24} />
                        Logout
                    </button>
                </ul>
            </div>
            {/* Main Content Area */}
            <div
                className="flex-1 p-4 sm:p-6 lg:p-8 m-3 sm:m-4 lg:m-6 ml-3 lg:ml-4 mt-20 lg:mt-6 rounded-lg overflow-auto"
                style={{
                    backgroundColor: currentColors.bg,
                    border: `2px solid ${currentColors.border}`,
                }}
            >
                {/* Main Area - Keep all mounted but toggle display */}
                <div
                    style={{
                        display:
                            state.activeTab === "account" ? "block" : "none",
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
                        display: state.activeTab === "env" ? "block" : "none",
                    }}
                >
                    <Variables />
                </div>
                <div
                    style={{
                        display: state.activeTab === "theme" ? "block" : "none",
                    }}
                >
                    <Themes />
                </div>
                <div
                    style={{
                        display: state.activeTab === "logs" ? "block" : "none",
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
        </div>
    );
};

export default Settings;
