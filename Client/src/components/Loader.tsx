import type { LoaderProps } from "../types";

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-12 h-12",
};

const Loader = ({ variant = "chat", size = "sm" }: LoaderProps) => {
    const containerClasses = {
        chat: "flex justify-center space-x-1 p-2 rounded items-center",
        email: "flex justify-center space-x-1 my-4 bg-gray-200 items-center p-2 rounded h-72 sm:w-80 sm:h-72",
        circle: "flex justify-center space-x-1",
    };

    const renderChatLoader = () => (
        <>
            <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
            />
            <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
            />
            <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
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

    const renderCircleLoader = () => (
        <div
            className={`${sizeClasses[size]} border-3 border-gray-300 border-t-gray-500 rounded-full animate-spin`}
        />
    );

    const renderLoader = () => {
        switch (variant) {
            case "chat":
                return renderChatLoader();
            case "email":
                return renderEmailLoader();
            case "circle":
                return renderCircleLoader();
            default:
                return renderChatLoader();
        }
    };

    return <div className={containerClasses[variant]}>{renderLoader()}</div>;
};

// Named exports for convenience
export const ChatLoader = () => <Loader variant="chat" />;
export const EmailGenerateLoader = () => <Loader variant="email" />;
export const CircleLoader = (props?: Partial<LoaderProps>) => (
    <Loader variant="circle" {...props} />
);

export default Loader;
