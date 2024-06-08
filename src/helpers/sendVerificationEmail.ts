import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmails(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: "Verification Code | Mystry Message",
            react: VerificationEmail({username, otp: verifyCode})
        })

        return {
            success: true,
            message: "Verification Email Sent Successfully"
        }
    } catch (error) {
        console.log("Error sending Verification Email", error);
        return{
            success: false,
            message: "Failed to send verification email"
        }
    }
}