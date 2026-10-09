import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profileFields,readProfile,saveProfile,modelBrief} from '../dist/profile.js';
const form=values=>new Map(Object.entries(values));
test('sizes and optional measurements round trip without guessing units',()=>{
 const next=readProfile(form({name:'Kostas Stouras',top:'XL',bottom:'38',shoe:'EU 45',measure_height:'191',measure_weight:'120',measure_chest:'',bodyNotes:'Black beard, slimmer arms'}));
 assert.equal(next.sizes.bottom,'38');assert.equal(next.sizes.bottomSystem,'');
 assert.deepEqual(next.sizes.measurements,{height:191,weight:120});
 const state={name:'Before',sizes:{},checks:{a:true}};let stored;
 assert.equal(saveProfile(state,next,()=>{stored=JSON.stringify(state);return true;}),true);
 const restored=JSON.parse(stored);assert.deepEqual(restored.sizes,next.sizes);assert.equal(restored.checks.a,true);
 assert.match(modelBrief(restored.name,restored.sizes),/Height: 191 cm/);
 assert.doesNotMatch(modelBrief(restored.name,restored.sizes),/Chest:/);
});
test('blocked storage never reports a successful save or replaces current profile',()=>{
 for(const persist of [()=>false,()=>{throw Error('quota');}]){
  const state={name:'Before',sizes:{top:'L'}};
  assert.equal(saveProfile(state,{name:'After',sizes:{top:'XL'}},persist),false);
  assert.deepEqual(state,{name:'Before',sizes:{top:'L'}});
 }
});
test('legacy and custom sizes stay selectable and are safely escaped',()=>{
 const markup=profileFields({top:'2XL Tall',bottom:'W38 / L34',shoe:'EU 45 <wide>'});
 assert.match(markup,/value="2XL Tall" selected/);assert.match(markup,/value="W38 \/ L34" selected/);
 assert.match(markup,/EU 45 &lt;wide&gt;/);
 const next=readProfile(form({top:'__custom',topCustom:'  2XL Tall  '}));
 assert.equal(next.sizes.top,'2XL Tall');
});
test('optional measurements can be cleared and reject invalid values',()=>{
 assert.deepEqual(readProfile(form({measure_height:''})).sizes.measurements,{});
 for(const raw of ['-1','Infinity','oops','300'])assert.throws(()=>readProfile(form({measure_height:raw})),/height measurement/);
});
