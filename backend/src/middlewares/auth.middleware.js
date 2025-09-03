export const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()) 
        return next();

    return res.status(401).json({message: "unauthorized required, please Login."})
}