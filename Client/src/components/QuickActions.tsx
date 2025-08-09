interface QuickActionsProps {
    setMessage: (message: string) => void;
    setHashTag: (hashTag: string) => void;
    hashTag: string;
}

const QuickActions = ({
    setMessage,
    setHashTag,
    hashTag,
}: QuickActionsProps) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            <button
                onClick={() => setMessage("/")}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer"
            >
                /commands
            </button>
            <button
                onClick={() => setHashTag("#Confident")}
                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${
                    hashTag === "#Confident" ? "hidden" : ""
                }`}
            >
                Confident
            </button>
            <button
                onClick={() => setHashTag("#Formal")}
                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${
                    hashTag === "#Formal" ? "hidden" : ""
                }`}
            >
                Formal
            </button>
            <button
                onClick={() => setHashTag("#Casual")}
                className={`bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 cursor-pointer ${
                    hashTag === "#Casual" ? "hidden" : ""
                }`}
            >
                Casual
            </button>
        </div>
    );
};

export default QuickActions;
