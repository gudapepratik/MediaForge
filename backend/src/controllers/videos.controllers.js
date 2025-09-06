import { prisma } from "../config/db.js"
import { createUploadObjectUrl} from "../config/s3Client.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

export const requestVideoUpload = async (req, res, next) => {
    try {
        const {fileName, fileSize, contentType} = req.query
        const user = req.user

        if(!user)
            return next(new ApiError(401, "User not authenticated, Please login"))

        if(!fileName?.trim() || !fileSize || isNaN(fileSize) || !contentType?.trim())
            return next(new ApiError(400, "Invalid or missing metadata"))

        // new entry in db
        const video = await prisma.video.create({
            data: {
                userId: user.id,
                fileName,
                fileSize: Number(fileSize),
                contentType
            }
        })
        console.log(process.env.STORAGE_REGION)
        
        // create presigned url
        const {url, key} = await createUploadObjectUrl(user.id, fileName, video.id, contentType);

        // update video 
        await prisma.video.update({
            where: {id: video.id},
            data: {
                storageKey: key
            }
        })

        return res.status(201).json(new ApiResponse(201, {videoId: video.id, uploadUrl: url}, "Presigned Url created successfully"))

    } catch (error) {
        console.error("requestVideoUpload error:", error);
        return next(new ApiError(500, "Internal Server Error",error))
    }
}

export const markVideoUploadSuccess = async (req, res, next) => {
    try {
        const {videoId} = req.params

        await prisma.video.update({
            where: {id: videoId},
            data: {
                status: "UPLOADED"
            }
        })

        // add job queue (spin off container)

        return res.status(200).json(new ApiResponse(200, null, "Video uploaded successfully, transcoding in progress.."))
    } catch (error) {
        console.error("markVideoUpload error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

export const markVideoUploadFailed = async (req,res,next) => {
    try {
        const {videoId} = req.params

        await prisma.video.update({
            where: {id: videoId},
            data: {
                status: "FAILED"
            }
        })

        return res.status(200).json(new ApiResponse(200, null, "Video upload failed, please try again later"))
    } catch (error) {
        console.error("markVideoUploadFailed error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}