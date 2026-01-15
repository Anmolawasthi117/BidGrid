import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vendor } from "../models/vendor.model.js";
import {
  createVendorSchema,
  updateVendorSchema,
  vendorIdSchema,
} from "../validators/vendor.validation.js";

// Create a new vendor
const createVendor = asyncHandler(async (req, res) => {
  // Validate request body
  const validationResult = createVendorSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, validationResult.error.errors[0].message);
  }

  const { name, email, company, phone, tags, notes } = validationResult.data;

  // Check if vendor with this email already exists for this user
  const existingVendor = await Vendor.findOne({
    email,
    createdBy: req.user._id,
  });

  if (existingVendor) {
    throw new ApiError(409, "A vendor with this email already exists");
  }

  const vendor = await Vendor.create({
    name,
    email,
    company,
    phone,
    tags,
    notes,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, vendor, "Vendor created successfully"));
});

// Get all vendors for the logged-in user
const getVendors = asyncHandler(async (req, res) => {
  const { search, tag, page = 1, limit = 50 } = req.query;

  const query = { createdBy: req.user._id };

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  // Tag filter
  if (tag) {
    query.tags = tag.toLowerCase();
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v"),
    Vendor.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      "Vendors fetched successfully"
    )
  );
});

// Get a single vendor by ID
const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  const idValidation = vendorIdSchema.safeParse({ id });
  if (!idValidation.success) {
    throw new ApiError(400, "Invalid vendor ID");
  }

  const vendor = await Vendor.findOne({
    _id: id,
    createdBy: req.user._id,
  }).select("-__v");

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor fetched successfully"));
});

// Update a vendor
const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  const idValidation = vendorIdSchema.safeParse({ id });
  if (!idValidation.success) {
    throw new ApiError(400, "Invalid vendor ID");
  }

  // Validate request body
  const validationResult = updateVendorSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new ApiError(400, validationResult.error.errors[0].message);
  }

  const updateData = validationResult.data;

  // Check if email is being changed and if it conflicts with existing vendor
  if (updateData.email) {
    const existingVendor = await Vendor.findOne({
      email: updateData.email,
      createdBy: req.user._id,
      _id: { $ne: id },
    });

    if (existingVendor) {
      throw new ApiError(409, "A vendor with this email already exists");
    }
  }

  const vendor = await Vendor.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  ).select("-__v");

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vendor, "Vendor updated successfully"));
});

// Delete a vendor
const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  const idValidation = vendorIdSchema.safeParse({ id });
  if (!idValidation.success) {
    throw new ApiError(400, "Invalid vendor ID");
  }

  const vendor = await Vendor.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Vendor deleted successfully"));
});

export { createVendor, getVendors, getVendorById, updateVendor, deleteVendor };
