import { ConsistentHashRing } from "./ring.js";

const ring = new ConsistentHashRing(128);

ring.addServer("S1", 1);
ring.addServer("S2", 1);
ring.addServer("S3", 1);

const keys = ["user:1001", "exam:55021", "patient:42:7:889", "device:ZX-9A", "session:3c1a7e"];

function ownersSnapshot(tag: string) {
  console.log(`\n== ${tag} ==`);
  for (const k of keys) {
    console.log(k, "→", ring.getOwner(k));
  }
}

ownersSnapshot("Initial");

ring.addServer("S4", 1);
ownersSnapshot("After adding S4");

ring.removeServer("S2");
ownersSnapshot("After removing S2");

console.log("\nR=3 owners (primary + 2 replicas) after removal:");
for (const k of keys) {
  console.log(k, "→", ring.getOwners(k, 3));
}