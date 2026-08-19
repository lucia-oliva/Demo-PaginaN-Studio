const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function base64UrlEncodeBytes(bytes) {
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function base64UrlDecodeBytes(value) {
  const normalized = String(value)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padding = '='.repeat(
    (4 - (normalized.length % 4)) % 4,
  );

  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeJson(value) {
  return base64UrlEncodeBytes(
    encoder.encode(JSON.stringify(value)),
  );
}

export function decodeJson(value) {
  return JSON.parse(
    decoder.decode(base64UrlDecodeBytes(value)),
  );
}

export function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64UrlEncodeBytes(bytes);
}

export function constantTimeBytesEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

export async function secureEqualStrings(left, right) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest(
      'SHA-256',
      encoder.encode(String(left)),
    ),
    crypto.subtle.digest(
      'SHA-256',
      encoder.encode(String(right)),
    ),
  ]);

  return constantTimeBytesEqual(
    new Uint8Array(leftHash),
    new Uint8Array(rightHash),
  );
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign', 'verify'],
  );
}

export async function signValue(value, secret) {
  const key = await importHmacKey(secret);

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );

  return base64UrlEncodeBytes(
    new Uint8Array(signature),
  );
}

export async function verifySignature(
  value,
  signature,
  secret,
) {
  try {
    const key = await importHmacKey(secret);

    return crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecodeBytes(signature),
      encoder.encode(value),
    );
  } catch {
    return false;
  }
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(String(value)),
  );

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}