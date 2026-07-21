import { BlobServiceClient } from "@azure/storage-blob";

const CONTAINER_NAME = "dispatch";

function getContainerClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set.");
  }
  const serviceClient = BlobServiceClient.fromConnectionString(connectionString);
  return serviceClient.getContainerClient(CONTAINER_NAME);
}

export async function writeJsonBlob(blobPath: string, data: unknown): Promise<void> {
  const container = getContainerClient();
  await container.createIfNotExists();
  const blockBlobClient = container.getBlockBlobClient(blobPath);
  const content = JSON.stringify(data, null, 2);
  await blockBlobClient.upload(content, Buffer.byteLength(content), {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });
}

export async function readJsonBlob<T>(blobPath: string): Promise<T | null> {
  const container = getContainerClient();
  const blockBlobClient = container.getBlockBlobClient(blobPath);
  const exists = await blockBlobClient.exists();
  if (!exists) {
    return null;
  }
  const downloadResponse = await blockBlobClient.download();
  const content = await streamToString(downloadResponse.readableStreamBody);
  return JSON.parse(content) as T;
}

async function streamToString(
  readableStream: NodeJS.ReadableStream | undefined
): Promise<string> {
  if (!readableStream) {
    return "";
  }
  const chunks: Buffer[] = [];
  for await (const chunk of readableStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
