import { Router } from "express";
import passport from "passport";

const router = Router()

router.get('/', (req,res) => {
    return res.json({message: "Welcome to MEDIAFORGE API"})
})

router.get('/protected', (req,res) => {
    // console.log()
    if(!req.isAuthenticated())
        return res.json({message: "User Not Authenticated"})
    return res.json({message: req?.user})
})

export default router