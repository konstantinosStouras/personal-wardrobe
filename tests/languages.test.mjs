import test from 'node:test';
import assert from 'node:assert/strict';
import {languages,languageForLocation,readLanguagePreference} from '../dist/language-policy.js';
import {translateText,translateBrief,getLanguage,getLanguagePreference,setLanguagePreference,applyLocationLanguage} from '../dist/i18n.js';
import {translations} from '../dist/translation-engine.js';
import {pieces,looks} from '../dist/data.js';
import {detectLocation,detectApproximateLocation} from '../dist/location.js';

test('location chooses supported local languages and English for unsupported or unavailable countries',()=>{
 for(const [countryCode,expected] of Object.entries({GR:'el',CY:'el',ES:'es',MX:'es',AR:'es',FR:'fr',BR:'pt',PT:'pt',EG:'ar',SA:'ar',CN:'zh-Hans',TW:'zh-Hans',HK:'yue',MO:'yue',DE:'en',JP:'en',US:'en'}))assert.equal(languageForLocation({countryCode}),expected,countryCode);
 assert.equal(languageForLocation(null),'en');assert.equal(languageForLocation({country:'France'}),'en');
 assert.equal(languageForLocation({countryCode:'CA',principalSubdivisionCode:'CA-QC'}),'fr');
 assert.equal(languageForLocation({countryCode:'CA'},['fr-CA']),'fr');
 assert.equal(languageForLocation({countryCode:'CN',principalSubdivisionCode:'CN-GD'}),'yue');
 assert.equal(languageForLocation({countryCode:'FR'},['es-MX']),'fr');
});
test('manual language remains selected across location changes; automatic can be restored',()=>{
 setLanguagePreference('auto');applyLocationLanguage({countryCode:'ES'});assert.equal(getLanguage(),'es');
 setLanguagePreference('ar');applyLocationLanguage({countryCode:'FR'});assert.equal(getLanguage(),'ar');
 setLanguagePreference('invalid');assert.equal(getLanguage(),'ar');
 setLanguagePreference('auto');assert.equal(getLanguage(),'fr');applyLocationLanguage(null);assert.equal(getLanguage(),'en');
 assert.equal(getLanguagePreference(),'auto');
 for(const code of Object.keys(languages))assert.equal(readLanguagePreference({getItem:()=>code}),code);
 assert.equal(readLanguagePreference({getItem:()=>null}),'auto');assert.equal(readLanguagePreference({getItem:()=>{throw Error('blocked')}}),'auto');
});
test('each added language covers catalog names, critical UI and the same static message set',()=>{
 const expected=Object.keys(translations.es).sort();
 for(const [code,copy] of Object.entries(translations)){
  assert.deepEqual(Object.keys(copy).sort(),expected,code);
  for(const item of [...pieces,...looks])assert.notEqual(translateText(item.name,code),item.name,`${code}: ${item.name}`);
  for(const key of ['Less deciding.','Sign in','Your style. Every occasion.','Profile saved privately to your account.','Your profile could not be saved. Your entries are still here; please retry.'])assert.notEqual(translateText(key,code),key,code);
 }
 assert.notEqual(translateText('Less deciding.','yue'),translateText('Less deciding.','zh-Hans'));
});
test('personal names, cities, notes and custom sizes stay verbatim in every language',()=>{
 for(const code of Object.keys(languages)){
  for(const text of ['Your account: Summer White','Today in Summer White','Appearance and fit notes: Summer White'])assert(translateText(text,code).includes('Summer White'));
  const brief='Model reference brief for Summer White\nTop size: Summer\nAppearance and fit notes: Keep my words\nSummer and Winter are my own words\nUse my supplied reference photos for facial likeness. Preserve my stated proportions. Do not invent missing measurements. This is a styling visualization, not a measured garment fitting.';
  const result=translateBrief(brief,code);assert(result.includes('Summer White'));assert(result.includes('Summer and Winter are my own words'));assert(result.includes('Keep my words'));assert(result.includes('Summer\n'));
 }
});
test('device and approximate locations return country codes for language detection without extra precise data',async()=>{
 const payload={city:'Paris',countryName:'France',countryCode:'FR',principalSubdivisionCode:'FR-IDF',latitude:48.8566,longitude:2.3522};
 const fetcher=async()=>({ok:true,json:async()=>payload});
 const place=await detectLocation({geolocation:{getCurrentPosition:ok=>ok({coords:payload})},fetcher});assert.equal(place.countryCode,'FR');assert.equal(place.principalSubdivisionCode,'FR-IDF');assert.equal(place.latitude,48.86);
 const approx=await detectApproximateLocation(fetcher);assert.equal(approx.countryCode,'FR');assert.equal(approx.source,'approximate');
});
