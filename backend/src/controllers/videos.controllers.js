import { prisma } from "../config/db.js"
import { abortMultiPartUpload, completeMultiPartUpload, createMultiPartUpload, createUploadObjectUrl, createUploadPartUrl} from "../config/s3Client.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const CHUNK_SIZE = 10000;

// stale
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

// stale
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

// stale
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

// fetches current upload status for a given video
export const getUploadStatus = async (req,res,next) => {
    try {
        const {videoId} = req.params

        const upload = await prisma.upload.findUnique({
            where: {videoId: videoId},
            select: {
                id: true,
                status: true
            }
        })

        if(!upload)
            return next(new ApiError(404, "Upload Not Found"))

        return res.status(200).json(new ApiResponse(200, {...upload}, "Upload Status fetched successfully."))
    } catch (error) {
        console.error("getUploadStatus error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// when user wants to cancel an video upload
export const markVideoUploadCancelled = async (req,res,next) => {
    try {
        const {videoId} = req.params;

        const video = await prisma.video.findUnique({
            where: {id: videoId},
            include: {
                upload: {
                    select: {
                        id: true,
                        uploadID: true
                    }
                }
            },
            select: {
                storageKey: true,
                upload: true
            }
        })

        try {
            await abortMultiPartUpload(video.storageKey, video.upload.uploadId);
        } catch (error) {
            return next(new ApiError(500, "markVideoUploadCancelled Error", error))
        }

        // transaction
        await prisma.$transaction(async (tx) => {
            // remove upload parts and mark upload as Cancelled
            await tx.uploadPart.deleteMany({
                where: {uploadId: video.upload.id}
            })

            // update upload status
            await tx.upload.update({
                where: {id: video.upload.id},
                data: {
                    status: "ABORTED"
                }
            })

            // update video status
            await tx.video.update({
                where: {id: videoId},
                data: {
                    storageKey: null,
                    status: "CANCELLED"
                }
            })
        })

        return res.status(200).json(new ApiResponse(200, null, "Video upload is cancelled successfully"))
    } catch (error) {
        console.error("markVideoUploadCancelled error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// issue presigned url for parts to be uploaded
export const getUploadPartUrl = async (req,res,next) => {
    try {
        const {partId,uploadId} = req.params;

        const upload = await prisma.upload.findUnique({
            where: {id: uploadId},
            include: {
                uploadParts: {
                    where: {id: partId}
                },
                video: {
                    select: {
                        storageKey: true,
                    }
                }
            },
            select: {
                uploadId: true,
                video: true,
                uploadParts: true
            }
        })

        if(!upload)
            return next(new ApiError(404, "Upload Not Found"))

        const {url} = await createUploadPartUrl(upload.video.id,upload.uploadParts[0].partNo, upload.uploadID)

        return res.status(200).json(new ApiResponse(200, {url}, "Presigned url for requested part has been issued successfully"));
    } catch (error) {
        console.log("getUploadPartUrl Error", error);
        return next(new ApiError(500, "Internal server error"))
    }
}

// user request to upload a file using multi part upload feature
export const requestMultiPartUpload = async (req, res, next) => {
    try {
        const {fileName, fileSize, contentType} = req.query
        const user = req.user

        if(!user)
            return next(new ApiError(401, "user not authenticated"))

        if(!fileName || !fileSize || !contentType)
            return next(new ApiError(400, "Invalid or missing data"))

        
        // calculate chunks (no. of parts)
        const chunks = Math.ceil(Number(fileSize) / CHUNK_SIZE);

        // run transaction for consistency and automatic rollback if error
        const result = await prisma.$transaction(async (tx) => {
            // create new entry in db
            const video = await tx.video.create({
                data: {
                    fileName,
                    fileSize: Number(fileSize),
                    contentType,
                    userId: user.id
                }
            })

            const {UploadId, key} = await createMultiPartUpload(user.id, fileName, video.id, contentType)

            await tx.video.update({
                where: {id: video.id},
                data: {
                    storageKey: key
                }
            })

            // create new upload
            const upload = await tx.upload.create({
                data: {
                    uploadId: UploadId,
                    videoId: video.id,
                }
            })

            // create parts array
            const parts = Array.from({length: chunks}, (_, index) => ({
                partNo: index + 1,
                partSize: (index + 1 == chunks) ? (Number(fileSize) % CHUNK_SIZE || CHUNK_SIZE) : CHUNK_SIZE,
                uploadId: upload.id
            }))

            // create parts
            await prisma.uploadPart.createMany({
                data: parts
            })

            return {uploadId: UploadId, videoId: video.id, key}
        })


        return res.status(200).json(new ApiResponse(200, {uploadId: result.uploadId, videoId: result.videoId, key: result.key, totalParts: chunks, chunkSize: CHUNK_SIZE}, "Multipart Upload initiated successfully"))
    } catch (error) {
        console.error("requestMultiPartUpload error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

export const markMultiPartUploadComplete = async (req,res,next) => {
    try {
        const {videoId} = req.params

        const upload = await prisma.upload.findUnique({
            where: {videoId: videoId},
            include: {
                uploadParts: {
                    select: {
                        eTag: true,
                        partNo: true
                    },
                    orderBy: {partNo: 'asc'}
                },
                video: {
                    select: {
                        storageKey: true
                    }
                }
            },
        })

        if(!upload)
            return next(new ApiError(404, "Upload Not Found"))

        // build parts array
        const parts = upload.uploadParts.map((part) => ({ETag: part.eTag, PartNumber:part.partNo}));
        const key = upload.video.storageKey;

        let s3Response;
        try {
            s3Response = await completeMultiPartUpload(key, upload.UploadID, parts);
        } catch (error) {
            return next(new ApiError(500, "Failed to finalize upload with storage"))
        }

        await prisma.$transaction(async (tx) => {
            // mark video as successed
            await tx.video.update({
                where: {id: videoId},
                data: {
                    status: "UPLOADED",
                }
            })

            // keep it until video transcoding is completed
            await tx.upload.update({
                where: {id: upload.id},
                data: {
                    status: "COMPLETED"
                }
            })
        })

        // last step - add to processing queue

        return res.status(200).json(new ApiResponse(200, {url: s3Response.Location}, "Video uploaded successfully, transcoding in progress.."))
    } catch (error) {
        console.error("markMultiPartUploadComplete error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// send all the upload parts for a given video
export const getUploadParts = async (req,res,next) => {
    try {
        const {videoId} = req.params

        const upload = await prisma.upload.findUnique({
            where: {videoId: videoId},
            include: {
                uploadParts: {
                    select: {
                        id: true,
                        eTag: true,
                        partNo: true,
                        partSize: true,
                    },
                    orderBy: {partNo: 'asc'},
                }
            },
        })

        if(!upload)
            return next(new ApiError(404, "Upload Not Found"))

        return res.status(200).json(new ApiResponse(200, {parts: upload.uploadParts}, "Upload Parts fetched successfully."))
    } catch (error) {
        console.error("getUploadParts error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}