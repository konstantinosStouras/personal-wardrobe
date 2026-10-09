import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {looks} from '../dist/data.js';
test('public distribution has 30 distinct guest images and no personal directory',()=>{
 assert.equal(fs.existsSync(new URL('../dist/assets/personal',import.meta.url)),false);
 assert.equal(fs.readdirSync(new URL('../dist/assets/',import.meta.url)).length,30);
 const hashes=new Set();
 for(const prefix of [''])for(const look of looks){
  const bytes=fs.readFileSync(new URL(`../dist/assets/${prefix}${look.id}.webp`,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(bytes.length>5000);
  const hash=createHash('sha256').update(bytes).digest('hex');assert.ok(!hashes.has(hash),'Repeated image '+prefix+look.id);hashes.add(hash);
 }
 assert.equal(hashes.size,30);
});
