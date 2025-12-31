import { useTheme } from "../../contexts/ThemeContext";

interface AvatarProps {
    name?: string;
    email?: string;
    size?: "sm" | "md" | "lg";
    imageUrl?: string;
}

const Avatar = ({ name, email, size = "md", imageUrl }: AvatarProps) => {
    const { currentPalette } = useTheme();

    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-16 h-16 text-lg",
        xl: "w-36 h-36 text-xl",
    };

    const displayText =
        name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U";

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold`}
            style={{
                backgroundColor: imageUrl
                    ? "transparent"
                    : `${currentPalette.primary}20`,
                color: currentPalette.primary,
                backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {!imageUrl && displayText}
        </div>
    );
};

export default Avatar;
