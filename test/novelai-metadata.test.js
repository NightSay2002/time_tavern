import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { gzipSync } from "node:zlib";
import { gunzipSync } from "../src/public/vendor/fflate.module.js";

const source = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");
const helperStart = source.indexOf("const NOVELAI_STEALTH_SIGNATURES");
const helperEnd = source.indexOf("\nasync function stripPngStealthMetadata", helperStart);

assert.notEqual(helperStart, -1);
assert.notEqual(helperEnd, -1);

const context = vm.createContext({ Number, Set, String });
vm.runInContext(`${source.slice(helperStart, helperEnd)}
this.readSignature = readPngStealthSignature;
this.readData = readPngStealthData;
this.stripImageData = stripPngStealthImageData;`, context);

function makeImageData(fill = [100, 102, 104, 254]) {
  const width = 32;
  const height = 32;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    data.set(fill, offset);
  }
  return { width, height, data };
}

function writeSignature(imageData, channels, signature) {
  writeBytes(imageData, channels, Buffer.from(signature, "utf8"));
}

function writeBytes(imageData, channels, bytes) {
  const bits = [...bytes]
    .flatMap((byte) => Array.from({ length: 8 }, (_, bit) => (byte >> (7 - bit)) & 1));
  let bitIndex = 0;
  for (let x = 0; x < imageData.width && bitIndex < bits.length; x += 1) {
    for (let y = 0; y < imageData.height && bitIndex < bits.length; y += 1) {
      const pixelOffset = (y * imageData.width + x) * 4;
      for (const channel of channels) {
        imageData.data[pixelOffset + channel] = (imageData.data[pixelOffset + channel] & 0xfe) | bits[bitIndex];
        bitIndex += 1;
        if (bitIndex === bits.length) {
          break;
        }
      }
    }
  }
}

function writeStealthPayload(imageData, channels, signature, payload) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length * 8);
  writeBytes(imageData, channels, Buffer.concat([Buffer.from(signature), length, payload]));
}

test("pure PNG cleanup removes alpha-channel stealth metadata", () => {
  const imageData = makeImageData();
  writeSignature(imageData, [3], "stealth_pngcomp");
  assert.equal(context.readSignature(imageData, [3]), "stealth_pngcomp");

  const rgbBefore = imageData.data.filter((_, index) => index % 4 !== 3);
  assert.equal(context.stripImageData(imageData), true);
  assert.notEqual(context.readSignature(imageData, [3]), "stealth_pngcomp");
  assert.deepEqual(imageData.data.filter((_, index) => index % 4 !== 3), rgbBefore);
  assert.ok(imageData.data.filter((_, index) => index % 4 === 3).every((value) => value & 1));
});

test("pure PNG cleanup removes RGB-channel stealth metadata", () => {
  const imageData = makeImageData();
  writeSignature(imageData, [0, 1, 2], "stealth_rgbinfo");
  assert.equal(context.readSignature(imageData, [0, 1, 2]), "stealth_rgbinfo");

  const alphaBefore = imageData.data.filter((_, index) => index % 4 === 3);
  assert.equal(context.stripImageData(imageData), true);
  assert.notEqual(context.readSignature(imageData, [0, 1, 2]), "stealth_rgbinfo");
  assert.deepEqual(imageData.data.filter((_, index) => index % 4 === 3), alphaBefore);
  assert.ok(imageData.data.filter((_, index) => index % 4 !== 3).every((value) => value & 1));
});

test("stealth PNG reader restores an embedded metadata payload", () => {
  const imageData = makeImageData();
  const payload = Buffer.from(JSON.stringify({ Software: "NovelAI", Comment: "{\"seed\":123}" }));
  writeStealthPayload(imageData, [0, 1, 2], "stealth_rgbinfo", payload);

  const result = context.readData(imageData, [0, 1, 2]);
  assert.equal(result.signature, "stealth_rgbinfo");
  assert.deepEqual(Buffer.from(result.payload), payload);
});

test("stealth PNG reader restores a compressed NovelAI payload", () => {
  const imageData = makeImageData();
  const payload = Buffer.from(JSON.stringify({ Software: "NovelAI", Comment: "{\"seed\":114514}" }));
  const compressed = gzipSync(payload);
  writeStealthPayload(imageData, [3], "stealth_pngcomp", compressed);

  const result = context.readData(imageData, [3]);
  assert.equal(result.signature, "stealth_pngcomp");
  assert.deepEqual(Buffer.from(gunzipSync(result.payload)), payload);
});
