import test from 'node:test';
import assert from 'node:assert/strict';
import {installWeatherRefresh} from '../dist/weather-refresh.js';

function fixture() {
 let time=0, next=0, count=0, busy=false;
 const tasks=new Map(),doc=new EventTarget(),win=new EventTarget();
 doc.visibilityState='visible';win.navigator={onLine:true};
 const control=installWeatherRefresh({doc,win,now:()=>time,
  schedule:(fn,delay)=>{tasks.set(++next,{fn,at:time+delay});return next;},cancel:id=>tasks.delete(id),
  canRefresh:()=>!busy,refresh:()=>count++});
 return {doc,win,control,get count(){return count;},set busy(value){busy=value;},advance(ms){
  const end=time+ms;
  while(true){const entry=[...tasks].sort((a,b)=>a[1].at-b[1].at)[0];if(!entry||entry[1].at>end)break;tasks.delete(entry[0]);time=entry[1].at;entry[1].fn();}time=end;
 }};
}
test('refresh starts every 60 seconds; manual/city refresh restarts the timer',()=>{
 const f=fixture();f.advance(59999);assert.equal(f.count,0);f.advance(1);assert.equal(f.count,1);
 f.advance(30000);f.control.markRequested();f.advance(59999);assert.equal(f.count,1);f.advance(1);assert.equal(f.count,2);
 f.control.stop();f.advance(120000);assert.equal(f.count,2);
});
test('hidden tabs resume an overdue refresh without duplicate requests',()=>{
 const f=fixture();f.doc.visibilityState='hidden';f.advance(180000);assert.equal(f.count,0);
 f.doc.visibilityState='visible';f.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(f.count,1);
 f.win.dispatchEvent(new Event('pageshow'));f.win.dispatchEvent(new Event('online'));assert.equal(f.count,1);
 f.advance(60000);assert.equal(f.count,2);
});
test('offline and in-flight requests are skipped; reconnect retries when overdue',()=>{
 const f=fixture();f.win.navigator.onLine=false;f.advance(60000);assert.equal(f.count,0);
 f.win.navigator.onLine=true;f.busy=true;f.win.dispatchEvent(new Event('online'));assert.equal(f.count,0);
 f.busy=false;f.win.dispatchEvent(new Event('online'));assert.equal(f.count,1);
 f.advance(60000);assert.equal(f.count,2);
});
