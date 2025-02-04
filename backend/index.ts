import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "https://deno.land/x/aws_sdk@v3.32.0-1/client-s3/mod.ts";
import { getSignedUrl } from "https://deno.land/x/aws_sdk@v3.32.0-1/s3-request-presigner/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const BUCKET_NAME = "bosuutap";

const s3Client = new S3Client({
  endpoint: Deno.env.get("ENDPOINT"),
  credentials: {
    accessKeyId: Deno.env.get("ACCESS_KEY_ID"),
    secretAccessKey: Deno.env.get("SECRET_ACCESS_KEY"),
  },
  forcePathStyle: true,
  region: "ap-southeast-1",
});

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    if (path === "/api/files") {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      });

      const response = await s3Client.send(command);
      const files = response.Contents
        ? response.Contents.filter((obj: any) => obj.Key.endsWith(".mp4")).map(
            (obj: any) => obj.Key
          )
        : [];
      files.reverse();

      return new Response(JSON.stringify(files), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else if (path.startsWith("/api/presigned-url/")) {
      const fileName = decodeURIComponent(
        path.replace("/api/presigned-url/", "")
      );
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
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
