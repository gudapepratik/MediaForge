import * as AWS from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const s3 = new AWS.S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT || "https://b1f051270c57fc06756a331474317b0d.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || "3a6bdc33f09cdaf72cfdba86f2f606f5",
        secretAccessKey: process.env.STORAGE_SECRET_KEY || "fecddd7eb5404c4efd9345bed27f933dbe82d260780df080bee36913212103b2",
    },
    // forcePathStyle: process.env.STORAGE_ENDPOINT.includes("localhost"), // required for minio dev only
});


export const getSignedUploadUrl = async (userId, fileName, videoId, contentType) => {
    try {
        const key = `videos/${userId}/${videoId}/original/${fileName}`;

        const command = new AWS.PutObjectCommand({
            Bucket: process.env.STORAGE_BUCKET || "temp-videos-mediaforge",
            Key: key,
            ContentType: contentType
        })

        const url = await getSignedUrl(s3, command, {expiresIn: 60 * 15 /* 15 minutes */ })

        return {url, key};
    } catch (error) {
        console.log("Signing Error", error?.message)
        throw error;
    }
}