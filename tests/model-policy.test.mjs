import {test} from 'node:test';
import assert from 'node:assert/strict';
import {modelImageSource,modelCaption,modelFitNotes} from '../dist/model-policy.js';
import {looks} from '../dist/data.js';
test('all accounts use guest photography until a particular look is explicitly approved',()=>{assert.equal(looks.length,30);for(const uid of [null,'owner','someone-else','wqXod8mXlsZr0qCtKSN7A5Fwnl03'])for(const look of looks)assert.equal(modelImageSource(look,uid),`assets/${look.id}.webp?v=guest-v1`);const catalog={get:(id,uid)=>uid==='owner'&&id===looks[0].id?'blob:approved':undefined};assert.equal(modelImageSource(looks[0],'owner',catalog),'blob:approved');assert.match(modelImageSource(looks[0],'other',catalog),/^assets/);assert.match(modelImageSource(looks[1],'owner',catalog),/^assets/);assert.match(modelCaption('owner'),/approved/);});
test('appearance notes are retained verbatim without assumed personal measurements',()=>{assert.equal(modelFitNotes('owner',{bodyNotes:'Keep my face natural'}),'Keep my face natural');assert.doesNotMatch(modelFitNotes('owner'),/120|191|broad/);});
