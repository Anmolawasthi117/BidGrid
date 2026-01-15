import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const rfpSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    quantity: {
      type: Number,
    },
    budget: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    deadline: {
      type: Date,
    },
    specs: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["drafting", "draft", "sent", "closed"],
      default: "drafting",
    },
    vendors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chatHistory: [chatMessageSchema],
    isComplete: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const RFP = mongoose.model("RFP", rfpSchema);
