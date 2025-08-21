import { LuLogs } from "react-icons/lu";

const Logs = () => {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <span className="text-md text-blue-400 font-mono font-bold">
                                <LuLogs size={24} />
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                View Logs
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-lg mt-1">
                                Monitor and manage your application logs
                                effectively
                            </p>
                        </div>
                    </div>
                </div>
                <div className="h-142 border border-gray-200 dark:border-slate-700 rounded-xl p-6 flex items-center justify-center">
                    <p className="text-gray-600 dark:text-slate-600">
                        No logs available
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Logs;
