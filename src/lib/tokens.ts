// Tahmin edilemez slug, davet kodu ve QR token'ları üretir (bkz. roadmap §6.1, §6.5).
// Karıştırılabilen karakterler (0/O, 1/l/I) alfabeden çıkarılmıştır.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";

export function randomToken(length = 16): string {
  // 256, alfabe uzunluğunun (32) katı olduğu için modulo yanlılığı oluşmaz.
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
