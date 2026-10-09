import test from 'node:test';
import assert from 'node:assert/strict';
import {translateText,translateBrief,searchKey} from '../dist/i18n.js';
import {pieces,looks} from '../dist/data.js';
import {measurements,profileFields,readProfile} from '../dist/profile.js';
import {guideContent} from '../dist/measurement-guides.js';
import {authMessage} from '../dist/auth-policy.js';

test('Greek covers every catalog item and look while English is unchanged',()=>{
 for(const item of [...pieces,...looks]){
  assert.match(translateText(item.name,'el'),/[Α-ω]/,item.name);
  assert.equal(translateText(item.name,'en'),item.name);
 }
});
test('Interpolated names and cities survive language changes verbatim',()=>{
 assert.equal(translateText('Your account: Summer White','el'),'Ο λογαριασμός σου: Summer White');
 assert.equal(translateText('Today in London','el'),'Σήμερα στην πόλη: London');
 assert.equal(translateText('Appearance and fit notes: Keep black beard','el'),'Σημειώσεις εμφάνισης και εφαρμογής: Keep black beard');
 assert.match(translateText('✓ Profile saved at 14:11. Your sizes and measurements are saved in this browser for Summer White.','el'),/για Summer White\.$/);
});
test('Weather explanations, validation and all measurement labels have Greek copy',()=>{
 const text='Feels like 12.0°C, so fall is your temperature pool. Rain calls for a protective jacket and dark closed shoes. A mid-layer gets preference in cooler weather. A complete look from your existing thirty.';
 assert.doesNotMatch(translateText(text,'el'),/[A-Za-z]{3,}/);
 for(const [id,title] of measurements){assert.match(translateText(title,'el'),/[Α-ω]/);assert.match(translateText(guideContent(id).match(/class="guide-instruction">([^<]+)/)[1],'el'),/[Α-ω]/);}
 assert.match(translateText(authMessage({code:'auth/invalid-credential'}),'el'),/κωδικός/);
});
test('Localization leaves form storage values and personal notes in the original schema',()=>{
 const fields=profileFields({top:'XL',bottom:'38',shoe:'EU 45'});
 assert.match(fields,/value="XL" selected/);
 assert.match(fields,/value="EU 45" selected/);
 const input=new FormData();input.set('name','Summer White');input.set('top','XL');input.set('bottom','38');input.set('shoe','EU 45');input.set('measure_chest','112');input.set('bodyNotes','Keep black beard');
 const result=readProfile(input);assert.equal(result.sizes.top,'XL');assert.equal(result.sizes.measurements.chest,112);assert.equal(result.sizes.bodyNotes,'Keep black beard');
});

test('Multiline personal notes and custom size values are never translated in the generated brief',()=>{
 const brief='Model reference brief for Summer White\nTop size: Summer\nAppearance and fit notes: Keep black beard\nSummer and Winter are my own words\nUse my supplied reference photos for facial likeness. Preserve my stated proportions. Do not invent missing measurements. This is a styling visualization, not a measured garment fitting.';
 const translated=translateBrief(brief,'el');
 assert.match(translated,/Μέγεθος μπλούζας: Summer/);
 assert.match(translated,/Keep black beard\nSummer and Winter are my own words/);
 assert.equal(translateBrief(brief,'en'),brief);
 assert.equal(searchKey('ΠΟΥΚΑΜΙΣΟ'),searchKey('πουκάμισο'));
});
