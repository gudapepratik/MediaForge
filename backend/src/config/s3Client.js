import * as AWS from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import fs from 'fs'

const s3 = new AWS.S3Client({
    region: process.env.STORAGE_REGION,
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.STORAGE_ACCESSKEY,
        secretAccessKey: process.env.STORAGE_SECRETKEY,
    },
    // forcePathStyle: process.env.STORAGE_ENDPOINT.includes("localhost"), // required for minio dev only
    forcePathStyle: true
});

const getUploadKey = (userId, fileName, videoId) => {
    return `videos/${userId}/${videoId}/original/${fileName}`;
}

const BUCKET = process.env.STORAGE_BUCKET;

export const createUploadObjectUrl = async (userId, fileName, videoId, contentType) => {
    try {
        const key = `videos/${userId}/${videoId}/original/${fileName}`;
        const command = new AWS.PutObjectCommand({
            Bucket: BUCKET,
            Key: getUploadKey(userId, fileName, videoId),
            ContentType: contentType
        })

        const url = await getSignedUrl(s3, command, {expiresIn: 60 * 15 /* 15 minutes */ })

        return {url, key};
    } catch (error) {
        console.log("createUploadObjectUrl: Error", error?.message)
        throw error;
    }
}

export const createUploadPartUrl = async (key, partNumber, uploadId) => {
    try {
        const command = new AWS.UploadPartCommand({
            Bucket: BUCKET,
            Key: key,
            PartNumber: Number(partNumber),
            UploadId: uploadId,
        })
    
        const url = await getSignedUrl(s3, command, {
            expiresIn: 60 * 60
        })
    
        return {url};
    } catch (error) {
        console.log("createUploadPartUrl: Error", error?.message)
        throw error;
    }
}

export const createMultiPartUpload  = async (userId, fileName, videoId, contentType) => {
    try {
        const key = getUploadKey(userId, fileName, videoId);

        const command = new AWS.CreateMultipartUploadCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType
        })
    
        const {UploadId} = await s3.send(command);

        return {key, UploadId};
    } catch (error) {
        console.log("createMultiPartUpload: Error", error?.message)
        throw error;
    }
}

export const completeMultiPartUpload  = async (key, uploadId, parts) => {
    try {
        const command = new AWS.CompleteMultipartUploadCommand({
            Bucket: BUCKET,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts
            },
        })
    
        const {ETag, Location, Key} = await s3.send(command);
        
        return {success: true, ETag, Location, Key};
    } catch (error) {
        console.log("completeMultiPartUpload: Error", error?.message)
        throw error;
    }
}

export const abortMultiPartUpload  = async (key, uploadId) => {
    try {
        const command = new AWS.AbortMultipartUploadCommand({
            Bucket: BUCKET,
            Key: key,
            UploadId: uploadId,
        })
    
        await s3.send(command);

        return {success: true};
    } catch (error) {
        console.log(error)
        console.log("abortMultiPartUpload: Error", error?.message)
        throw error;
    }
}

export const listUploadParts  = async (key, uploadId) => {
    try {
        const command = new AWS.ListPartsCommand({
            Bucket: BUCKET,
            Key: key,
            UploadId: uploadId
        })
    
        const {Parts} = await s3.send(command);

        // Parts is an array of Part objects which contains {partNumber, size, Etags} of each parts
        return {Parts};
    } catch (error) {
        console.log("listUploadParts: Error", error?.message)
        throw error;
    }
}

export const deleteHlsVideoFiles = async (userId, videoId) => {
  try {
    const keyPrefix = `videos/${userId}/${videoId}/hls/`;
    const listObjectsCommand = new AWS.ListObjectsV2Command({
      Bucket: process.env.PUBLIC_BUCKET,
      Prefix: keyPrefix,
    })

    const {Contents} = await s3.send(listObjectsCommand);

    const keys = Contents.map((value) => ({Key: value.Key}));

    const deleteObjectsCommand = new AWS.DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: Contents
      }
    })

    await s3.send(deleteObjectsCommand);
  } catch (error) {
    console.log("delete Video failed", error?.message)
    throw error;
  }
}

export const uploadImage = async (userId, videoId, imageFile, isAvatar = false) => {
  try {
    const filename = imageFile.filename;
    const fileExt = imageFile.mimetype.split('/')[1]
    const Key = isAvatar ? `users/${userId}/avatar/${filename}.${fileExt}` : `videos/${userId}/${videoId}/metadata/${filename}.${fileExt}`;

    const fileContent = fs.readFileSync(imageFile.path);
    
    const uploadCommand = new AWS.PutObjectCommand({
      Bucket: process.env.PUBLIC_BUCKET,
      Key,
      Body: fileContent,
      ContentType: imageFile.mimetype
    })

    await s3.send(uploadCommand);

    return {url: `${process.env.R2_PUBLIC_URL}/${Key}`}
  } catch (error) {
    console.log("S3 Error: uploadImage", error);
    throw error
  }
}

export const deleteImage = async (key) => {
  try {
    const command = new AWS.DeleteObjectCommand({
      BUCKET: process.env.PUBLIC_BUCKET,
      Key: key
    })

    await s3.send(command);
  } catch (error) {
    console.log("S3 Error: deleteImage", error);
    throw error
  }
}