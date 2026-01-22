import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { HiArrowLeft, HiShieldCheck } from "react-icons/hi2";

const PrivacyPolicy = () => {
    const { currentColors, currentPalette } = useTheme();

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: currentColors.surface }}
        >
            {/* Header */}
            <header
                className="sticky top-0 z-50 backdrop-blur-md border-b"
                style={{
                    backgroundColor: `${currentColors.bg}95`,
                    borderColor: currentColors.border,
                }}
            >
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        to="/welcome"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                            color: currentColors.textSecondary,
                            backgroundColor: `${currentColors.border}40`,
                        }}
                    >
                        <HiArrowLeft size={20} />
                        <span className="font-medium">Back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <HiShieldCheck
                            size={24}
                            style={{ color: currentPalette.primary }}
                        />
                        <h1
                            className="text-xl font-bold"
                            style={{ color: currentColors.text }}
                        >
                            Privacy Policy
                        </h1>
                    </div>
                    <div className="w-24"></div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div
                    className="rounded-2xl p-8 md:p-12 shadow-lg"
                    style={{
                        backgroundColor: currentColors.bg,
                        border: `1px solid ${currentColors.border}`,
                    }}
                >
                    {/* Last Updated */}
                    <div
                        className="mb-8 pb-6 border-b"
                        style={{ borderColor: currentColors.border }}
                    >
                        <p
                            className="text-sm"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Last Updated: January 22, 2026
                        </p>
                    </div>

                    {/* Introduction */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            1. Introduction
                        </h2>
                        <p
                            className="leading-relaxed mb-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Welcome to MailAgent's Privacy Policy. We at
                            MailAgent ("we", "our", or "us") are committed to
                            protecting your privacy and ensuring the security of
                            your personal information. This Privacy Policy
                            explains how we collect, use, disclose, and
                            safeguard your information when you use our
                            AI-powered email assistant application.
                        </p>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            By using MailAgent, you consent to the data
                            practices described in this policy. If you do not
                            agree with this policy, please do not use our
                            service.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            2. Information We Collect
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    2.1 Account Information:
                                </strong>{" "}
                                When you create an account, we collect:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Email address (required for account creation
                                    and verification)
                                </li>
                                <li>Username (optional)</li>
                                <li>Password (stored in encrypted format)</li>
                                <li>Profile picture (optional)</li>
                                <li>
                                    Account creation and last login timestamps
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    2.2 Email and Communication Data:
                                </strong>{" "}
                                To provide our services, we collect and process:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Email drafts you create or save</li>
                                <li>
                                    Email content generated through our AI
                                    features
                                </li>
                                <li>Chat history with our AI assistant</li>
                                <li>
                                    Email history and sent emails (if you enable
                                    this feature)
                                </li>
                                <li>
                                    Voice recordings for speech-to-text
                                    conversion (temporarily processed)
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    2.3 Email Configuration Data:
                                </strong>{" "}
                                We store:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Email service provider settings (SMTP/IMAP
                                    configurations)
                                </li>
                                <li>Email credentials (encrypted)</li>
                                <li>Email signatures and default settings</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    2.4 Usage and Activity Data:
                                </strong>{" "}
                                We automatically collect:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Activity logs and timestamps</li>
                                <li>Feature usage patterns</li>
                                <li>Session information</li>
                                <li>Error logs and diagnostic data</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    2.5 Preferences and Settings:
                                </strong>{" "}
                                We store your:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Theme and appearance preferences</li>
                                <li>Language preferences</li>
                                <li>
                                    Default tone settings for AI-generated
                                    content
                                </li>
                                <li>
                                    AI learning preferences (whether to enable
                                    personalized learning)
                                </li>
                                <li>History saving preferences</li>
                                <li>Notification settings</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    2.6 Technical Information:
                                </strong>{" "}
                                We may collect:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Device information and operating system</li>
                                <li>Browser type and version</li>
                                <li>IP address and general location data</li>
                                <li>
                                    Connection information for WebSocket
                                    communications
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            3. How We Use Your Information
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                We use the collected information for the
                                following purposes:
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    3.1 Service Provision:
                                </strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    To provide, operate, and maintain MailAgent
                                    services
                                </li>
                                <li>
                                    To process and generate AI-powered email
                                    content
                                </li>
                                <li>To manage your drafts and email history</li>
                                <li>
                                    To send emails on your behalf through
                                    configured email services
                                </li>
                                <li>
                                    To convert voice inputs to text using
                                    speech-to-text technology
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    3.2 Service Improvement:
                                </strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    To improve and personalize your experience
                                    (if AI learning is enabled)
                                </li>
                                <li>
                                    To analyze usage patterns and optimize
                                    features
                                </li>
                                <li>
                                    To develop new features and functionality
                                </li>
                                <li>
                                    To train and improve our AI models (only
                                    with your consent)
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    3.3 Account Management:
                                </strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    To authenticate and verify your identity
                                </li>
                                <li>
                                    To manage your account settings and
                                    preferences
                                </li>
                                <li>
                                    To send account-related notifications and
                                    updates
                                </li>
                                <li>
                                    To provide customer support and respond to
                                    inquiries
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    3.4 Security and Compliance:
                                </strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    To detect and prevent fraud, abuse, and
                                    security incidents
                                </li>
                                <li>To monitor and analyze security threats</li>
                                <li>
                                    To comply with legal obligations and enforce
                                    our terms
                                </li>
                                <li>
                                    To maintain activity logs for security
                                    auditing
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    3.5 Communication:
                                </strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    To send service announcements and updates
                                </li>
                                <li>
                                    To respond to your requests and
                                    communications
                                </li>
                                <li>
                                    To send email verification and password
                                    reset emails
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* AI and Machine Learning */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            4. AI and Machine Learning
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    4.1 AI Processing:
                                </strong>{" "}
                                MailAgent uses artificial intelligence and large
                                language models (LLMs) to generate email
                                content, provide suggestions, and assist with
                                email composition. Your input and preferences
                                are processed through these AI systems.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    4.2 AI Learning:
                                </strong>{" "}
                                If you enable the AI learning feature in your
                                settings, we may use your interactions to
                                personalize and improve the AI's responses for
                                your account. You can disable this feature at
                                any time.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    4.3 Voice Processing:
                                </strong>{" "}
                                When you use voice-to-text features, your voice
                                recordings are processed through speech-to-text
                                (STT) services and text-to-speech (TTS)
                                services. Voice data is processed in real-time
                                and not permanently stored on our servers.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    4.4 Third-Party AI Services:
                                </strong>{" "}
                                We may use third-party AI and machine learning
                                services to provide our features. These services
                                process data according to their own privacy
                                policies and our data processing agreements.
                            </p>
                        </div>
                    </section>

                    {/* Data Storage and Security */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            5. Data Storage and Security
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    5.1 Security Measures:
                                </strong>{" "}
                                We implement industry-standard security measures
                                to protect your data:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Encryption of sensitive data in transit and
                                    at rest
                                </li>
                                <li>
                                    Secure password hashing using
                                    industry-standard algorithms
                                </li>
                                <li>Encrypted storage of email credentials</li>
                                <li>
                                    Secure WebSocket connections for real-time
                                    communication
                                </li>
                                <li>Regular security audits and monitoring</li>
                                <li>
                                    Access controls and authentication
                                    mechanisms
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    5.2 Data Retention:
                                </strong>{" "}
                                We retain your data as follows:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Account information: Retained while your
                                    account is active
                                </li>
                                <li>
                                    Email drafts and history: Retained based on
                                    your settings (can be disabled)
                                </li>
                                <li>
                                    Activity logs: Automatically cleaned up
                                    based on data retention policies
                                </li>
                                <li>
                                    Inactive data: Periodically cleaned up
                                    through automated processes
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    5.3 Automated Data Cleanup:
                                </strong>{" "}
                                We run automated data cleanup services that
                                remove old and inactive data to minimize data
                                storage and protect your privacy. This runs at
                                regular intervals (approximately every hour).
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    5.4 Data Location:
                                </strong>{" "}
                                Your data is stored on secure servers. We take
                                reasonable measures to ensure your data is
                                protected regardless of where it is stored.
                            </p>
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            6. Data Sharing and Disclosure
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    6.1 We Do Not Sell Your Data:
                                </strong>{" "}
                                We do not sell, rent, or trade your personal
                                information to third parties for marketing
                                purposes.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    6.2 Service Providers:
                                </strong>{" "}
                                We may share your data with trusted third-party
                                service providers who assist us in operating our
                                service:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    AI and machine learning service providers
                                    (for content generation)
                                </li>
                                <li>
                                    Cloud infrastructure providers (for hosting
                                    and storage)
                                </li>
                                <li>
                                    Speech-to-text and text-to-speech service
                                    providers
                                </li>
                                <li>
                                    Email service providers (to send emails on
                                    your behalf)
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                These providers are contractually obligated to
                                protect your data and use it only for providing
                                services to us.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    6.3 Legal Requirements:
                                </strong>{" "}
                                We may disclose your information if required by
                                law or in response to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Legal processes (subpoenas, court orders)
                                </li>
                                <li>Government or regulatory requests</li>
                                <li>
                                    Protection of our rights, property, or
                                    safety
                                </li>
                                <li>
                                    Investigation of fraud or security issues
                                </li>
                                <li>
                                    Compliance with applicable laws and
                                    regulations
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    6.4 Business Transfers:
                                </strong>{" "}
                                In the event of a merger, acquisition, or sale
                                of assets, your information may be transferred
                                as part of that transaction. We will notify you
                                of any such change.
                            </p>
                        </div>
                    </section>

                    {/* Your Rights and Choices */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            7. Your Rights and Choices
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    7.1 Access and Control:
                                </strong>{" "}
                                You have the right to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Access your personal information through
                                    your account settings
                                </li>
                                <li>
                                    Update or correct your account information
                                </li>
                                <li>Delete your drafts and email history</li>
                                <li>
                                    Export your data (available in settings)
                                </li>
                                <li>View your activity logs</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    7.2 Privacy Settings:
                                </strong>{" "}
                                You can control:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    AI learning preferences (enable/disable
                                    personalized learning)
                                </li>
                                <li>
                                    History saving (choose whether to save chat
                                    and email history)
                                </li>
                                <li>Email notifications</li>
                                <li>Data retention preferences</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    7.3 Account Deletion:
                                </strong>{" "}
                                You may delete your account at any time through
                                your account settings or by contacting us. Upon
                                deletion:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Your account will be permanently deactivated
                                </li>
                                <li>
                                    Your personal data will be deleted according
                                    to our retention policies
                                </li>
                                <li>
                                    Some information may be retained as required
                                    by law
                                </li>
                                <li>
                                    Backup copies may be retained for a limited
                                    period
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    7.4 Opt-Out Rights:
                                </strong>{" "}
                                You can opt out of:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Email notifications (through notification
                                    settings)
                                </li>
                                <li>
                                    AI learning and personalization (through AI
                                    settings)
                                </li>
                                <li>
                                    History saving features (through privacy
                                    settings)
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    7.5 Data Portability:
                                </strong>{" "}
                                You can export your data in a standard format
                                through the "Export Data" feature in your
                                settings.
                            </p>
                        </div>
                    </section>

                    {/* Cookies and Tracking */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            8. Cookies and Tracking Technologies
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    8.1 Cookies:
                                </strong>{" "}
                                We use cookies and similar technologies to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Maintain your session and keep you logged in
                                </li>
                                <li>Remember your preferences and settings</li>
                                <li>Authenticate your identity</li>
                                <li>
                                    Analyze usage patterns and improve our
                                    service
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    8.2 Types of Cookies:
                                </strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Essential cookies: Required for the service
                                    to function
                                </li>
                                <li>
                                    Preference cookies: Store your settings and
                                    preferences
                                </li>
                                <li>
                                    Authentication cookies: Verify your identity
                                    and session
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    8.3 Managing Cookies:
                                </strong>{" "}
                                You can control cookies through your browser
                                settings. Note that disabling certain cookies
                                may affect the functionality of MailAgent.
                            </p>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            9. Children's Privacy
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            MailAgent is not intended for use by individuals
                            under the age of 18 (or the age of majority in your
                            jurisdiction). We do not knowingly collect personal
                            information from children. If you believe we have
                            collected information from a child, please contact
                            us immediately, and we will delete such information.
                        </p>
                    </section>

                    {/* International Users */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            10. International Data Transfers
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            Your information may be transferred to and processed
                            in countries other than your country of residence.
                            These countries may have data protection laws that
                            differ from your jurisdiction. By using MailAgent,
                            you consent to the transfer of your information to
                            these countries. We take appropriate safeguards to
                            ensure your data is protected in accordance with
                            this Privacy Policy.
                        </p>
                    </section>

                    {/* Third-Party Links */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            11. Third-Party Links and Services
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            MailAgent may contain links to third-party websites
                            or integrate with third-party services (such as
                            email providers). We are not responsible for the
                            privacy practices of these third parties. We
                            encourage you to review their privacy policies
                            before providing any information to them. This
                            Privacy Policy applies only to information collected
                            by MailAgent.
                        </p>
                    </section>

                    {/* Changes to Policy */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            12. Changes to This Privacy Policy
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            We may update this Privacy Policy from time to time
                            to reflect changes in our practices, technology,
                            legal requirements, or other factors. We will notify
                            you of any material changes by updating the "Last
                            Updated" date at the top of this policy and, where
                            appropriate, by sending you an email notification.
                            We encourage you to review this Privacy Policy
                            periodically. Your continued use of MailAgent after
                            any changes constitutes your acceptance of the
                            updated policy.
                        </p>
                    </section>

                    {/* Data Breach */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            13. Data Breach Notification
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            In the event of a data breach that affects your
                            personal information, we will notify you and
                            relevant authorities in accordance with applicable
                            laws. We will provide information about the breach,
                            the data affected, and steps you can take to protect
                            yourself.
                        </p>
                    </section>

                    {/* Your Responsibilities */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            14. Your Responsibilities
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                To help protect your privacy and security:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Keep your password secure and do not share
                                    it with others
                                </li>
                                <li>
                                    Log out of your account when using shared
                                    devices
                                </li>
                                <li>Review your privacy settings regularly</li>
                                <li>
                                    Be cautious about the information you
                                    include in emails
                                </li>
                                <li>
                                    Report any suspicious activity or security
                                    concerns immediately
                                </li>
                                <li>Use strong, unique passwords</li>
                                <li>
                                    Keep your email and account information up
                                    to date
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            15. Contact Us
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                If you have any questions, concerns, or requests
                                regarding this Privacy Policy or our data
                                practices, please contact us:
                            </p>
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: `${currentColors.border}30`,
                                }}
                            >
                                <p
                                    className="font-medium mb-2"
                                    style={{ color: currentColors.text }}
                                >
                                    MailAgent Privacy Team
                                </p>
                                <p>Email: privacy@mailagent.com</p>
                                <p>Support: support@mailagent.com</p>
                                <p>Website: mailagent.com</p>
                            </div>
                            <p className="leading-relaxed mt-4">
                                We will respond to your inquiry within a
                                reasonable timeframe, typically within 30 days.
                            </p>
                        </div>
                    </section>

                    {/* Acknowledgment */}
                    <section
                        className="mt-12 p-6 rounded-lg border-l-4"
                        style={{
                            backgroundColor: `${currentPalette.primary}10`,
                            borderColor: currentPalette.primary,
                        }}
                    >
                        <p
                            className="leading-relaxed font-medium"
                            style={{ color: currentColors.text }}
                        >
                            By using MailAgent, you acknowledge that you have
                            read and understood this Privacy Policy and agree to
                            the collection, use, and disclosure of your
                            information as described herein.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer
                className="border-t py-8"
                style={{
                    backgroundColor: currentColors.bg,
                    borderColor: currentColors.border,
                }}
            >
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p
                        className="text-sm"
                        style={{ color: currentColors.textSecondary }}
                    >
                        © 2026 MailAgent. All rights reserved.
                    </p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link
                            to="/privacy-policy"
                            className="text-sm hover:opacity-80 transition-opacity"
                            style={{ color: currentPalette.primary }}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms-and-conditions"
                            className="text-sm hover:opacity-80 transition-opacity"
                            style={{ color: currentPalette.primary }}
                        >
                            Terms and Conditions
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
