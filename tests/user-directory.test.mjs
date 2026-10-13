import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createUserDirectory} from '../dist/user-directory.js';
const page=(id,token=null)=>({users:[{uid:id}],pageToken:token});
test('prefetch and navigation share one request; repeat visits use memory until expiry',async()=>{
 let resolve,calls=0,time=0;
 const d=createUserDirectory(()=>{calls++;return new Promise(r=>resolve=r);},()=>({uid:'admin',admin:true}),()=>time);
 const prefetch=d.load(),navigation=d.load();await Promise.resolve();assert.equal(calls,1);
 resolve(page('one'));await Promise.all([prefetch,navigation]);assert.equal(d.snapshot().users[0].uid,'one');
 await d.load();assert.equal(calls,1);
 time=60001;const refresh=d.load();await Promise.resolve();assert.equal(calls,2);resolve(page('two'));await refresh;
 assert.equal(d.snapshot().users[0].uid,'two');
});
test('pagination deduplicates clicks and forced refresh removes deleted users',async()=>{
 let calls=0,finish;
 const d=createUserDirectory(token=>{calls++;return token?new Promise(r=>finish=r):page('one','next');},()=>({uid:'admin',admin:true}));
 await d.load();const a=d.load({more:true}),b=d.load({more:true});await Promise.resolve();assert.equal(calls,2);
 finish(page('two'));await Promise.all([a,b]);assert.deepEqual(d.snapshot().users.map(u=>u.uid),['one','two']);
 await d.load({more:true});assert.equal(calls,2);await d.load({force:true});assert.equal(calls,3);assert.deepEqual(d.snapshot().users.map(u=>u.uid),['one']);
});
test('sign-out, permission loss, and account changes discard cached and pending private data',async()=>{
 let account={uid:'admin',admin:true},finish;
 const d=createUserDirectory(()=>new Promise(r=>finish=r),()=>account);
 const first=d.load();await Promise.resolve();finish(page('secret'));await first;
 account={uid:null,admin:false};assert.equal(d.snapshot(),null);assert.equal(await d.load(),null);
 account={uid:'admin',admin:true};const pending=d.load();await Promise.resolve();
 account={uid:'other',admin:true};assert.equal(d.snapshot(),null);finish(page('old-secret'));assert.equal(await pending,null);assert.equal(d.snapshot(),null);
 account={uid:'other',admin:false};assert.equal(await d.load(),null);
});
test('a failed request can be retried without retaining its pending promise',async()=>{
 let calls=0;const d=createUserDirectory(()=>{if(++calls===1)throw Error('offline');return page('recovered');},()=>({uid:'admin',admin:true}));
 await assert.rejects(d.load(),/offline/);await d.load();assert.equal(calls,2);assert.equal(d.snapshot().users[0].uid,'recovered');
});
