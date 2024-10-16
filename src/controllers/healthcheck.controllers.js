import { APIRessponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler (async(req,res) => {
    return res.this.status(200).json(new APIRessponse(200,[],"Every thing is good"))
})

export {healthCheck}