const CommandHelp = () => {
    return (
        <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 text-sm select-none shadow-sm dark:shadow-gray-900/30">
            <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                Available Commands:
            </div>
            <div className="text-gray-600 dark:text-gray-300">
                /email - Generate and send an email
                <br />
                /clear - Clear chat history
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                #confident - Use confident tone
                <br />
                #formal - Use formal tone
                <br />
                #casual - Use casual tone
            </div>
        </div>
    );
};

export default CommandHelp;
