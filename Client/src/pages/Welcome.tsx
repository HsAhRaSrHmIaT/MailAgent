import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { HiSparkles } from "react-icons/hi2";
import { BsRocket } from "react-icons/bs";

const Welcome = () => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div
            className="relative min-h-screen overflow-hidden transition-colors duration-300 px-4 py-10 md:px-8 md:py-14 select-none"
            style={{ backgroundColor: currentColors.bg }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-80"
                aria-hidden="true"
            >
                <div
                    className="absolute -left-20 top-10 h-56 w-56 rounded-full blur-3xl md:h-80 md:w-80"
                    style={{ backgroundColor: `${currentPalette.primary}18` }}
                />
                <div
                    className="absolute right-[-4rem] top-32 h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96"
                    style={{ backgroundColor: `${currentColors.border}28` }}
                />
                <div
                    className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full blur-3xl md:h-72 md:w-72"
                    style={{ backgroundColor: `${currentPalette.primary}10` }}
                />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
                <div
                    className="w-full rounded-[2rem] border p-6 shadow-2xl backdrop-blur-xl md:p-10 lg:p-14"
                    style={{
                        backgroundColor: `${currentColors.surface}F2`,
                        borderColor: `${currentColors.border}80`,
                        boxShadow: `0 30px 80px ${currentColors.border}30`,
                    }}
                >
                    <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="text-center lg:text-left">
                            <div
                                className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                                style={{
                                    backgroundColor: `${currentColors.border}20`,
                                    borderColor: `${currentColors.border}70`,
                                    color: currentColors.textSecondary,
                                }}
                            >
                                <HiSparkles
                                    size={16}
                                    style={{ color: currentPalette.primary }}
                                />
                                Smart email workflow
                            </div>

                            <h1
                                className="text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl"
                                style={{ color: currentColors.text }}
                            >
                                Welcome to m
                                <span style={{ color: currentPalette.primary }}>
                                    AI
                                </span>
                                lAgent
                            </h1>

                            <p
                                className="mt-5 text-lg md:text-xl lg:text-2xl"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Your AI-powered email assistant for faster
                                drafting, cleaner replies, and a calmer inbox.
                            </p>

                            <p
                                className="mt-4 max-w-2xl text-base leading-7 md:text-lg"
                                style={{ color: currentColors.textSecondary }}
                            >
                                Draft messages with confidence, keep tone
                                consistent, and move from idea to send without
                                losing time in the details.
                            </p>

                            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                                <Link
                                    to="/email-form"
                                    className="group inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                    style={{
                                        backgroundColor: currentPalette.primary,
                                        boxShadow: `0 16px 40px ${currentPalette.primary}35`,
                                    }}
                                >
                                    <span>Get Started</span>
                                    <BsRocket
                                        size={20}
                                        className="transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </Link>

                                <div
                                    className="text-sm"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Built for focused, faster email work.
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <div
                                className="rounded-3xl border p-6"
                                style={{
                                    backgroundColor: `${currentColors.bg}CC`,
                                    borderColor: `${currentColors.border}80`,
                                }}
                            >
                                <div
                                    className="mb-3 inline-flex rounded-2xl p-3"
                                    style={{
                                        backgroundColor: `${currentPalette.primary}18`,
                                        color: currentPalette.primary,
                                    }}
                                >
                                    <BsRocket size={24} />
                                </div>
                                <h2
                                    className="text-xl font-semibold"
                                    style={{ color: currentColors.text }}
                                >
                                    Draft faster
                                </h2>
                                <p
                                    className="mt-2 text-sm leading-6"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Turn rough ideas into polished email copy
                                    with a cleaner, quicker workflow.
                                </p>
                            </div>

                            <div
                                className="rounded-3xl border p-6"
                                style={{
                                    backgroundColor: `${currentColors.bg}CC`,
                                    borderColor: `${currentColors.border}80`,
                                }}
                            >
                                <div
                                    className="mb-3 inline-flex rounded-2xl p-3"
                                    style={{
                                        backgroundColor: `${currentPalette.primary}18`,
                                        color: currentPalette.primary,
                                    }}
                                >
                                    <HiSparkles size={24} />
                                </div>
                                <h2
                                    className="text-xl font-semibold"
                                    style={{ color: currentColors.text }}
                                >
                                    Stay consistent
                                </h2>
                                <p
                                    className="mt-2 text-sm leading-6"
                                    style={{
                                        color: currentColors.textSecondary,
                                    }}
                                >
                                    Keep your tone, structure, and message
                                    quality aligned across every reply.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-8 text-center md:mt-10">
                <p
                    className="text-sm"
                    style={{ color: currentColors.textSecondary }}
                >
                    &copy; {new Date().getFullYear()} MailAgent. All rights
                    reserved.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
