const CommandHelp = () => {
    
    return (
        <div className="mt-2 p-2 bg-gray-200 text-sm select-none">
            <div className="font-medium text-gray-700 mb-1">
                Available Commands:
            </div>
            <div className="text-gray-600">
                /email - Generate and send an email
                <br />
                /clear - Clear chat history
            </div>
            <div className="mt-2 text-xs text-gray-500">
                #Confident - Use confident tone
                <br />
                #Formal - Use formal tone
                <br />
                #Casual - Use casual tone
            </div>
        </div>
    );
};

export default CommandHelp;
