import crypto from "node:crypto";

export interface SignatureParams {
  clientId: string;
  requestId: string;
  requestTarget: string;
  requestTimestamp: string;
  secretKey: string;
  body?: unknown;
}

export function generateSignature(params: SignatureParams): string {
  const {
    clientId,
    requestId,
    requestTarget,
    requestTimestamp,
    secretKey,
    body,
  } = params;

  let componentSignature = `Client-Id:${clientId}\n`;
  componentSignature += `Request-Id:${requestId}\n`;
  componentSignature += `Request-Timestamp:${requestTimestamp}\n`;
  componentSignature += `Request-Target:${requestTarget}`;

  if (body) {
    const digest = generateDigest(body);
    componentSignature += `\nDigest:${digest}`;
  }

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(componentSignature)
    .digest();

  const signature = hmac.toString("base64");
  return `HMACSHA256=${signature}`;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function generateDigest(body: unknown): string {
  const jsonString = JSON.stringify(body);
  const hash = crypto.createHash("sha256").update(jsonString, "utf-8").digest();
  return hash.toString("base64");
}
