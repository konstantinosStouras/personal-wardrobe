import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasPersonalModel,modelImageSource,modelCaption,modelFitNotes} from '../dist/model-policy.js';
import {looks} from '../dist/data.js';
const owner='wqXod8mXlsZr0qCtKSN7A5Fwnl03';
test('owner account gets personal imagery for every look; guests and other accounts never do',()=>{
 assert.equal(looks.length,30);
 for(const look of looks){
  assert.equal(modelImageSource(look,owner),undefined,'owner must wait for authenticated pixels');
  assert.equal(modelImageSource(look,owner,{get:(id,uid)=>uid===owner?'blob:'+id:undefined}),'blob:'+look.id);
  for(const uid of [null,undefined,'','someone-else','kstouras@gmail.com']){
   assert.equal(hasPersonalModel(uid),false);
   assert.equal(modelImageSource(look,uid),`assets/${look.id}.webp?v=guest-v1`);
  }
 }
 assert.match(modelCaption(owner),/Your photo-based/);
 assert.match(modelCaption(null),/slim male catalog model/);
});
test('model copy is appropriate to the active account and uses saved fit notes safely as text',()=>{
 assert.match(modelFitNotes(owner),/naturally slimmer arms/);
 assert.doesNotMatch(modelFitNotes(null),/120|191|broad/);
 assert.equal(modelFitNotes('other',{bodyNotes:'Prefer a relaxed fit'}),'Prefer a relaxed fit');
});
