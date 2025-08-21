import { IoNotificationsOutline } from "react-icons/io5";

const EmailNotification = () => {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <span className="text-md text-blue-400 font-mono font-bold">
                                <IoNotificationsOutline size={24} />
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Email Notifications
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-lg mt-1">
                                Manage your email notifications and preferences
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailNotification;
