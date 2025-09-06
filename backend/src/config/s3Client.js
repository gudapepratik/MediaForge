import * as AWS from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const s3 = new AWS.S3Client({
    region: process.env.STORAGE_REGION,
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESSKEY,
        secretAccessKey: process.env.STORAGE_SECRETKEY,
    },
    // forcePathStyle: process.env.STORAGE_ENDPOINT.includes("localhost"), // required for minio dev only
    // forcePathStyle: true
});


export const getSignedUploadUrl = async (userId, fileName, videoId, contentType) => {
    try {
        const key = `videos/${userId}/${videoId}/original/${fileName}`;
        const command = new AWS.PutObjectCommand({
            Bucket: process.env.STORAGE_BUCKET,
            Key: key,
            ContentType: contentType
        })
        
        const url = await getSignedUrl(s3, command, {expiresIn: 60 * 15 /* 15 minutes */ })

        return {url, key};
    } catch (error) {
        console.log("getSignedUploadUrl: Error", error?.message)
        throw error;
    }
}