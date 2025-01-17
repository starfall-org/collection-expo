import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "https://deno.land/x/aws_sdk@v3.32.0-1/client-s3/mod.ts";
import { getSignedUrl } from "https://deno.land/x/aws_sdk@v3.32.0-1/s3-request-presigner/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const BUCKET_NAME = "bosuutap";
const FOLDER_NAME = "Movies";

const s3Client = new S3Client({
  endpoint: "https://q0w7.sg.idrivee2-43.com",
  credentials: {
    accessKeyId: "8OBl9ve6KBiLAdnIReel",
    secretAccessKey: "RwoILuzZVKcRhtFfvXFSZqf6vHkPeF5eeWYvviy5",
  },
  forcePathStyle: true,
  region: "ap-southeast-1",
});

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Thêm CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Xử lý OPTIONS request cho CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    if (path === "/api/files") {
      // Lấy danh sách files
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: FOLDER_NAME + "/",
      });

      const response = await s3Client.send(command);
      const files = response.Contents
        ? response.Contents.filter((obj) => obj.Key !== FOLDER_NAME + "/").map(
            (obj) => obj.Key.replace(FOLDER_NAME + "/", "")
          )
        : [];

      return new Response(JSON.stringify(files), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else if (path.startsWith("/api/presigned-url/")) {
      // Tạo presigned URL cho file
      const fileName = decodeURIComponent(
        path.replace("/api/presigned-url/", "")
      );
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${FOLDER_NAME}/${fileName}`,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return new Response(JSON.stringify({ url: presignedUrl }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    return new Response("Not Found", { 
      status: 404,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
}

serve(handler, { port: 8000 }); 