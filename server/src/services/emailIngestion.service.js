import imaps from "imap-simple";
import { simpleParser } from "mailparser";
import { RFP } from "../models/rfp.model.js";

class EmailIngestionService {
  constructor() {
    this.connection = null;
  }

  // Get IMAP config from environment
  getConfig() {
    return {
      imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST || "imap.gmail.com",
        port: parseInt(process.env.IMAP_PORT) || 993,
        tls: true,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false },
      },
    };
  }

  // Connect to email server
  async connect() {
    if (!this.connection) {
      const config = this.getConfig();
      console.log(`Connecting to IMAP: ${config.imap.host}...`);
      this.connection = await imaps.connect(config);
      console.log("IMAP connected successfully");
    }
    return this.connection;
  }

  // Disconnect from email server
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log("IMAP disconnected");
    }
  }

  // Fetch unread emails
  async fetchUnreadEmails() {
    try {
      console.log("Fetching unread emails...");
      const connection = await this.connect();
      
      console.log("Opening INBOX...");
      await connection.openBox("INBOX");
      console.log("INBOX opened");

      // Search for unread emails
      const searchCriteria = ["UNSEEN"];
      const fetchOptions = {
        bodies: ["HEADER", "TEXT", ""],
        markSeen: false, // Don't mark as read yet
        struct: true,
      };

      console.log("Searching for unread emails...");
      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`Found ${messages.length} unread emails`);

      const parsedEmails = [];
      for (const message of messages) {
        try {
          console.log(`Parsing email UID: ${message.attributes.uid}`);
          const all = message.parts.find((p) => p.which === "");
          const parsed = await simpleParser(all.body);
          
          console.log(`Email from: ${parsed.from?.text}, Subject: ${parsed.subject}`);
          
          parsedEmails.push({
            uid: message.attributes.uid,
            from: parsed.from?.text || "",
            fromAddress: parsed.from?.value?.[0]?.address || "",
            subject: parsed.subject || "",
            date: parsed.date,
            text: parsed.text || "",
            html: parsed.html || "",
            attachments: parsed.attachments || [],
          });
        } catch (err) {
          console.error("Error parsing email:", err.message);
        }
      }

      return parsedEmails;
    } catch (err) {
      console.error("Error fetching emails:", err.message);
      throw err;
    }
  }

  // Match email to RFP by subject or vendor email
  async matchEmailToRFP(email, userId) {
    // Try to find RFP by title in subject
    const rfps = await RFP.find({ 
      createdBy: userId, 
      status: "sent" 
    }).populate("vendors");

    for (const rfp of rfps) {
      // Check if subject contains RFP title
      if (email.subject.toLowerCase().includes(rfp.title?.toLowerCase() || "")) {
        return rfp;
      }
      
      // Check if sender is a known vendor for this RFP
      const vendorEmails = rfp.vendors?.map(v => v.email?.toLowerCase()) || [];
      if (vendorEmails.includes(email.fromAddress.toLowerCase())) {
        return rfp;
      }
    }

    return null;
  }

  // Mark email as read
  async markAsRead(uid) {
    const connection = await this.connect();
    await connection.addFlags(uid, ["\\Seen"]);
  }

  // Ingest emails for a specific RFP
  async ingestEmailsForRFP(rfpId, userId) {
    const rfp = await RFP.findOne({ _id: rfpId, createdBy: userId })
      .populate("vendors");
    
    if (!rfp) {
      throw new Error("RFP not found");
    }

    const emails = await this.fetchUnreadEmails();
    const matchedEmails = [];

    const vendorEmails = rfp.vendors?.map(v => v.email?.toLowerCase()) || [];

    for (const email of emails) {
      // Match by vendor email or subject containing RFP title
      const senderLower = email.fromAddress.toLowerCase();
      const subjectLower = email.subject.toLowerCase();
      const rfpTitleLower = (rfp.title || "").toLowerCase();

      if (
        vendorEmails.includes(senderLower) ||
        subjectLower.includes(rfpTitleLower) ||
        subjectLower.includes("rfp") ||
        subjectLower.includes("proposal") ||
        subjectLower.includes("quote")
      ) {
        matchedEmails.push({
          ...email,
          rfpId: rfp._id,
        });
      }
    }

    console.log(`Matched ${matchedEmails.length} emails to RFP: ${rfp.title}`);
    return matchedEmails;
  }
}

export const emailIngestionService = new EmailIngestionService();
