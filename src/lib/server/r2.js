import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envVar } from './env.js';

let client = null;

function getClient() {
  if (client) return client;
  const accountId = envVar('R2_ACCOUNT_ID');
  const accessKeyId = envVar('R2_ACCESS_KEY_ID');
  const secretAccessKey = envVar('R2_SECRET_ACCESS_KEY');
  const endpoint = envVar('R2_ENDPOINT') || `https://${accountId}.r2.cloudflarestorage.com`;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials missing in .env');
  }
  client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

export const bucket = () => envVar('R2_BUCKET');
export const publicUrl = () => (envVar('R2_PUBLIC_URL') || '').replace(/\/$/, '');

/** Generate a presigned PUT URL so the browser can upload directly to R2. */
export async function presignPut(key, contentType, expiresInSec = 600) {
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(getClient(), cmd, { expiresIn: expiresInSec });
  return url;
}

export async function deleteObject(key) {
  const cmd = new DeleteObjectCommand({ Bucket: bucket(), Key: key });
  await getClient().send(cmd);
}
