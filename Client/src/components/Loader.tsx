import type { LoaderProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-12 h-12",
};

const Loader = ({ variant = "chat", size = "sm" }: LoaderProps) => {
    const { currentColors } = useTheme();

    const containerClasses = {
        chat: "flex justify-center space-x-1 p-2 rounded items-center",
        email: "flex justify-center space-x-1 my-4 items-center p-2 rounded h-72 sm:w-80 sm:h-72",
        circle: "flex justify-center space-x-1",
        list: "flex flex-col space-y-2 w-full",
    };

    const renderChatLoader = () => (
        <>
            <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                    animationDelay: "0ms",
                    backgroundColor: currentColors.text,
                }}
            />
            <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                    animationDelay: "150ms",
                    backgroundColor: currentColors.text,
                }}
            />
            <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                    animationDelay: "300ms",
                    backgroundColor: currentColors.text,
                }}
            />
        </>
    );

    const renderEmailLoader = () => (
        <div className="animate-pulse">
            <div className="flex flex-col">
                <div
                    className="h-2 rounded mb-2"
                    style={{ backgroundColor: currentColors.text + "33" }}
                />
                <div
                    className="h-2 rounded w-56 sm:w-64 mb-2"
                    style={{ backgroundColor: currentColors.text + "33" }}
                />
                <div
                    className="rounded w-64 sm:w-72 h-48 mb-2"
                    style={{ backgroundColor: currentColors.bg }}
                />
                <div
                    className="rounded h-4"
                    style={{ backgroundColor: currentColors.text + "11" }}
                />
            </div>
        </div>
    );

    const renderCircleLoader = () => (
        <div
            className={`${sizeClasses[size]} border-3 rounded-full animate-spin`}
            style={{
                borderTopColor: currentColors.text,
                borderRightColor: currentColors.text + "33",
                borderBottomColor: currentColors.text + "33",
                borderLeftColor: currentColors.text + "33",
            }}
        />
    );

    const renderListLoader = () => (
        <div className="flex flex-col space-y-2 w-full animate-pulse">
            {[...Array(3)].map((_, index) => (
                <div
                    key={index}
                    className="h-12 rounded"
                    style={{ backgroundColor: currentColors.bg }}
                />
            ))}
        </div>
    );

    const renderLoader = () => {
        switch (variant) {
            case "chat":
                return renderChatLoader();
            case "email":
                return renderEmailLoader();
            case "circle":
                return renderCircleLoader();
            case "list":
                return renderListLoader();
            default:
                return renderChatLoader();
        }
    };

    return (
        <div
            className={containerClasses[variant]}
            {...(variant === "email"
                ? { style: { backgroundColor: currentColors.surface } }
                : {})}
        >
            {renderLoader()}
        </div>
    );
};

// Named exports for convenience
export const ChatLoader = () => <Loader variant="chat" />;
export const EmailGenerateLoader = () => <Loader variant="email" />;
export const ListLoader = () => <Loader variant="list" />;
export const CircleLoader = (props?: Partial<LoaderProps>) => (
    <Loader variant="circle" {...props} />
);

export default Loader;
