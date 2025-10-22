import { Router } from "express";
import { checkAuth } from "../middlewares/auth.middleware.js";
import { createUploadPartPresignedUrl, deleteVideo, getPendingUploadParts, getPublicVideos, getReadyVideos, getTranscodes, getUploadById, getUploads, getUploadStatus, getVideoById, markMultiPartUploadComplete, markUploadPartCompleted, markUploadPartFailed, markVideoUploadCancelled, markVideoUploadFailed, markVideoUploadSuccess, requestMultiPartUpload, requestVideoUpload, updateUploadStatus } from "../controllers/videos.controllers.js";
import upload from '../config/multer.js'

const router = Router()


router.post('/upload-request', checkAuth, requestVideoUpload);
router.post('/mark-upload-success/:videoId', checkAuth, markVideoUploadSuccess);
router.post('/mark-upload-fail/:videoId', checkAuth, markVideoUploadFailed);
router.post('/create-multipart-upload-request', checkAuth, upload.single('thumbnail'), requestMultiPartUpload);
router.get('/pending-uploads/:uploadId', checkAuth, getUploadById);
router.get('/pending-uploads', checkAuth, getUploads);
router.get('/pending-transcodes', checkAuth, getTranscodes);
router.get('/upload-status/:videoId', checkAuth, getUploadStatus);
router.put('/upload-status/:videoId', checkAuth, updateUploadStatus);
router.get('/pending-upload-parts/:videoId', checkAuth, getPendingUploadParts);
router.post('/upload-part-request/:uploadId/:partId', checkAuth, createUploadPartPresignedUrl);
router.put('/mark-upload-part-failed/:partId', checkAuth, markUploadPartFailed);
router.put('/mark-upload-part-completed/:partId', checkAuth, markUploadPartCompleted);
router.delete('/cancel-multipart-upload/:videoId', checkAuth, markVideoUploadCancelled  )
router.put('/complete-multipart-upload/:videoId', checkAuth, markMultiPartUploadComplete);

router.get('/get-ready-videos', checkAuth, getReadyVideos);
router.get('/get-video/:videoId', getVideoById);
router.get('/get-public-videos', getPublicVideos);
router.delete('/delete-video/:videoId', checkAuth, deleteVideo);
export default router;