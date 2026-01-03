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
  emailId?: string;
  tone?: string;
  prompt?: string;
}

export interface ChatHistoryResponse {
  messages: Message[];
  hasMore: boolean;
  total: number;
}

export interface EmailHistory {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  tone?: string;
  prompt?: string;
  status: string;
  sent_at?: string;
  regeneration_count: number;
  version: number;
  timestamp: Date;
}

export interface EmailHistoryResponse {
  emails: EmailHistory[];
  hasMore: boolean;
  total: number;
}

export interface ChatAreaProps {
  messages: Message[];
  isLoading?: boolean;
  isAIThinking?: boolean;
  isEmailGenerating?: boolean;
  onScrollToTop?: () => void;
  onUpdateMessage?: (messageId: string, updatedEmailData: EmailData) => void;
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
  emailId?: string;
  tone?: string;
  prompt?: string;
  onRegenerate?: (newEmailData: EmailData) => void;
  onUpdate?: (updatedEmailData: EmailData) => void;
}
export interface Variable {
  key: string;
  value: string;
}

// Logs Service Types
export interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  details?: string;
  source?: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface LogStats {
  total_logs: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  debug_count: number;
  critical_count: number;
  category_breakdown: Record<string, number>;
}

// API Service Types
export interface ChatRequest {
  message: string;
  tone?: string;
}

export interface ChatResponse {
  message?: string;
  success: boolean;
  error?: string;
}

export interface EmailRequest {
  receiverEmail: string;
  prompt: string;
  tone?: string;
}

export interface EmailResponse {
  success: boolean;
  email?: {
    subject: string;
    body: string;
    to: string;
  };
  error?: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  profilePicture?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  emailConfigs: EmailConfigResponse[];
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshEmailConfigs: () => Promise<void>;
}

export interface EmailListProps {
  setSelectedEmail: (email: string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  selectedEmail: string;
  currentColors: {
    text: string;
    bg: string;
  };
}

// Environment Variable Types
export interface EnvironmentVariable {
  id?: number;
  key: string;
  value: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnvironmentVariableResponse {
  key: string;
  value: string;
}

// Email Configuration Types
export interface EmailConfig {
  id?: number;
  email: string;
  password: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailConfigResponse {
  email: string;
  password: string;
}

// Add to Client/src/types/index.ts
export interface ChatHistoryResponse {
  messages: Message[];
  hasMore: boolean;
  total: number;
}
