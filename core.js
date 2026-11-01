(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function windows(condition){return {perfect:.045*(condition<35?.86:1),good:.09*(condition<35?.86:1)};}
function judge(delta,condition=100){const w=windows(condition);return Math.abs(delta)<=w.perfect+1e-9?'perfect':Math.abs(delta)<=w.good+1e-9?'good':'miss';}
function conditionAfter(value,result){return clamp(value+({perfect:1.1,good:.15,miss:-3.1}[result]||0),0,100);}
function score(results){return results.length?Math.round(results.reduce((s,r)=>s+(r==='perfect'?100:r==='good'?65:0),0)/results.length):0;}
function bpmFor(base,condition){return base+(condition<60?(60-condition)*.12:0);}
function beatTimes(start,bpm,count,slow=false){const times=[];for(let i=0;i<=count;i++){// Compute each timestamp from its absolute beat index, never from a timer tick.
let t=i*60/bpm;if(slow){const k=Math.floor(count*.7),n=Math.max(0,i-k);t+=60/bpm*.018*n*(n-1)/2;}times.push(start+t);}return times;}
function makeChart(kind,bpm,start){const count=Math.floor(48*bpm/60),times=beatTimes(start,bpm,count,kind===3),events=[];const add=(beat,type='tap',endBeat)=>{if(beat<count-1)events.push({time:times[Math.floor(beat)]+(beat%1)*(times[Math.floor(beat)+1]-times[Math.floor(beat)]),type,end:endBeat==null?null:times[endBeat],done:false,beat});};
if(kind===0)for(let b=4;b<count-1;b+=4){add(b);if(b%12===0)add(b+.5);}
if(kind===1)for(let b=4;b<count-4;b+=8){add(b,'hold',b+3);add(b+2,'stamp');add(b+5,'stamp');}
if(kind===2)for(let b=3;b<count-6;b+=8)for(let j=0;j<3;j++)add(b+3+j);
if(kind===3)for(let b=3;b<count-1;b+=3)add(b);
return {times,events,end:times[count],count};}
function offsetFrom(samples){return clamp(samples.reduce((a,b)=>a+b,0)/samples.length,-.25,.25);}
const api={clamp,windows,judge,conditionAfter,score,bpmFor,beatTimes,makeChart,offsetFrom};if(typeof module!=='undefined')module.exports=api;root.RhythmCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
