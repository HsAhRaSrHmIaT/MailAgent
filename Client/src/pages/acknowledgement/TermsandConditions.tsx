import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { HiArrowLeft, HiDocumentText } from "react-icons/hi2";

const TermsandConditions = () => {
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
                        <HiDocumentText
                            size={24}
                            style={{ color: currentPalette.primary }}
                        />
                        <h1
                            className="text-xl font-bold"
                            style={{ color: currentColors.text }}
                        >
                            Terms and Conditions
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
                            Welcome to MailAgent ("we", "our", or "us"). These
                            Terms and Conditions govern your use of the
                            MailAgent application, an AI-powered email assistant
                            designed to help you write and manage emails
                            efficiently. By accessing or using MailAgent, you
                            agree to be bound by these Terms and Conditions.
                        </p>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            If you do not agree with any part of these terms,
                            you must not use our service.
                        </p>
                    </section>

                    {/* Account Registration */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            2. Account Registration and Security
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    2.1 Account Creation:
                                </strong>{" "}
                                To use MailAgent, you must create an account by
                                providing accurate, complete, and current
                                information including a valid email address,
                                username, and password.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    2.2 Account Security:
                                </strong>{" "}
                                You are responsible for maintaining the
                                confidentiality of your account credentials and
                                for all activities that occur under your
                                account. You must notify us immediately of any
                                unauthorized access or security breach.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    2.3 Eligibility:
                                </strong>{" "}
                                You must be at least 18 years old or the age of
                                majority in your jurisdiction to use MailAgent.
                                By creating an account, you represent that you
                                meet these eligibility requirements.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    2.4 Account Verification:
                                </strong>{" "}
                                We may require email verification to activate
                                your account. You must use a valid email address
                                that you have access to.
                            </p>
                        </div>
                    </section>

                    {/* Service Description */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            3. Service Description
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                MailAgent provides the following features:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    AI-powered email composition and drafting
                                </li>
                                <li>Voice-to-text email creation</li>
                                <li>Email history and draft management</li>
                                <li>
                                    Email configuration and settings management
                                </li>
                                <li>User activity logging and tracking</li>
                                <li>
                                    Chat-based interface for email assistance
                                </li>
                                <li>Theme customization and personalization</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                We reserve the right to modify, suspend, or
                                discontinue any part of the service at any time
                                with or without notice.
                            </p>
                        </div>
                    </section>

                    {/* User Responsibilities */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            4. User Responsibilities and Acceptable Use
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    4.1 Acceptable Use:
                                </strong>{" "}
                                You agree to use MailAgent only for lawful
                                purposes and in accordance with these Terms. You
                                must not:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Use the service to send spam, unsolicited
                                    emails, or malicious content
                                </li>
                                <li>
                                    Violate any applicable laws or regulations
                                </li>
                                <li>
                                    Infringe upon the rights of others,
                                    including intellectual property rights
                                </li>
                                <li>
                                    Attempt to gain unauthorized access to our
                                    systems or networks
                                </li>
                                <li>
                                    Interfere with or disrupt the service or
                                    servers
                                </li>
                                <li>
                                    Use the service for phishing, fraud, or any
                                    deceptive practices
                                </li>
                                <li>
                                    Upload or transmit viruses, malware, or
                                    harmful code
                                </li>
                                <li>Harass, abuse, or harm other users</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    4.2 Content Responsibility:
                                </strong>{" "}
                                You are solely responsible for the content of
                                emails you create and send using MailAgent. We
                                do not endorse or take responsibility for
                                user-generated content.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    4.3 Email Configuration:
                                </strong>{" "}
                                You are responsible for properly configuring
                                your email settings and ensuring you have the
                                necessary permissions to send emails through
                                your email provider.
                            </p>
                        </div>
                    </section>

                    {/* Data and Privacy */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            5. Data Storage and Privacy
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    5.1 Data Collection:
                                </strong>{" "}
                                We collect and store information necessary to
                                provide our services, including your email
                                address, username, profile information, email
                                drafts, chat history, and activity logs.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    5.2 Data Usage:
                                </strong>{" "}
                                Your data is used to provide, maintain, and
                                improve our services. We may use AI and machine
                                learning technologies to enhance your
                                experience.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    5.3 Data Retention:
                                </strong>{" "}
                                We automatically clean up inactive data
                                according to our data retention policies. You
                                can control whether to save your history through
                                your account settings.
                            </p>
                            <p className="leading-relaxed">
                                For detailed information about how we handle
                                your data, please refer to our{" "}
                                <Link
                                    to="/privacy-policy"
                                    className="underline hover:opacity-80"
                                    style={{ color: currentPalette.primary }}
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            6. Intellectual Property Rights
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    6.1 Our Rights:
                                </strong>{" "}
                                MailAgent, including its software, design,
                                features, and content, is owned by us and
                                protected by copyright, trademark, and other
                                intellectual property laws. You may not copy,
                                modify, distribute, or create derivative works
                                without our express permission.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    6.2 Your Content:
                                </strong>{" "}
                                You retain ownership of the content you create
                                using MailAgent. By using our service, you grant
                                us a limited license to process and store your
                                content solely for the purpose of providing our
                                services.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    6.3 AI-Generated Content:
                                </strong>{" "}
                                Content generated by our AI features is provided
                                "as is" without any warranties. You are
                                responsible for reviewing and editing
                                AI-generated content before use.
                            </p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            7. Disclaimer and Limitation of Liability
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    7.1 Service "As Is":
                                </strong>{" "}
                                MailAgent is provided "as is" and "as available"
                                without warranties of any kind, either express
                                or implied, including but not limited to
                                warranties of merchantability, fitness for a
                                particular purpose, or non-infringement.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    7.2 No Guarantee:
                                </strong>{" "}
                                We do not guarantee that the service will be
                                uninterrupted, secure, or error-free. We are not
                                responsible for any errors in AI-generated
                                content or decisions made based on such content.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    7.3 Limitation of Liability:
                                </strong>{" "}
                                To the maximum extent permitted by law, we shall
                                not be liable for any indirect, incidental,
                                special, consequential, or punitive damages, or
                                any loss of profits or revenues, whether
                                incurred directly or indirectly, or any loss of
                                data, use, goodwill, or other intangible losses
                                resulting from:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>
                                    Your use or inability to use the service
                                </li>
                                <li>
                                    Any unauthorized access to or use of our
                                    servers and/or any personal information
                                    stored therein
                                </li>
                                <li>
                                    Any interruption or cessation of
                                    transmission to or from the service
                                </li>
                                <li>
                                    Any bugs, viruses, or harmful code
                                    transmitted through the service
                                </li>
                                <li>
                                    Any errors or omissions in any content or
                                    for any loss or damage incurred as a result
                                    of the use of any content
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Termination */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            8. Account Termination
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    8.1 Your Right to Terminate:
                                </strong>{" "}
                                You may terminate your account at any time by
                                accessing your account settings or contacting us
                                directly.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    8.2 Our Right to Terminate:
                                </strong>{" "}
                                We reserve the right to suspend or terminate
                                your account and access to MailAgent at any
                                time, with or without cause or notice, including
                                if:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>You breach these Terms and Conditions</li>
                                <li>
                                    Your use of the service violates applicable
                                    laws or regulations
                                </li>
                                <li>
                                    Your account has been inactive for an
                                    extended period
                                </li>
                                <li>
                                    We determine that continuing your access may
                                    harm us or other users
                                </li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                <strong style={{ color: currentColors.text }}>
                                    8.3 Effect of Termination:
                                </strong>{" "}
                                Upon termination, your right to use MailAgent
                                will immediately cease. We may delete your data
                                in accordance with our data retention policies,
                                though we may retain certain information as
                                required by law.
                            </p>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            9. Changes to Terms
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            We reserve the right to modify these Terms and
                            Conditions at any time. We will notify users of any
                            material changes by updating the "Last Updated" date
                            at the top of this page. Your continued use of
                            MailAgent after such changes constitutes your
                            acceptance of the new Terms. We encourage you to
                            review these Terms periodically.
                        </p>
                    </section>

                    {/* Indemnification */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            10. Indemnification
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            You agree to indemnify, defend, and hold harmless
                            MailAgent and its officers, directors, employees,
                            agents, and affiliates from and against any claims,
                            liabilities, damages, losses, and expenses,
                            including reasonable attorney's fees, arising out of
                            or in any way connected with your access to or use
                            of the service, your violation of these Terms, or
                            your violation of any rights of another party.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            11. Governing Law and Dispute Resolution
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    11.1 Governing Law:
                                </strong>{" "}
                                These Terms shall be governed by and construed
                                in accordance with the laws of the jurisdiction
                                in which MailAgent operates, without regard to
                                its conflict of law provisions.
                            </p>
                            <p className="leading-relaxed">
                                <strong style={{ color: currentColors.text }}>
                                    11.2 Dispute Resolution:
                                </strong>{" "}
                                Any disputes arising out of or relating to these
                                Terms or the service shall first be attempted to
                                be resolved through good faith negotiations. If
                                unsuccessful, disputes may be resolved through
                                binding arbitration or litigation in the
                                appropriate courts.
                            </p>
                        </div>
                    </section>

                    {/* Third-Party Services */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            12. Third-Party Services and Links
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            MailAgent may contain links to third-party websites
                            or services, including email service providers and
                            AI services. We are not responsible for the content,
                            privacy policies, or practices of any third-party
                            sites or services. Your use of third-party services
                            is at your own risk and subject to their respective
                            terms and conditions.
                        </p>
                    </section>

                    {/* Severability */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            13. Severability
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            If any provision of these Terms is found to be
                            unenforceable or invalid, that provision will be
                            limited or eliminated to the minimum extent
                            necessary so that these Terms will otherwise remain
                            in full force and effect and enforceable.
                        </p>
                    </section>

                    {/* Entire Agreement */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            14. Entire Agreement
                        </h2>
                        <p
                            className="leading-relaxed"
                            style={{ color: currentColors.textSecondary }}
                        >
                            These Terms, together with our Privacy Policy,
                            constitute the entire agreement between you and
                            MailAgent regarding the use of the service and
                            supersede any prior agreements between you and
                            MailAgent relating to your use of the service.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-8">
                        <h2
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentColors.text }}
                        >
                            15. Contact Information
                        </h2>
                        <div
                            className="space-y-4"
                            style={{ color: currentColors.textSecondary }}
                        >
                            <p className="leading-relaxed">
                                If you have any questions about these Terms and
                                Conditions, please contact us:
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
                                    MailAgent Support
                                </p>
                                <p>Email: support@mailagent.com</p>
                                <p>Website: mailagent.com</p>
                            </div>
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
                            read, understood, and agree to be bound by these
                            Terms and Conditions.
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

export default TermsandConditions;
