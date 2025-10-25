import { hash64 } from './hash.js';

type ServerId = string;

interface VNode {
    pos: bigint;
    serverId: ServerId;
    label: string;
}

function lowerBound(ring: VNode[], x: bigint): number {

    let lo = 0, hi = ring.length;

    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        ring[mid].pos >= x ? (hi = mid) : (lo = mid + 1)

    }

    return lo;
}

export class ConsistentHashRing {

    private ring: VNode[] = [];

    constructor(private baseVnodes = 256) { }

    addServer(serverId: ServerId, weight = 1): void {

        if (weight <= 0) throw new Error("Weight must be > 0");
        this.ring = this.ring.filter(v => v.serverId !== serverId);

        const count = Math.max(1, Math.round(this.baseVnodes * weight));
        const vnodes: VNode[] = [];

        for (let i = 0; i < count; i++) {
            const label = `${serverId}#${i}`;
            vnodes.push({ pos: hash64(label), serverId, label });
        }

        this.ring = this.ring.concat(vnodes)
            .sort((a, b) => (a.pos == b.pos ? (a.label < b.label ? -1 : 1) : (a.pos < b.pos ? -1 : 1)));
    }

    debugHead(n = 8) {
        return this.ring.slice(0, n).map(v => ({

            posHex: "0x" + v.pos.toString(16),
            server: v.serverId,
            label: v.label
        }));
    }

    getOwner(key: string): string {
        if (this.ring.length === 0) throw new Error("ring is empty");
      const kh = hash64(key);

        const i = ((): number => {
           return lowerBound(this.ring, kh);
        })();

        const idx = (i < this.ring.length) ? i : 0;
        return this.ring[idx].serverId;
    }
  

    getOwners(key: string, R: number): string[] {
        if (this.ring.length === 0) throw new Error("ring is empty");

        const want = Math.max(1, Math.min(
            R, 
            new Set(this.ring.map(v => v.serverId)).size
        ));

        const kh = hash64(key);

        const start = ((): number => {
            let lo = lowerBound(this.ring, kh);
            return (lo < this.ring.length) ? lo : 0; 
        })();

        const owners: string[] = [];
        const seen = new Set<string>();

        for (let step = 0, i = start; owners.length < want && step < this.ring.length; step++, i++){
            const vnode = this.ring[i < this.ring.length ? i : 0];
            if (!seen.has(vnode.serverId)) {
                owners.push(vnode.serverId);
                seen.add(vnode.serverId);
            }
        }

        return owners;
    }

    removeServer(serverId: string): void {
        if (!this.ring.length) return;
        this.ring = this.ring.filter(v => v.serverId != serverId);
    }
}