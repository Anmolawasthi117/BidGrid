import mongoose, { Schema } from "mongoose";

const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Vendor email is required"],
      lowercase: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique email per user
vendorSchema.index({ email: 1, createdBy: 1 }, { unique: true });

export const Vendor = mongoose.model("Vendor", vendorSchema);
