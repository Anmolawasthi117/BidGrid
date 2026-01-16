import mongoose, { Schema } from "mongoose";

const proposalSchema = new Schema(
  {
    rfp: {
      type: Schema.Types.ObjectId,
      ref: "RFP",
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      // Not required - vendor may not be in the system
    },
    vendorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    vendorName: {
      type: String,
      default: "Unknown Vendor",
      trim: true,
    },
    
    // Price info (can come from form or AI parsing)
    price: {
      amount: Number,
      currency: { type: String, default: "USD" },
      breakdown: String,
    },
    timeline: String,
    deliveryDate: Date,
    terms: Schema.Types.Mixed, // Can be string or array
    notes: String,
    
    // Email ingestion fields
    source: {
      type: String,
      enum: ["form", "email"],
      default: "form",
    },
    originalEmail: {
      type: String, // Raw email body
    },
    emailSubject: String,
    attachmentTexts: [String], // Extracted PDF text
    
    // AI-parsed data
    parsedData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    // Scores and analysis
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiAnalysis: String,
    completeness: {
      type: Number,
      min: 0,
      max: 100,
    },
    
    // Status
    status: {
      type: String,
      enum: ["submitted", "parsed", "reviewed", "shortlisted", "rejected", "awarded"],
      default: "submitted",
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    reviewNotes: String,
  },
  { timestamps: true }
);

// Compound index for RFP + vendorEmail uniqueness
proposalSchema.index({ rfp: 1, vendorEmail: 1 }, { unique: true });

// Drop old incorrect index on startup
proposalSchema.on('index', async function() {
  try {
    const Proposal = this;
    const indexes = await Proposal.collection.indexes();
    for (const idx of indexes) {
      // Drop old rfp_1_vendor_1 index if it exists
      if (idx.name === 'rfp_1_vendor_1') {
        console.log('Dropping old index: rfp_1_vendor_1');
        await Proposal.collection.dropIndex('rfp_1_vendor_1');
        console.log('Old index dropped successfully');
      }
    }
  } catch (err) {
    // Index might not exist, that's fine
    if (!err.message.includes('not found')) {
      console.log('Index cleanup note:', err.message);
    }
  }
});

export const Proposal = mongoose.model("Proposal", proposalSchema);



