import test from 'node:test';
import assert from 'node:assert/strict';
import {detectLocation,detectApproximateLocation,locationPreference,rememberCity,locationError} from '../dist/location.js';
test('current location is default, including migration from an old manually selected city',()=>{
 assert.equal(locationPreference(), 'current');assert.equal(locationPreference({location:{name:'London'}}),'current');
 assert.equal(locationPreference({locationMode:'travel',location:{name:'Paris'}}),'travel');assert.equal(locationPreference({locationMode:'travel'}),'current');
});
test('device location yields city-level coordinates and an actual city name',async()=>{
 let options,url;
 const geolocation={getCurrentPosition(resolve,reject,opts){options=opts;resolve({coords:{latitude:51.507321,longitude:-.127648}});}};
 const city=await detectLocation({geolocation,fetcher:async u=>{url=new URL(u);return {ok:true,json:async()=>({city:'London',countryName:'United Kingdom'})};}});
 assert.equal(city.name,'London');assert.equal(city.latitude,51.51);assert.equal(city.longitude,-.13);assert.equal(city.timezone,'auto');assert.equal(url.searchParams.get('latitude'),'51.51');assert.equal(options.enableHighAccuracy,false);assert.equal(options.timeout,12000);
});
test('denied, unavailable and timed-out devices return explicitly approximate city without device coordinates',async()=>{
 for(const code of [1,2,3]){
  let url;const city=await detectLocation({geolocation:{getCurrentPosition(ok,fail){fail({code});}},fetcher:async u=>{url=new URL(u);return {ok:true,json:async()=>({city:'London',countryName:'United Kingdom',latitude:51.5074,longitude:-.1278})};}});
  assert.equal(city.source,'approximate');assert.equal(city.name,'London');assert.equal(city.latitude,51.51);assert.equal(url.searchParams.has('latitude'),false);assert.equal(url.searchParams.has('longitude'),false);
 }
 assert.match(locationError({code:1}),/choose a city/);
});
test('city-name service failure still allows weather at the device coordinates',async()=>{
 const place=await detectLocation({geolocation:{getCurrentPosition(ok){ok({coords:{latitude:40.42,longitude:-3.7}});}},fetcher:async()=>{throw Error('offline');}});assert.equal(place.name,'your current location');assert.equal(place.latitude,40.42);
});
test('unsupported devices and invalid fixes have no invented default city',async()=>{
 await assert.rejects(detectLocation({geolocation:null,fetcher:async()=>{throw Error('offline');}}),/choose a city/);
 await assert.rejects(detectLocation({geolocation:{getCurrentPosition(ok){ok({coords:{latitude:100,longitude:0}});}}}),/invalid/);
});
test('approximate lookup rejects service failures and incomplete coordinates instead of inventing a location',async()=>{
 await assert.rejects(detectApproximateLocation(async()=>({ok:false})),/unavailable/);
 for(const data of [{city:'Paris'},{city:'Paris',latitude:91,longitude:2},{latitude:48,longitude:2},{city:'Paris',latitude:null,longitude:2}])await assert.rejects(detectApproximateLocation(async()=>({ok:true,json:async()=>data})),/no usable city/);
});
test('unsupported browser uses the approximate fallback',async()=>{
 const place=await detectLocation({geolocation:null,fetcher:async()=>({ok:true,json:async()=>({locality:'Paris',latitude:48.86,longitude:2.35})})});assert.equal(place.name,'Paris');assert.equal(place.source,'approximate');
});
test('travel history is distinct, most recent first, and bounded',()=>{
 const cities=Array.from({length:8},(_,i)=>({name:`City ${i}`,latitude:i,longitude:i}));const reused=rememberCity(cities,cities[4]);assert.equal(reused.length,8);assert.equal(reused[0].name,'City 4');assert.equal(reused.filter(c=>c.latitude===4).length,1);
 assert.equal(rememberCity(cities,{name:'New',latitude:20,longitude:20}).length,8);
});
