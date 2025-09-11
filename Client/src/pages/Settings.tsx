import { useReducer, useState } from "react";
import { Link } from "react-router-dom";

import Variables from "../settings/Variables";
import { useTheme } from "../contexts/ThemeContext";

import { FiHome } from "react-icons/fi";
import { IoColorPaletteOutline, IoNotificationsOutline } from "react-icons/io5";
import { SlWrench } from "react-icons/sl";
import { VscAccount } from "react-icons/vsc";
import { LuLogs } from "react-icons/lu";
import { MdDataObject, MdLogout } from "react-icons/md";

import EmailNotification from "../settings/EmailNotification";
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

    const getTabBg = (tabKey: string) => {
        if (state.activeTab === tabKey || hoveredTab === tabKey) {
            return currentColors.textSecondary + "30";
        }
        return "";
    };

    return (
        <div className="flex h-screen">
            <div
                className={`w-1/4 p-4 select-none flex flex-col`}
                style={{ backgroundColor: currentColors.bg }}
            >
                <div className="text-4xl font-semibold dark:text-white p-4 italic">
                    @Settings
                </div>
                {/* Left Side Panel */}
                <ul className="space-y-3 dark:text-white text-gray-600 p-2 mt-4 flex-1 flex flex-col">
                    <Link to="/">
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
                        onClick={() =>
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "account",
                            })
                        }
                    >
                        <VscAccount size={24} />
                        Account
                    </li>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("notifications"),
                        }}
                        onMouseEnter={() => setHoveredTab("notifications")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() =>
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "notifications",
                            })
                        }
                    >
                        <IoNotificationsOutline size={24} />
                        Email Notifications
                    </li>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("config"),
                        }}
                        onMouseEnter={() => setHoveredTab("config")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() =>
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "config",
                            })
                        }
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
                        onClick={() =>
                            dispatch({ type: "SET_ACTIVE_TAB", payload: "env" })
                        }
                    >
                        <span className="font-mono dark:text-gray-400 text-xs">
                            .env
                        </span>
                        Environment Variables
                    </li>
                    <li
                        className={`flex items-center gap-2 text-lg font-semibold p-2 rounded cursor-pointer`}
                        style={{
                            backgroundColor: getTabBg("theme"),
                        }}
                        onMouseEnter={() => setHoveredTab("theme")}
                        onMouseLeave={() => setHoveredTab(null)}
                        onClick={() =>
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "theme",
                            })
                        }
                    >
                        <IoColorPaletteOutline size={24} />
                        Customize Theme
                    </li>
                    <div className="border-t border-gray-400 dark:border-gray-700 my-4">
                        <span className="font-bold p-2 dark:text-gray-500 text-xs uppercase">
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
                        onClick={() =>
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "logs",
                            })
                        }
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
                        onClick={() =>
                            dispatch({
                                type: "SET_ACTIVE_TAB",
                                payload: "export",
                            })
                        }
                    >
                        <MdDataObject size={24} />
                        Export Data
                    </li>
                    <div className="flex-1"></div>
                    <li
                        className="flex items-center gap-2 text-lg font-semibold hover:text-red-400 p-2 rounded cursor-pointer"
                        style={{
                            backgroundColor: getTabBg("logout"),
                        }}
                        onMouseEnter={() => setHoveredTab("logout")}
                        onMouseLeave={() => setHoveredTab(null)}
                    >
                        <MdLogout size={24} />
                        Logout
                    </li>
                </ul>
            </div>
            <div
                className={`w-3/4 p-4 m-4 rounded w-full`}
                style={{
                    backgroundColor: currentColors.bg,
                    border: `1px solid ${currentColors.border}`,
                }}
            >
                {/* Main Area */}
                {(() => {
                    switch (state.activeTab) {
                        case "account":
                            return <Account />;
                        case "notifications":
                            return <EmailNotification />;
                        case "config":
                            return <Config />;
                        case "env":
                            return <Variables />;
                        case "theme":
                            return <Themes />;
                        case "logs":
                            return <Logs />;
                        case "export":
                            return <ExportData />;
                        default:
                            return <Account />;
                    }
                })()}
            </div>
        </div>
    );
};

export default Settings;
