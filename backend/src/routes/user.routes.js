import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import upload from '../config/multer.js'
import { deleteAccount, updateUser } from "../controllers/user.controllers.js";

const router = Router();

router.put('/update', checkAuth, upload.single('avatar'), updateUser);
router.delete('/delete', checkAuth, deleteAccount)

export default router