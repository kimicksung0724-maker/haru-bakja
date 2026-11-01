import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import C from '../core.js';
const elements=new Map(),handlers={},timers=new Map();let id=0,frame;
const brush=new Proxy({},{get:()=>()=>{},set:()=>true});
function element(key){if(!elements.has(key))elements.set(key,{id:key,hidden:false,style:{},value:0,textContent:'',innerHTML:'',addEventListener(type,fn){this[type]=fn;},getContext:()=>brush});return elements.get(key);}
class Param{setValueAtTime(){} exponentialRampToValueAtTime(){} setTargetAtTime(){}}
let audio;
class Audio{constructor(){audio=this;this.currentTime=0;this.state='running';this.sampleRate=8000;this.destination={};}async resume(){this.state='running';}createGain(){return {gain:new Param(),connect(){}};}createOscillator(){return {frequency:new Param(),connect(){},start(){},stop(){}};}createBuffer(_,n){return {getChannelData:()=>new Float32Array(n)};}createBufferSource(){return {connect(){},start(){},stop(){}};}}
const context={console,Math,Set,Number,Array,document:{getElementById:element,querySelectorAll:()=>['home','play','calibration','transition','results'].map(element),addEventListener(t,f){handlers['doc'+t]=f;}},localStorage:{getItem:()=>null,setItem(){}},window:{AudioContext:Audio,addEventListener(t,f){handlers[t]=f;}},requestAnimationFrame:f=>{frame=f;},setInterval:f=>{timers.set(++id,{f,interval:true});return id;},clearInterval:i=>timers.delete(i),setTimeout:f=>{timers.set(++id,{f,interval:false});return id;},clearTimeout:i=>timers.delete(i),alert:()=>{}};
vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../core.js',import.meta.url),'utf8'),context);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),context);
function tick(time){audio.currentTime=time;for(const t of [...timers.values()])if(t.interval)t.f();frame();}
function key(code,down=true){handlers[down?'keydown':'keyup']({code,target:{tagName:'BODY'},preventDefault(){},repeat:false});}
await element('start').onclick();assert.equal(element('play').hidden,false);
// Practice misses never change condition. Exercise hold, simultaneous stamp and all renderers.
for(let kind=0;kind<4;kind++){
 const start=audio.currentTime,condition=Number(element('condition').textContent),chart=C.makeChart(kind,C.bpmFor([104,112,108,90][kind],condition),start+4.4);
 let actions=[];for(const e of chart.events){const code=kind===1&&e.type==='stamp'?'Enter':'Space';actions.push({t:e.time,fn:()=>key(code)});actions.push({t:e.end||e.time+.015,fn:()=>key(code,false)});}actions.sort((a,b)=>a.t-b.t);
 let a=0;for(let t=start;t<chart.end+.6;t+=.02){while(a<actions.length&&actions[a].t<=t){tick(actions[a].t);actions[a++].fn();}tick(t);if(t<start+4.1)assert.equal(Number(element('condition').textContent),condition);}
 if(kind<3){assert.equal(element('transition').hidden,false);for(const [i,t] of [...timers])if(!t.interval){timers.delete(i);t.f();}assert.equal(element('play').hidden,false);}
}
assert.equal(element('results').hidden,false);assert.match(element('bars').innerHTML,/100 \/ 100/);assert.equal((element('bars').innerHTML.match(/100 \/ 100/g)||[]).length,3);
await element('restart').onclick();tick(audio.currentTime+6);const before=Number(element('condition').textContent);element('pause').onclick();assert.equal(element('pause-overlay').hidden,false);assert.equal(Number(element('condition').textContent),80);await element('resume').onclick();assert.equal(element('pause-overlay').hidden,true);assert.ok(Number(element('condition').textContent)>=before);
console.log('✓ 가상 오디오 시계로 하루 전체·4개 렌더러·홀드 동시 도장·연습 제외·중단 복귀 통과');
element('quit').onclick();element('calibrate').onclick();await element('cal-tap').click();const calStart=audio.currentTime+.6;
for(let i=0;i<12;i++){tick(calStart+i*.6);if(i>=4){tick(calStart+i*.6+.1);await element('cal-tap').click();}}
tick(calStart+7.6);assert.match(element('cal-message').textContent,/보정 완료 · 100 ms/);
console.log('✓ 4박 듣기 + 8박 탭으로 100ms 입력 지연 자동 보정 통과');
