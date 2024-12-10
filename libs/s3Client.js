// s3Client.js
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: process.env.ENDPOINT || "https://q0w7.sg.idrivee2-43.com",
  credentials: {
    accessKeyId: process.env.KEY || "8OBl9ve6KBiLAdnIReel",
    secretAccessKey:
      process.env.SECRET || "RwoILuzZVKcRhtFfvXFSZqf6vHkPeF5eeWYvviy5",
  },
  forcePathStyle: true,
  region: "ap-southeast-1",
});

// App.js - giữ nguyên import
