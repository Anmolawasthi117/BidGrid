import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthcheack = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,"ok", "Everything is working fine" ))
})

export {healthcheack}