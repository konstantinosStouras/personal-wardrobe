import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {languages} from '../dist/language-policy.js';
import copy from '../dist/photo-guidance-languages.js';
import {checkPhotoGuidance} from '../dist/photo-guidance-coverage.js';
import {translateText} from '../dist/i18n.js';
const source=readFileSync(new URL('../dist/profile-photos.js',import.meta.url),'utf8');

test('photo tips, consent and upload labels translate fully in every registered language',()=>{
 const keys=checkPhotoGuidance(languages,copy,source);
 for(const code of Object.keys(languages))for(const key of keys){
  assert.equal(translateText(key,code),copy[code][key],`${code}: ${key}`);
  assert.equal(translateText(` ${key}\n`,code),` ${copy[code][key]}\n`);
 }
});
test('new languages and new guidance cannot silently miss translation coverage',()=>{
 assert.throws(()=>checkPhotoGuidance({...languages,it:{}},copy,source),/it: Your face/);
 assert.throws(()=>checkPhotoGuidance(languages,copy,source.replace("t('Headshots')","t('New photo guidance')")),/New photo guidance/);
 const missing=structuredClone(copy);delete missing.ar.Headshots;
 assert.throws(()=>checkPhotoGuidance(languages,missing,source),/ar: Headshots/);
});
