import { Resend } from "resend";
import { generateRFPEmailTemplate } from "../templates/rfp-email.js";

class EmailService {
  constructor() {
    this.resend = null;
  }

  initialize() {
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("RESEND_API_KEY is not set in environment variables");
      }
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  async sendRFPEmail(vendor, rfp, senderEmail = "onboarding@resend.dev") {
    const resend = this.initialize();

    const html = generateRFPEmailTemplate(rfp, rfp.createdBy?.username || "A BidGrid User");
    
    // Get reply-to address from IMAP_USER (where vendor replies will be read)
    const replyTo = process.env.IMAP_USER || senderEmail;

    try {
      const { data, error } = await resend.emails.send({
        from: `BidGrid RFP <${senderEmail}>`,
        to: vendor.email,
        replyTo: replyTo, // Vendors will reply to your Gmail
        subject: `RFP: ${rfp.title || "New Request for Proposal"}`,
        html: html,
      });

      if (error) {
        console.error(`Failed to send email to ${vendor.email}:`, error);
        return { success: false, error: error.message, vendorId: vendor._id };
      }

      console.log(`Email sent to ${vendor.email}, ID: ${data.id}, Reply-To: ${replyTo}`);
      return { success: true, emailId: data.id, vendorId: vendor._id };
    } catch (err) {
      console.error(`Error sending email to ${vendor.email}:`, err);
      return { success: false, error: err.message, vendorId: vendor._id };
    }
  }

  async sendRFPToVendors(vendors, rfp, senderEmail) {
    const results = await Promise.all(
      vendors.map((vendor) => this.sendRFPEmail(vendor, rfp, senderEmail))
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return {
      totalSent: successful.length,
      totalFailed: failed.length,
      results,
    };
  }
}

export const emailService = new EmailService();

