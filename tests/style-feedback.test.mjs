import test from 'node:test';
import assert from 'node:assert/strict';
import {looks,pieces} from '../dist/data.js';
import {recommend} from '../dist/weather.js';
import {cleanRatings,cleanPieceFeedback,dislikeReasons,preferenceScore} from '../dist/preferences.js';
import {lookFeedbackControls} from '../dist/style-feedback.js';
import feedbackGreek from '../dist/style-feedback-el.js';
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
test('whole-look votes judge only the combination; explicit piece feedback informs other looks',()=>{
  const ratings={'summer-2':-1},get=id=>looks.find(l=>l.id===id);
  assert.equal(preferenceScore(get('spring-2'),ratings),0);
  assert.equal(preferenceScore(get('spring-2'),{'summer-2':1}),0);
  const feedback={'summer-2':{P01:{rating:1,reasons:[]}}};
  assert.ok(preferenceScore(get('spring-2'),ratings,feedback)>preferenceScore(get('winter-1'),ratings,feedback));
  assert.ok(preferenceScore(get('summer-2'),ratings,feedback)<0);
  feedback['summer-2'].P01={rating:-1,reasons:['combination','formal']};
  assert.equal(preferenceScore(get('spring-2'),ratings,feedback),0);
  feedback['summer-2'].P01.reasons.push('colour');
  assert.ok(preferenceScore(get('spring-2'),ratings,feedback)<0);
});
test('piece feedback validates look membership, votes and ten optional unique reasons',()=>{
  assert.equal(dislikeReasons.length,10);assert.equal(new Set(dislikeReasons.map(([id])=>id)).size,10);
  const raw={'summer-2':{P01:{rating:-1,reasons:['colour','colour','bad','combination']},P18:{rating:1,reasons:['cut']},P19:{rating:'-1'},P40:{rating:-1,reasons:[]}},bad:{P01:{rating:-1}}};
  const expected={'summer-2':{P01:{rating:-1,reasons:['colour','combination']},P18:{rating:1,reasons:[]}}};
  assert.deepEqual(cleanPieceFeedback(raw,{'summer-2':-1}),expected);
  assert.deepEqual(cleanPieceFeedback(JSON.parse(JSON.stringify(expected)),{'summer-2':-1}),expected);
  assert.deepEqual(cleanPieceFeedback(raw,{'summer-2':1}),{});
  assert.deepEqual(cleanPieceFeedback(null,{'summer-2':-1}),{});
  assert.deepEqual(cleanPieceFeedback(raw,{}),{});
});
test('follow-up renders every piece and gives only rejected items reason dropdowns',()=>{
  for(const look of looks){
    const pieceFeedback={[look.id]:{[look.pieces[0]]:{rating:-1,reasons:['colour','cut']}}};
    const html=lookFeedbackControls(look,{uid:'test',ratings:{[look.id]:-1},pieceFeedback});
    assert.equal((html.match(/<fieldset/g)||[]).length,look.pieces.length);
    assert.equal((html.match(/type="checkbox"/g)||[]).length,10);
    assert.equal((html.match(/ checked/g)||[]).length,2);
    assert.doesNotMatch(lookFeedbackControls(look,{uid:'test',ratings:{[look.id]:1},pieceFeedback}),/data-piece-rate/);
    assert.doesNotMatch(lookFeedbackControls(look,{uid:null,ratings:{[look.id]:-1},pieceFeedback}),/data-piece-rate/);
  }
  for(const [en,el] of Object.entries(feedbackGreek)){
    assert.equal(translateText(en,'el'),el);assert.equal(translateText(en,'en'),en);
  }
});
test('hostile votes cannot override rain, wind, warmth, hemisphere or fixed uniforms',()=>{
  for(const temp of [-5,8,12,18,25])for(const wet of [false,true])for(const wind of [0,30]) {
    const weather={temp,precip:wet?2:0,dailyPrecip:0,wind};
    const baseline=recommend(weather,{month:10,latitude:-33}).look;
    const ratings=Object.fromEntries(looks.map(l=>[l.id,l.id===baseline.id?-1:1]));
    const pieceFeedback=Object.fromEntries(looks.map(l=>[l.id,Object.fromEntries(l.pieces.map(id=>[id,{rating:-1,reasons:['colour']}]))]));
    const chosen=recommend(weather,{month:10,latitude:-33,ratings,pieceFeedback}).look;
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

