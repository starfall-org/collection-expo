// s3Client.js
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: "https://q0w7.sg.idrivee2-43.com",
  credentials: {
    accessKeyId: "8OBl9ve6KBiLAdnIReel",
    secretAccessKey: "RwoILuzZVKcRhtFfvXFSZqf6vHkPeF5eeWYvviy5",
  },
  forcePathStyle: true,
  region: "ap-southeast-1",
});

// App.js - giữ nguyên import
