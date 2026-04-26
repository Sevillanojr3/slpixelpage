import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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

/** Read a JSON object from R2. Returns null if the key does not exist. */
export async function getJson(key) {
  try {
    const res = await getClient().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    const text = await res.Body.transformToString('utf8');
    return JSON.parse(text);
  } catch (e) {
    if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}

/** Write a JSON object to R2. */
export async function putJson(key, data) {
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    Body: JSON.stringify(data, null, 2) + '\n',
    ContentType: 'application/json; charset=utf-8',
  });
  await getClient().send(cmd);
}
