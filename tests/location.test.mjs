import test from 'node:test';
import assert from 'node:assert/strict';
import {detectLocation,locationPreference,rememberCity,locationError} from '../dist/location.js';
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
test('denied location does not contact another service or silently infer location from IP',async()=>{
 let calls=0;const denied={code:1};await assert.rejects(detectLocation({geolocation:{getCurrentPosition(ok,fail){fail(denied);}},fetcher:()=>{calls++;}}),e=>e===denied);assert.equal(calls,0);assert.match(locationError(denied),/choose a city/);
});
test('city-name service failure still allows weather at the device coordinates',async()=>{
 const place=await detectLocation({geolocation:{getCurrentPosition(ok){ok({coords:{latitude:40.42,longitude:-3.7}});}},fetcher:async()=>{throw Error('offline');}});assert.equal(place.name,'your current location');assert.equal(place.latitude,40.42);
});
test('unsupported devices and invalid fixes have no invented default city',async()=>{
 await assert.rejects(detectLocation({geolocation:null}),/cannot provide/);
 await assert.rejects(detectLocation({geolocation:{getCurrentPosition(ok){ok({coords:{latitude:100,longitude:0}});}}}),/invalid/);
});
test('travel history is distinct, most recent first, and bounded',()=>{
 const cities=Array.from({length:8},(_,i)=>({name:`City ${i}`,latitude:i,longitude:i}));const reused=rememberCity(cities,cities[4]);assert.equal(reused.length,8);assert.equal(reused[0].name,'City 4');assert.equal(reused.filter(c=>c.latitude===4).length,1);
 assert.equal(rememberCity(cities,{name:'New',latitude:20,longitude:20}).length,8);
});
