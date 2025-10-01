import { ApiError } from "../utils/ApiError.js";

export const checkAuth = (req, res, next) => {
  
  if (req.isAuthenticated()) {
    return next()   
  }
  
  return next(new ApiError(401, "Unauthorized Request!"))
};
