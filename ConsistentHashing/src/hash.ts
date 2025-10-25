import { createHash } from 'crypto';

export function hash64(key: string): bigint {

    const h = createHash("sha256").update(key, "utf8").digest();

    let x = 0n;
    for (let i = 0; i < 8; i++){
        x = (x << 8n) | BigInt(h[i]);
    }

    return x;
}