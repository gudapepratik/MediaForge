import {S3Client} from '@aws-sdk/client-s3'

const STORAGE_REGION = process.env.STORAGE_REGION;
const STORAGE_ACCESSKEY = process.env.STORAGE_ACCESSKEY;
const STORAGE_SECRETKEY = process.env.STORAGE_SECRETKEY;
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT;

const s3 = new S3Client({
  region: STORAGE_REGION,
  credentials: {
    accessKeyId: STORAGE_ACCESSKEY,
    secretAccessKey: STORAGE_SECRETKEY,
  },
  endpoint: STORAGE_ENDPOINT
})

export default s3;