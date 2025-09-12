import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import { createUploadPartPresignedUrl, getUploadById, getUploads, getUploadStatus, markMultiPartUploadComplete, markUploadPartCompleted, markUploadPartFailed, markVideoUploadFailed, markVideoUploadSuccess, requestMultiPartUpload, requestVideoUpload } from "../controllers/videos.controllers.js";

const router = Router()


router.post('/upload-request', checkAuth, requestVideoUpload);
router.post('/mark-upload-success/:videoId', checkAuth, markVideoUploadSuccess);
router.post('/mark-upload-fail/:videoId', checkAuth, markVideoUploadFailed);
router.post('/create-multipart-upload-request', checkAuth, requestMultiPartUpload);
router.get('/pending-uploads/:uploadId', checkAuth, getUploadById);
router.get('/pending-uploads', checkAuth, getUploads);
router.get('/upload-status/:videoId', checkAuth, getUploadStatus);
router.get('/pending-upload-parts/:videoId', checkAuth, getUploadStatus);
router.post('/upload-part-request/:uploadId/:partId', checkAuth, createUploadPartPresignedUrl);
router.put('/mark-upload-part-failed/:partId', checkAuth, markUploadPartFailed);
router.put('/mark-upload-part-completed/:partId', checkAuth, markUploadPartCompleted);
router.delete('/cancel-multipart-upload/:videoId', checkAuth, )
router.put('/complete-multipart-upload/:videoId', checkAuth, markMultiPartUploadComplete);

export default router;