import type { QuickActionsProps } from "../types";

const QuickActions = ({
    setMessage,
    setHashTag,
    hashTag,
}: QuickActionsProps) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            <button
                onClick={() => setMessage("/")}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer shadow-sm dark:shadow-gray-900/30"
            >
                /commands
            </button>
            <button
                onClick={() => setHashTag("#confident")}
                className={`bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer shadow-sm dark:shadow-gray-900/30 ${
                    hashTag === "#confident" ? "hidden" : ""
                }`}
            >
                confident
            </button>
            <button
                onClick={() => setHashTag("#formal")}
                className={`bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer shadow-sm dark:shadow-gray-900/30 ${
                    hashTag === "#formal" ? "hidden" : ""
                }`}
            >
                formal
            </button>
            <button
                onClick={() => setHashTag("#casual")}
                className={`bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer shadow-sm dark:shadow-gray-900/30 ${
                    hashTag === "#casual" ? "hidden" : ""
                }`}
            >
                casual
            </button>
        </div>
    );
};

export default QuickActions;
