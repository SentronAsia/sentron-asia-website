import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Storage adapter pattern — supports Cloudinary or AWS S3.
 * Set STORAGE_PROVIDER=cloudinary|s3 in .env
 */

// ---- Cloudinary adapter ----
function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function cloudinaryUpload(fileBuffer, options = {}) {
  initCloudinary();
  return new Promise((resolve, reject) => {
    // Cloudinary requires resource_type: "raw" for PDFs, Word, Excel, text docs
    const isDoc = options.resource_type === 'raw' ||
      (options.mimeType && !options.mimeType.startsWith('image/') && !options.mimeType.startsWith('video/')) ||
      (options.filename && /\.(pdf|doc|docx|xls|xlsx|txt|csv|ppt|pptx)$/i.test(options.filename));

    const resourceType = options.resource_type || (isDoc ? 'raw' : 'auto');

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'sentron-documents',
        resource_type: resourceType,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          key: result.public_id,
          size: result.bytes,
          mimeType: `${result.resource_type}/${result.format}`,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

async function cloudinaryDelete(publicId) {
  initCloudinary();
  return cloudinary.uploader.destroy(publicId);
}

async function cloudinarySignedUrl(publicId, expiresInSeconds = 3600) {
  initCloudinary();
  const url = cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
  return url;
}

// ---- S3 adapter ----
function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function s3Upload(fileBuffer, options = {}) {
  const client = getS3Client();
  const key = `${options.folder || 'sentron-media'}/${Date.now()}-${options.filename || 'file'}`;

  await client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: options.mimeType || 'application/octet-stream',
  }));

  return {
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    publicId: key,
    key,
    size: fileBuffer.length,
    mimeType: options.mimeType,
  };
}

async function s3Delete(key) {
  const client = getS3Client();
  return client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }));
}

async function s3GetSignedUrl(key, expiresInSeconds = 3600) {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return getS3SignedUrl(client, command, { expiresIn: expiresInSeconds });
}

// ---- Public API ----
const getProvider = () => process.env.STORAGE_PROVIDER || 'cloudinary';

export async function uploadFile(fileBuffer, options = {}) {
  const provider = getProvider();

  // If S3 is explicitly chosen and configured
  if (provider === 's3' && process.env.AWS_S3_BUCKET) {
    return s3Upload(fileBuffer, options);
  }

  // If Cloudinary is configured
  if (provider === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    return cloudinaryUpload(fileBuffer, options);
  }

  // If S3 credentials are present even if provider wasn't set to s3
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
    return s3Upload(fileBuffer, options);
  }

  // Graceful local development fallback: convert buffer to base64 Data URL
  const mimeType = options.mimeType || 'image/png';
  const base64 = fileBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const mockId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  return {
    url: dataUrl,
    publicId: mockId,
    key: mockId,
    size: fileBuffer.length,
    mimeType,
  };
}

export async function deleteFile(publicIdOrKey) {
  if (!publicIdOrKey || publicIdOrKey.startsWith('local-') || publicIdOrKey.startsWith('data-')) {
    return { success: true };
  }
  if (getProvider() === 's3') return s3Delete(publicIdOrKey);
  return cloudinaryDelete(publicIdOrKey);
}

export async function getSignedUrl(publicIdOrKey, expiresInSeconds = 3600) {
  if (!publicIdOrKey || publicIdOrKey.startsWith('data:')) return publicIdOrKey;
  if (getProvider() === 's3') return s3GetSignedUrl(publicIdOrKey, expiresInSeconds);
  return cloudinarySignedUrl(publicIdOrKey, expiresInSeconds);
}
