import assert from 'node:assert/strict';
import C from '../core.js';
let count=0;
function test(name,fn){fn();count++;console.log('✓ '+name);}
test('퍼펙트·굿 경계 및 양방향 판정',()=>{for(const sign of [-1,1]){assert.equal(C.judge(sign*.045),'perfect');assert.equal(C.judge(sign*.0451),'good');assert.equal(C.judge(sign*.09),'good');assert.equal(C.judge(sign*.0901),'miss');}});
test('낮은 컨디션은 BPM을 올리고 판정 창을 줄임',()=>{assert.equal(C.bpmFor(100,80),100);assert.ok(C.bpmFor(100,20)>100);assert.equal(C.judge(.044,20),'good');assert.equal(C.judge(.085,20),'miss');});
test('컨디션 증감과 0~100 제한',()=>{assert.ok(C.conditionAfter(80,'perfect')>80);assert.ok(C.conditionAfter(80,'miss')<80);assert.equal(C.conditionAfter(100,'perfect'),100);assert.equal(C.conditionAfter(0,'miss'),0);});
test('점수는 판정 비율로 정규화',()=>{assert.equal(C.score([]),0);assert.equal(C.score(['perfect','good','miss']),55);assert.equal(C.score(['perfect','perfect']),100);});
test('60초 박자에 누적 오차 없음 · 오디오 시작 시각 직접 사용',()=>{const start=1234.567,bpm=120,t=C.beatTimes(start,bpm,120);assert.equal(t[120],start+60);for(let i=0;i<t.length;i++)assert.equal(t[i],start+i*60/bpm);const t2=C.beatTimes(start,113,113);assert.equal(t2[113],start+60);});
test('모든 게임 40~60초 · 이벤트 범위 · 홀드·엇박·응답',()=>{for(let k=0;k<4;k++)for(const condition of [0,80,100]){const chart=C.makeChart(k,C.bpmFor([104,112,108,90][k],condition),32);assert.ok(chart.end-32>=40&&chart.end-32<=60);assert.ok(chart.events.length>10);for(const e of chart.events){assert.ok(e.time>=32&&e.time<chart.end);if(e.type==='hold')assert.ok(e.end>e.time&&e.end<chart.end);}}assert.ok(C.makeChart(0,104,0).events.some(e=>e.beat%1===.5));const lab=C.makeChart(2,108,0);assert.equal(lab.events[0].beat,6);assert.equal(lab.events[2].beat,8);});
test('리타르단도는 후반부 간격만 점진적으로 증가',()=>{const t=C.beatTimes(0,90,72,true);assert.ok(t[72]-t[71]>t[65]-t[64]);assert.equal(t[10],10*60/90);});
test('8박 보정 평균과 저장 범위',()=>{assert.ok(Math.abs(C.offsetFrom([.1,.08,.12,.1,.09,.11,.1,.1])-.1)<1e-9);assert.equal(C.offsetFrom([.6]),.25);});
console.log(`\n${count}개 테스트 통과`);
await import('./runtime.mjs');
