export interface SendEmail {
    receiverEmail: string;
    emailMessage: string;
    subject: string;
}

export interface SendEmailResponse {
    message: string;
    success: boolean;
    error?: string;
}

// async sendEmail(data: SendEmail): Promise<SendEmailResponse> {
//     const requestBody = {
//         receiver_email: data.receiverEmail,
//         email_message: data.emailMessage,
//         subject: data.subject,
//     };
//     return this.makeRequest<SendEmailResponse>("/send-email", {
//         method: "POST",
//         body: JSON.stringify(requestBody),
//     });
// }
