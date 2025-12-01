import { Router } from "express";
import authRoutes from './auth.routes.js'
import videoRoutes from './video.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.get('/', (req,res) => {
    return res.json({message: "Welcome to MEDIAFORGE API"})
})

router.get('/healthz', (req, res) => {
  return res.status(200);
})

router.use('/auth', authRoutes)
router.use('/videos', videoRoutes)
router.use('/user', userRoutes);

export default router