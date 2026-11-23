// Unguessable slugs, invitation codes and QR tokens. Easily confused
// characters (0/O, 1/l/I) are left out of the alphabet.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";

export function randomToken(length = 16): string {
  // 256 is a multiple of the alphabet length (32), so the modulo is unbiased.
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let token = "";
  for (const byte of bytes) token += ALPHABET[byte % ALPHABET.length];
  return token;
}
