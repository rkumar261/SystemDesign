import { ConsistentHashRing } from "./ring.js";

const ring = new ConsistentHashRing(128);

ring.addServer("S1", 1);
ring.addServer("S2", 1);
ring.addServer("S3", 1);

console.log("Ring preview:", ring.debugHead(300));