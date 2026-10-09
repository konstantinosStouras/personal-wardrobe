import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {looks,pieces,seasons,pieceById} from '../dist/data.js';
import {seasonPool,recommend,fetchWeather} from '../dist/weather.js';
test('every look has a real self-contained WebP asset',()=>{
 for(const look of looks){const file=new URL(`../dist/${look.image}`,import.meta.url);const bytes=readFileSync(file);assert.ok(bytes.length>10000,`${look.id} is unexpectedly small`);assert.equal(bytes.toString('ascii',8,12),'WEBP',`${look.id} is not a WebP`);}
});
test('closed capsule contains exactly 30 complete looks and 40 reused pieces',()=>{
 assert.equal(looks.length,30);assert.equal(pieces.length,40);assert.equal(new Set(looks.map(l=>l.id)).size,30);
 for(const s of seasons)assert.equal(looks.filter(l=>l.season===s).length,7);
 for(const s of ['gym','lounge'])assert.equal(looks.filter(l=>l.season===s).length,1);
 assert.equal(new Set(looks.flatMap(l=>l.pieces)).size,40);
 for(const l of looks){assert.ok(l.pieces.length>=3&&l.pieces.length<=5);assert.ok(l.pieces.every(id=>pieceById[id]));for(const type of ['Tops','Bottoms','Shoes'])assert.ok(l.pieces.some(id=>pieceById[id].category===type),`${l.id} missing ${type}`);}
});
test('weather boundaries and seasonal shoulder months',()=>{
 for(const [temp,month,expected] of [[25,1,'summer'],[20,10,'summer'],[19.9,4,'spring'],[15,10,'fall'],[14.9,4,'fall'],[8,1,'fall'],[7.9,7,'winter'],[-3,1,'winter'],[18,2,'spring'],[18,3,'spring'],[18,7,'spring'],[18,8,'fall']])assert.equal(seasonPool(temp,month),expected);
 assert.equal(seasonPool(18,10,-33),'spring');assert.throws(()=>seasonPool(NaN,1));
});
test('rain always selects an existing protected look in every temperature pool',()=>{
 for(const temp of [-5,7,8,14,15,19,20,30])for(const month of [1,4,7,10])for(const rain of [{precip:.1,dailyPrecip:0},{precip:0,dailyPrecip:1}]){
 const {look}=recommend({temp,wind:2,...rain},{month});assert.ok(looks.includes(look));assert.ok(look.rain);assert.ok(look.layer);assert.ok(!look.pieces.includes('P19'));assert.ok(look.pieces.some(id=>['P20','P23'].includes(id)));
 }
});
test('wind prioritises layers and cool weather prioritises midlayers',()=>{
 for(const temp of [9,16,22]){const r=recommend({temp,wind:30,precip:0,dailyPrecip:0},{month:4});assert.ok(r.look.layer);}
 assert.ok(recommend({temp:12,wind:0,precip:0,dailyPrecip:0},{month:6}).look.midlayer);
});
test('gym and lounge stay in fixed uniforms and only add a layer at 10 or below',()=>{
 for(const mode of ['gym','lounge'])for(const temp of [7,10,10.1,25]){const r=recommend({temp,wind:30,precip:1,dailyPrecip:5},{mode});assert.equal(r.look.id,`${mode}-1`);assert.equal(Boolean(r.layer),temp<=10);}
});
test('rotation override remains in its seven-look pool',()=>{
 for(const season of seasons){const r=recommend({temp:21,wind:30,precip:1,dailyPrecip:3},{season});assert.equal(r.look.season,season);assert.ok(r.look.rain);}
});
test('live weather request includes actual coordinates, timezone and required variables',async()=>{
 const original=globalThis.fetch;let requested;
 globalThis.fetch=async url=>{requested=new URL(url);return {ok:true,json:async()=>({current:{apparent_temperature:12.1,precipitation:0,wind_speed_10m:8,weather_code:3,time:'2026-10-09T10:00'},daily:{precipitation_sum:[1.4],temperature_2m_max:[15],temperature_2m_min:[8]},timezone:'Europe/London'})};};
 try{const w=await fetchWeather({latitude:51.5,longitude:-.12,timezone:'Europe/London'});assert.equal(w.temp,12.1);assert.equal(w.dailyPrecip,1.4);assert.equal(requested.searchParams.get('latitude'),'51.5');assert.equal(requested.searchParams.get('timezone'),'Europe/London');assert.ok(requested.searchParams.get('current').includes('apparent_temperature'));}finally{globalThis.fetch=original;}
});
test('weather failures remain failures, never fabricated readings',async()=>{
 const original=globalThis.fetch;try{globalThis.fetch=async()=>({ok:false});await assert.rejects(fetchWeather({latitude:0,longitude:0}));globalThis.fetch=async()=>({ok:true,json:async()=>({})});await assert.rejects(fetchWeather({latitude:0,longitude:0}));}finally{globalThis.fetch=original;}
});

