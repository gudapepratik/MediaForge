import { Router } from "express";
import passport from "passport";
import { checkAuth } from "../middlewares/auth.middleware.js";

const router = Router()

router.get('/', (req,res) => {
    return res.json({message: "Welcome to MEDIAFORGE API"})
})

router.get('/protected',checkAuth, (req,res) => {
    return res.status(200).json({message: "User is authenticated"})
})

router.get('/current-user', checkAuth, (req,res) => {
    return res.status(200).json({user: req.user})
})

export default router