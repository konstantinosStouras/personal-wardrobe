import test from 'node:test';
import assert from 'node:assert/strict';
import {looks,pieces} from '../dist/data.js';
import {recommend} from '../dist/weather.js';
import {cleanRatings,preferenceScore} from '../dist/preferences.js';
import {checkPurchase} from '../dist/purchase-check.js';
import {translateText} from '../dist/i18n.js';

const dry={temp:18,precip:0,dailyPrecip:0,wind:0};
test('explicit preferences change suitable recommendations and votes can be removed',()=>{
  const options={month:4,day:0};
  const baseline=recommend(dry,options).look;
  const liked=looks.find(l=>l.season==='spring'&&l.id!==baseline.id&&!l.rain);
  assert.equal(recommend(dry,{...options,ratings:{[liked.id]:1}}).look.id,liked.id);
  assert.notEqual(recommend(dry,{...options,ratings:{[baseline.id]:-1}}).look.id,baseline.id);
  assert.equal(recommend(dry,{...options,ratings:{}}).look.id,baseline.id);
  assert.deepEqual(cleanRatings({'spring-1':1,'summer-1':-1,'winter-1':'1',extra:1}),{'spring-1':1,'summer-1':-1});
  assert.deepEqual(cleanRatings(null),{});
});
test('shared pieces influence unrated looks without overpowering explicit votes',()=>{
  const ratings={'summer-2':1};
  assert.ok(preferenceScore(looks.find(l=>l.id==='spring-2'),ratings)>preferenceScore(looks.find(l=>l.id==='winter-1'),ratings));
  assert.ok(preferenceScore(looks.find(l=>l.id==='summer-2'),ratings)>1);
});
test('hostile votes cannot override rain, wind, warmth, hemisphere or fixed uniforms',()=>{
  for(const temp of [-5,8,12,18,25])for(const wet of [false,true])for(const wind of [0,30]) {
    const weather={temp,precip:wet?2:0,dailyPrecip:0,wind};
    const baseline=recommend(weather,{month:10,latitude:-33}).look;
    const ratings=Object.fromEntries(looks.map(l=>[l.id,l.id===baseline.id?-1:1]));
    const chosen=recommend(weather,{month:10,latitude:-33,ratings}).look;
    assert.equal(chosen.season,baseline.season);
    if(wet)assert.ok(chosen.rain);
    if(wind>=25)assert.ok(chosen.layer);
    if(temp>=8&&temp<15)assert.ok(chosen.midlayer);
    for(const mode of ['gym','lounge'])assert.equal(recommend(weather,{mode,ratings}).look.id,mode+'-1');
  }
});
test('purchase check does not invent ownership, looks or add a garment',()=>{
  const input={referenceId:'P01',colour:'white'},ownership={P18:'owned',P19:'owned',P01:'owned'};
  const before=JSON.stringify({pieces,looks,ownership});
  const result=checkPurchase(input,ownership);
  assert.ok(result.duplicates.some(p=>p.id==='P01'));
  const match=result.matches.find(m=>m.look.id==='summer-2');
  assert.ok(match.complete);assert.deepEqual(match.owned.map(p=>p.id),['P18','P19']);
  assert.ok(result.matches.every(m=>looks.some(l=>l.id===m.look.id)&&m.owned.every(p=>ownership[p.id]==='owned')));
  assert.equal(JSON.stringify({pieces,looks,ownership}),before);
  assert.equal(checkPurchase(input,{}).matches.length,0);
  assert.equal(checkPurchase(input,{P18:'buy',P19:'review'}).matches.length,0);
});
test('partial matches disclose missing companions and bold patterns need review',()=>{
  const r=checkPurchase({referenceId:'P01',colour:'bright / patterned'},{P18:'owned'});
  assert.equal(r.matches.length,1);assert.equal(r.matches[0].complete,false);
  assert.equal(r.matches[0].palette,'review');assert.deepEqual(r.matches[0].missing.map(p=>p.id),['P19']);
  assert.throws(()=>checkPurchase({referenceId:'P99',colour:'white'}));
  assert.throws(()=>checkPurchase({referenceId:'P01',colour:'unknown'}));
});
test('new feature copy and colours support Greek',()=>{
  for(const text of ['Before you buy','♡ Like','Not for me','Clothing photo','Your wardrobe check','All companion pieces owned','bright / patterned','Preference removed.']) {
    assert.match(translateText(text,'el'),/[Α-ω]/,text);assert.equal(translateText(text,'en'),text);
  }
});

