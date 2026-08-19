import {
  base64UrlDecodeBytes,
  constantTimeBytesEqual,
} from './crypto.js';

const encoder = new TextEncoder();

export async function verifyPassword(
  receivedPassword,
  encodedHash,
) {
  try {
    const [
      algorithm,
      rawIterations,
      rawSalt,
      rawExpectedHash,
    ] = String(encodedHash).split('$');

    const iterations = Number(rawIterations);

    if (
      algorithm !== 'pbkdf2'
      || !Number.isInteger(iterations)
      || iterations < 100000
      || !rawSalt
      || !rawExpectedHash
    ) {
      return false;
    }

    const salt = base64UrlDecodeBytes(rawSalt);
    const expectedHash =
      base64UrlDecodeBytes(rawExpectedHash);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(String(receivedPassword)),
      'PBKDF2',
      false,
      ['deriveBits'],
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt,
        iterations,
      },
      passwordKey,
      expectedHash.length * 8,
    );

    return constantTimeBytesEqual(
      new Uint8Array(derivedBits),
      expectedHash,
    );
  } catch {
    return false;
  }
}