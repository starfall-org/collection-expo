import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.KEY,
  secretAccessKey: process.env.SECRET,
});
