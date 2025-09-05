import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import { markVideoUploadFailed, markVideoUploadSuccess, requestVideoUpload } from "../controllers/videos.controllers.js";

const router = Router()


router.post('/upload-request', checkAuth, requestVideoUpload);
router.post('/mark-upload-success/:videoId', checkAuth, markVideoUploadSuccess);
router.post('/mark-upload-fail/:videoId', checkAuth, markVideoUploadFailed);

export default router;