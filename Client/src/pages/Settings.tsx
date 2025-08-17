import Variables from "../settings/variables";

import { FiHome } from "react-icons/fi";
import { IoColorPaletteOutline, IoNotificationsOutline } from "react-icons/io5";
import { SlWrench } from "react-icons/sl";
import { VscAccount } from "react-icons/vsc";
import { LuLogs } from "react-icons/lu";
import { MdDataObject, MdLogout } from "react-icons/md";

const Settings = () => {
    return (
        <div className="flex h-screen">
            <div className="w-1/4 p-4 bg-gray-200 dark:bg-gray-900 select-none flex flex-col">
                <div className="text-4xl font-semibold dark:text-white p-2 italic">
                    @Settings
                </div>
                {/* Left Side Panel */}
                <ul className="space-y-3 dark:text-white text-gray-600 p-2 mt-6 flex-1 flex flex-col">
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <FiHome size={24} />
                        Home
                    </li>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <VscAccount size={24} />
                        Account
                    </li>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <IoNotificationsOutline size={24} />
                        Email Notifications
                    </li>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <SlWrench size={24} />
                        Configure
                    </li>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <span className="font-mono dark:text-gray-400 text-xs">
                            .env
                        </span>
                        Environment Variables
                    </li>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <IoColorPaletteOutline size={24} />
                        Customize Theme
                    </li>
                    <div className="border-t border-gray-400 dark:border-gray-700 my-4">
                        <span className="font-bold p-2 dark:text-gray-500 text-xs uppercase">
                            Advanced Settings
                        </span>
                    </div>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <LuLogs size={24} />
                        View Logs
                    </li>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <MdDataObject size={24} />
                        Export Data
                    </li>
                    <div className="flex-1"></div>
                    <li className="flex items-center gap-2 text-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
                        <MdLogout size={24} />
                        Logout
                    </li>
                </ul>
            </div>
            <div className="w-3/4 p-4 bg-gray-200 border border-gray-300 dark:border-none dark:bg-gray-900 m-4 rounded w-full">
                {/* Main Area */}
                    <Variables />
            </div>
        </div>
    );
};

export default Settings;
