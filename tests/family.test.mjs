import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activeMemberId,setMember,profilePath,memberStorageKey,contextVersion,clearFamilyStorage} from '../dist/family-context.js';
import {readProfile,profileFields,modelBrief} from '../dist/profile.js';
import {translateText} from '../dist/i18n.js';
const child='12345678-1234-1234-1234-123456789abc',sibling='abcdef12-1234-1234-1234-123456789abc';
test('family storage separates accounts, siblings and the legacy owner profile',()=>{
 assert.equal(memberStorageKey('owner','self'),'wardrobe.account.owner');
 const keys=[memberStorageKey('owner',child),memberStorageKey('owner',sibling),memberStorageKey('other',child),memberStorageKey('owner','self')];assert.equal(new Set(keys).size,4);
 assert.deepEqual(profilePath('owner',child),['daywearProfiles','owner','members',child]);assert.deepEqual(profilePath('owner','self'),['daywearProfiles','owner']);
 assert.throws(()=>profilePath(null,child));assert.throws(()=>profilePath('owner','../other/photos'));assert.throws(()=>setMember('bad/id'));
});
test('every person switch invalidates pending profile and photo reads, including returning to self',()=>{
 setMember('self');const before=contextVersion();setMember(child);const during=contextVersion();setMember('self');assert(during>before);assert(contextVersion()>during);assert.equal(activeMemberId(),'self');
});
test('account deletion clears only that account’s family namespaces',()=>{
 const entries=new Map([[memberStorageKey('owner',child),'x'],[memberStorageKey('owner',sibling),'x'],[memberStorageKey('other',child),'keep'],['wardrobe.account.owner','self'],['daywear.language','el']]);
 clearFamilyStorage('owner',{get length(){return entries.size;},key:i=>[...entries.keys()][i],removeItem:k=>entries.delete(k)});assert.equal(entries.size,3);assert.equal(entries.get(memberStorageKey('other',child)),'keep');
});
test('optional child sizes preserve units and allow small measurements without altering adult validation',()=>{
 const form=new Map(Object.entries({name:'Alexandra',top:'6 years',bottom:'116 cm',bottomSystem:'Height (cm)',shoe:'EU 28',measure_height:'118',measure_weight:'18',bodyNotes:'Keep original notes'}));
 const next=readProfile(form,{child:true});assert.equal(next.sizes.measurements.weight,18);assert.equal(next.sizes.bottomSystem,'Height (cm)');assert.throws(()=>readProfile(form),/weight/);
 assert.match(profileFields(next.sizes,{child:true}),/value="EU 28" selected/);assert.match(profileFields(next.sizes,{child:true}),/value="6 years" selected/);assert.doesNotMatch(modelBrief(next.name,next.sizes,{family:true}),/Edit my actual|slimmer face/);
 assert.deepEqual(readProfile(new Map([['name','Baby']]),{child:true}).sizes.measurements,{});
});
test('family interface has Greek copy without translating personal names or notes',()=>{
 for(const text of ['Family profiles','Create family profile','Their photos. Their own space.','Spouse / partner','A place for every person.','Profile summary'])assert.notEqual(translateText(text,'el'),text);
 assert.equal(translateText('Alexandra QA','el'),'Alexandra QA');
});
