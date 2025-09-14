import { prisma } from "../config/db.js"
import { abortMultiPartUpload, completeMultiPartUpload, createMultiPartUpload, createUploadObjectUrl, createUploadPartUrl} from "../config/s3Client.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 mb chunksize

// fetches uploads information of a given user
// GET /pending-uploads
export const getUploads = async (req, res, next) => {
    try {
        const user = req.user;
    
        if(!user)
            return next(new ApiError(404, "User Not Found"))
    
        const pendingVideos = await prisma.video.findMany({
            where: {
                AND: [
                    {userId: user.id},
                    {status: { equals: "CREATED"}} // not uploaded / failed / completed
                ]
            },
            include: {
                upload: {
                    include: {
                        uploadParts: true
                    }
                }
            }
        })
    
        const uploads = pendingVideos
            .map((video) => {
                if(!video.upload) return null;

                const totalParts = video.upload.uploadParts.length;
                const completedParts = video.upload.uploadParts.filter(part => part.status === "COMPLETED");
                const completedChunkSize = completedParts.reduce((sum, part) => sum + Number(part.partSize), 0)
                const completedPercentage = video.fileSize ? Math.round((completedChunkSize / Number(video.fileSize)) * 100) : 0;
                const remainingUploadSize = Number(video.fileSize) - completedChunkSize;

                // return {
                //     videoId: video.id,
                //     fileName: video.fileName,
                //     fileSize: Number(video.fileSize),
                //     contentType: video.contentType,
                //     status: video.status,
                //     createdAt: video.createdAt,
                //     updatedAt: video.updatedAt,

                //     uploadId: video.upload.id,
                //     s3UploadId: video.upload.uploadId,
                //     uploadStatus: video.upload.status,
                //     uploadCreatedAt: video.upload.createdAt,
                //     uploadUpdatedAt: video.upload.updatedAt,

                //     totalParts,
                //     completedParts: completedParts.length,
                //     remainingParts: totalParts - completedParts.length,
                //     percentage: completedPercentage,
                //     remainingUploadSize
                // }
                return {
                  videoId: video.id,
                  uploadId: video.upload.id,
                  fileName: video.fileName,
                  checkSum: video.hash,
                  chunkSize: CHUNK_SIZE,
                  totalParts,
                  percentage: completedPercentage,
                  status: video.upload.status.toLowerCase()
                }
            })
            .filter(Boolean) // remove nulls
        return res.status(200).json(new ApiResponse(200, {uploads}, "Upload fetched successfully"))
    } catch (error) {
        console.log("getUploads Error", error)
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// fetches uploads information of a given user and specific upload
// GET /pending-uploads/:uploadId
export const getUploadById = async (req, res, next) => {
    try {
        const user = req.user;
        const {uploadId} = req.query;
    
        if(!user)
            return next(new ApiError(404, "User Not Found"))
        
        if(!uploadId)
          throw new ApiError(400, "UploadId is missing or invalid")
    
        const upload = await prisma.upload.findUnique({
          where: {id: uploadId},
          include: {
            video: true,
            uploadParts: true
          }
        })

        const video = upload.video;

        const totalParts = upload.uploadParts.length;
        const completedParts = upload.uploadParts.filter(part => part.status === "COMPLETED");
        const completedChunkSize = completedParts.reduce((sum, part) => sum + Number(part.partSize), 0)
        const completedPercentage = video.fileSize ? Math.round((completedChunkSize / Number(video.fileSize)) * 100) : 0;
        const remainingUploadSize = Number(video.fileSize) - completedChunkSize;

        const data =  {
          videoId: video.id,
          fileName: video.fileName,
          fileSize: Number(video.fileSize),
          contentType: video.contentType,
          status: video.status,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,

          uploadId: upload.id,
          s3UploadId: upload.uploadId,
          uploadStatus: upload.status,
          uploadCreatedAt: upload.createdAt,
          uploadUpdatedAt: upload.updatedAt,

          totalParts,
          completedParts: completedParts.length,
          remainingParts: totalParts - completedParts.length,
          percentage: completedPercentage,
          remainingUploadSize,
          chunkSize: CHUNK_SIZE
        }

        return res.status(200).json(new ApiResponse(200, data, "Upload details fetched successfully"))
    } catch (error) {
        console.log("getUploadById Error", error)
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// fetches current upload status for a given video
// GET /upload-status/:videoId
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

// update upload status
// PATCH /upload-status/:videoId
export const updateUploadStatus = async (req,res,next) => {
    try {
        const {videoId} = req.params
        const {status} = req.body

        if(!videoId && !status) return next(new ApiError(400, "missing data or Invalid request"))

        const upload = await prisma.upload.update({
            where: {videoId: videoId},
            data: {
              status: status.toUpperCase()
            }
        })

        if(!upload)
            return next(new ApiError(404, "Upload Not Found"))

        return res.status(200).json(new ApiResponse(200, null, "Upload Status updated successfully."))
    } catch (error) {
        console.error("updateUploadStatus error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// user request to upload a file using multi part upload feature
// POST /create-multipart-upload-request
export const requestMultiPartUpload = async (req, res, next) => {
    try {
        const {fileName, fileSize, contentType, checksum} = req.body
        const user = req.user
      console.log("eeee")
        if(!user)
            return next(new ApiError(401, "user not authenticated"))

        if(!fileName || !fileSize || !contentType || !checksum)
            return next(new ApiError(400, "Invalid or missing data"))
        
        // check if file already exists
        const isExist = await prisma.video.findUnique({
          where: {
            hash: checksum.toString(),
          }
        })

        if (isExist) {
          return res.status(200).json(new ApiResponse(200, {
            isExist: true,
            videoId: isExist.id,
            status: isExist.status,
            message: "File already uploaded or in progress."
          }));
        }

        
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
                    userId: user.id,
                    hash: checksum
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
            await tx.uploadPart.createMany({
                data: parts
            })

            return {uploadId: upload.id, videoId: video.id, key}
        })


        return res.status(200).json(new ApiResponse(200, {isExist: false, uploadId: result.uploadId, videoId: result.videoId, key: result.key, totalParts: chunks, chunkSize: CHUNK_SIZE}, "Multipart Upload initiated successfully"))
    } catch (error) {
        console.error("requestMultiPartUpload error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// fetches all the "in-completed" upload parts for a given video
// GET /pending-upload-parts/:videoId
export const getPendingUploadParts = async (req,res,next) => {
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
                        status: true
                    },
                    orderBy: {partNo: 'asc'},
                }
            },
        })
        
        if(!upload)
            return next(new ApiError(404, "Upload Not Found"))
        
        // partSize if bigInt, thus need to be serialized
        const serializedParts = upload.uploadParts.map(part => ({
            ...part,
            partSize: part.partSize.toString()
        }))

        return res.status(200).json(new ApiResponse(200, {parts: serializedParts}, "Pending Upload Parts fetched successfully."))
    } catch (error) {
        console.error("getUploadParts error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// issue presigned url for parts to be uploaded
// POST /upload-part-request/:uploadId/:partId
export const createUploadPartPresignedUrl = async (req,res,next) => {
    try {
        const {partId,uploadId} = req.params;

        const response = await prisma.$transaction(async (tx) => {
            const upload = await tx.upload.findUnique({
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
                }
            })
    
            if(!upload)
                return next(new ApiError(404, "Upload Not Found"))
    
            const {url} = await createUploadPartUrl(upload.video.storageKey ,upload.uploadParts[0].partNo, upload.uploadId)

            // mark the upload part as initiated
            await tx.uploadPart.update({
                where: {id: partId},
                data: {
                    status: "INITIATED"
                }
            })

            return {url};
        })

        return res.status(200).json(new ApiResponse(200, {url: response.url}, "Presigned url for requested part has been issued successfully"));
    } catch (error) {
        console.log("createUploadPartPresignedUrl Error", error);
        return next(new ApiError(500, "Internal server error"))
    }
}

// marks given upload part as failed
// PUT /mark-upload-part-failed/:partId
export const markUploadPartFailed = async (req,res,next) => {
    try {
        const {partId} = req.params;

        await prisma.uploadPart.update({
            where: {id: partId},
            data: {
                status: "FAILED"
            }
        })

        return res.status(200).json(new ApiResponse(200, null, "Upload Part has been marked as failed"))
    } catch (error) {
        console.error("markUploadPartFailed error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// marks given upload part as completed
// PUT /mark-upload-part-completed/:partId
export const markUploadPartCompleted = async (req,res,next) => {
    try {
        const {partId} = req.params;
        const {eTag} = req.body

        await prisma.uploadPart.update({
            where: {id: partId},
            data: {
                status: "COMPLETED",
                eTag: eTag,
            }
        })

        return res.status(200).json(new ApiResponse(200, null, "Upload Part has been marked as Completed"))
    } catch (error) {
        console.error("markUploadPartCompleted error:", error);
        return next(new ApiError(500, "Internal Server Error"))
    }
}

// when user wants to cancel an video upload
// DELETE /cancel-multipart-upload/:videoId
export const markVideoUploadCancelled = async (req,res,next) => {
    try {
        const {videoId} = req.params;

        const video = await prisma.video.findUnique({
            where: {id: videoId},
            include: {
                upload: {
                    select: {
                        id: true,
                        uploadId: true
                    }
                }
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

// completes the multi part upload for given video
// c
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
            s3Response = await completeMultiPartUpload(key, upload.uploadId, parts);
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