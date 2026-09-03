export const KEY = 0;
export const FRAME = 1;
export const DONE = 2;
export const ERROR = 3;

export const KEY_BYTES = 32;

const IV_BYTES = 12;

type Bytes = Uint8Array<ArrayBuffer>;

export function secret() {
  return crypto.getRandomValues(new Uint8Array(KEY_BYTES));
}

export function key(raw: Bytes, usage: "encrypt" | "decrypt") {
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [usage]);
}

export async function seal(key: CryptoKey, data: Bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

  const sealed = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data),
  );

  const out = new Uint8Array(iv.length + sealed.length);

  out.set(iv);
  out.set(sealed, iv.length);

  return out;
}

export async function unseal(key: CryptoKey, packet: Bytes) {
  const iv = packet.subarray(0, IV_BYTES);
  const sealed = packet.subarray(IV_BYTES);

  return new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, sealed),
  );
}
