interface LoaderProps {
    variant?: "chat" | "email" | "button";
}

const Loader = ({ variant = "chat" }: LoaderProps) => {
    const containerClasses = {
        chat: "flex justify-center space-x-2 my-4 bg-gray-200 p-2 rounded w-20 h-10 items-center",
        email: "flex justify-center space-x-1 my-2 bg-gray-200 items-center p-2 rounded h-72 sm:w-80 sm:h-72",
        button: "flex justify-center space-x-1",
    };

    const renderChatLoader = () => (
        <>
            <div
                className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
            />
            <div
                className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
            />
            <div
                className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
            />
        </>
    );

    const renderEmailLoader = () => (
        <div className="animate-pulse">
            <div className="flex flex-col">
                <div className="h-2 bg-gray-400 rounded mb-2" />
                <div className="h-2 bg-gray-400 rounded w-56 sm:w-64 mb-2" />
                <div className="bg-white rounded w-64 sm:w-72 h-48 mb-2" />
                <div className="bg-gray-100 rounded h-4" />
            </div>
        </div>
    );

    const renderButtonLoader = () => (
        <div className="w-4 h-4 border-3 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
    );

    const renderLoader = () => {
        switch (variant) {
            case "chat":
                return renderChatLoader();
            case "email":
                return renderEmailLoader();
            case "button":
                return renderButtonLoader();
            default:
                return renderChatLoader();
        }
    };

    return <div className={containerClasses[variant]}>{renderLoader()}</div>;
};

// Named exports for convenience
export const ChatLoader = () => <Loader variant="chat" />;
export const EmailGenerateLoader = () => <Loader variant="email" />;
export const ButtonLoader = () => <Loader variant="button" />;

export default Loader;
