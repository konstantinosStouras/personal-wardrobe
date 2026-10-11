import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchWeather,condition} from '../dist/weather.js';
import {headerWeather,weatherArt} from '../dist/weather-view.js';
test('air temperature and humidity come from the API; recommendations retain feels-like temperature',async()=>{
 const original=globalThis.fetch;
 let query;
 globalThis.fetch=async url=>{query=new URL(url);return {ok:true,json:async()=>({current:{temperature_2m:19,relative_humidity_2m:83,is_day:0,apparent_temperature:17,precipitation:0,weather_code:2,wind_speed_10m:2,time:'2026-10-11T22:00'},daily:{temperature_2m_max:[23],temperature_2m_min:[16],precipitation_sum:[0]},timezone:'Europe/Athens'})};};
 try{const w=await fetchWeather({latitude:37.98,longitude:23.73});assert.equal(w.airTemp,19);assert.equal(w.temp,17);assert.equal(w.humidity,83);assert.equal(w.isDay,false);for(const field of ['temperature_2m','relative_humidity_2m','is_day'])assert.ok(query.searchParams.get('current').split(',').includes(field));}finally{globalThis.fetch=original;}
});
test('missing readings and weather errors are not replaced with invented values',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,json:async()=>({current:{apparent_temperature:17,precipitation:0,weather_code:2,wind_speed_10m:2,time:'2026-10-11T22:00',relative_humidity_2m:120},daily:{temperature_2m_max:[23],temperature_2m_min:[16],precipitation_sum:[0]},timezone:'Europe/Athens'})});
 try{const w=await fetchWeather({latitude:37.98,longitude:23.73});assert.equal(w.airTemp,null);assert.equal(w.humidity,null);assert.equal(w.isDay,null);assert.match(headerWeather({weather:w,location:{name:'Athens'}}),/—%/);}finally{globalThis.fetch=original;}
 assert.match(headerWeather({weather:null,location:{name:'Athens'}}),/Weather unavailable/);
 assert.doesNotMatch(headerWeather({weather:null,location:{name:'Athens'}}),/\d+°C|\d+%/);
});
test('clear day/night, clouds, rain and unknown conditions remain distinct',()=>{
 assert.notEqual(weatherArt(0,true),weatherArt(0,false));assert.notEqual(weatherArt(2,true),weatherArt(65,true));
 assert.equal(condition(3),'Overcast');assert.equal(condition(null),'Conditions unavailable');assert.equal(condition(-1),'Conditions unavailable');assert.equal(condition(61),'Rain');
});
