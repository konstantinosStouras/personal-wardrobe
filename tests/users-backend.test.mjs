import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function fixture(records){
 const calls=[];let authCalls=0;
 const auth={getUser:async()=>({customClaims:{daywearAdmin:true}}),listUsers:async(size,token)=>{authCalls++;assert.equal(size,100);assert.equal(token,'next');return {users:records,pageToken:'last'};}};
 const db={collection:name=>({doc:uid=>({name,uid})}),getAll:async(...args)=>{const mask=args.pop();calls.push({refs:args,mask});return args.map(ref=>({data:()=>ref.name==='daywearProfiles'?{name:ref.uid==='a'?'Saved name':undefined}:{enabled:ref.uid==='a'}}));}};
 class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
 const f={https:{HttpsError},region:()=>({runWith:()=>({https:{onCall:handler=>handler}})})};
 const exports={};vm.runInNewContext(readFileSync(new URL('../backend/functions/users.js',import.meta.url),'utf8'),{exports,require:name=>({'firebase-functions/v1':f,'firebase-admin/auth':{getAuth:()=>auth},'firebase-admin/firestore':{getFirestore:()=>db,FieldValue:{}}})[name]});
 return {exports,calls,authCalls:()=>authCalls};
}
const record=uid=>({uid,displayName:'Auth name',email:uid+'@example.com',metadata:{creationTime:'2026-10-01'},customClaims:{}});
const admin={auth:{uid:'owner',token:{daywearAdmin:true}}};
test('directory batches reads, returns saved names/preferences, and forwards pagination',async()=>{
 const f=fixture([record('a'),record('b')]),result=await f.exports.listUsers({pageToken:'next'},admin);
 assert.equal(f.calls.length,2);assert.equal(JSON.stringify(f.calls[0].mask),JSON.stringify({fieldMask:['name']}));assert.equal(JSON.stringify(f.calls[1].mask),JSON.stringify({fieldMask:['enabled']}));
 assert.equal(f.calls[0].refs.length,2);assert.equal(result.users[0].name,'Saved name');assert.equal(result.users[1].name,'Auth name');assert.equal(result.users[0].subscribed,true);assert.equal(result.users[1].subscribed,false);assert.equal(result.pageToken,'last');
});
test('empty directories avoid database reads and unauthorized requests never list users',async()=>{
 const f=fixture([]);assert.equal((await f.exports.listUsers({pageToken:'next'},admin)).users.length,0);assert.equal(f.calls.length,0);
 await assert.rejects(f.exports.listUsers({},{}),e=>e.code==='permission-denied');assert.equal(f.authCalls(),1);
 await assert.rejects(f.exports.listUsers({pageToken:123},admin),e=>e.code==='invalid-argument');assert.equal(f.authCalls(),1);
});
