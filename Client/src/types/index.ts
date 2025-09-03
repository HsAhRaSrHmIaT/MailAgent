import type { ReactNode, ErrorInfo } from "react";
import type {
    ThemeMode,
    PaletteKey,
    ColorScheme,
    ColorPalette,
} from "../contexts/themeTypes";

export interface EmailData {
    to: string;
    subject: string;
    body: string;
}

export interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    hashtag?: string;
    type?: "text" | "email";
    emailData?:
        | EmailData
        | {
              to: string;
              subject: string;
              body: string;
          };
}

export interface ChatAreaProps {
    messages: Message[];
    isLoading?: boolean;
    isAIThinking?: boolean;
    isEmailGenerating?: boolean;
}

export interface CommandStatusBarProps {
    commandState: {
        command: string;
        step: number;
        data: {
            receiverEmail?: string;
        };
    };
    clearCountdown: number;
    totalSteps: number;
    onCancel: () => void;
    currentMessage?: string;
    isValidEmail?: (email: string) => boolean;
    showValidationError?: boolean;
}

export interface Props {
    children: ReactNode;
}

export interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export interface HeaderProps {
    setMessages: (messages: Message[]) => void;
}

export interface LoaderProps {
    variant?: "chat" | "email" | "circle";
    size?: "sm" | "md" | "lg";
}

export interface QuickActionsProps {
    setMessage: (message: string) => void;
    setHashTag: (hashTag: string) => void;
    hashTag: string;
}

export interface SendButtonsProps {
    onSubmit: () => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export interface ThemeContextType {
    theme: ThemeMode;
    colorPalette: PaletteKey;
    currentColors: ColorScheme;
    currentPalette: ColorPalette;
    setTheme: (theme: ThemeMode) => void;
    setColorPalette: (palette: PaletteKey) => void;
    toggleTheme: () => void;
    resetToDefault: () => void;
}

export interface CommandState {
    isActive: boolean;
    command: string;
    step: number;
    data: {
        receiverEmail?: string;
        prompt?: string;
    };
    clearAll?: boolean;
}

export interface HashTagProps {
    hashTag: string;
    setHashTag: React.Dispatch<React.SetStateAction<string>>;
}

export interface EmailPreviewBoxProps {
    emailData: EmailData | null;
} // import { GoLightBulb } from "react-icons/go";
export interface Variable {
    key: string;
    value: string;
}
