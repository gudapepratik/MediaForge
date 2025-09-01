import { Router } from "express";

const router = Router()

router.get('/', (req,res) => {
    return res.json({message: "Welcome to MEDIAFORGE API"})
})
export default router