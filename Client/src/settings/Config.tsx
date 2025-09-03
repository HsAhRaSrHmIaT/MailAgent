import { SlWrench } from "react-icons/sl";

const Config = () => {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto p-6 select-none">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <span className="text-md text-blue-400 font-mono font-bold">
                                <SlWrench size={24} />
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Email Configurations
                            </h1>
                            <p className="text-gray-600 dark:text-slate-400 text-lg mt-1">
                                Configure your emails and passwords securely and efficiently
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Config;
