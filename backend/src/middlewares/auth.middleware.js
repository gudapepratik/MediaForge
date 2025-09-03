export const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res
    .status(401)
    .json({ success: false, message: "unauthorized required, please Login." });
};
