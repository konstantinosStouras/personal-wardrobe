import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateCatalog} from '../dist/private-models.js';
const image=Buffer.from('RIFF0000WEBPfakeimage').toString('base64');
test('authenticated request stays in memory; sign-out revokes every image',async()=>{
 const revoked=[];let n=0;
 const catalog=createPrivateCatalog({fetcher:async(url,options)=>{
  assert.equal(options.headers.Authorization,'Bearer token');assert.equal(options.cache,'no-store');assert.equal(options.credentials,'omit');assert.ok(!url.includes('token'));
  return Response.json({images:{a:image,b:image}});
 },createURL:()=>`blob:${++n}`,revokeURL:url=>revoked.push(url)});
 assert.equal(await catalog.load('owner',async()=>'token',['a','b']),true);
 assert.equal(catalog.get('a','owner'),'blob:1');assert.equal(catalog.get('a','other'),undefined);
 catalog.clear();assert.equal(catalog.get('a','owner'),undefined);assert.deepEqual(revoked,['blob:1','blob:2']);
});
test('a request finishing after sign-out cannot restore personal images',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r);
 const catalog=createPrivateCatalog({fetcher:()=>pending,createURL:()=>{throw Error('must not create URL');}});
 const load=catalog.load('owner',async()=>'token',['a']);await Promise.resolve();catalog.clear();
 resolve(Response.json({images:{a:image}}));assert.equal(await load,false);assert.equal(catalog.get('a','owner'),undefined);
});
test('failed authentication and incomplete catalogs never expose partial images',async()=>{
 const denied=createPrivateCatalog({fetcher:async()=>new Response('',{status:403})});
 await assert.rejects(denied.load('other',async()=>'token',['a']),/does not have/);
 const revoked=[];
 const partial=createPrivateCatalog({fetcher:async()=>Response.json({images:{a:image}}),createURL:()=>'blob:a',revokeURL:url=>revoked.push(url)});
 await assert.rejects(partial.load('owner',async()=>'token',['a','missing']),/Incomplete/);
 assert.deepEqual(revoked,['blob:a']);assert.equal(partial.get('a','owner'),undefined);
});
