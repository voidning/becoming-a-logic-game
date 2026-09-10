const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=require('node:path').resolve(__dirname,'..','site')+require('node:path').sep;
const game=require(root+'puzzle.js'),html=fs.readFileSync(root+'index.html','utf8'),code=fs.readFileSync(root+'app.js','utf8');
class Element{
  constructor(){this.attributes={};this.children=[];this.dataset={};this.events={};this.style={setProperty:(k,v)=>this.attributes[k]=v};this.classes=new Set();this.classList={add:(...xs)=>xs.forEach(x=>this.classes.add(x)),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x)),toggle:(x,v)=>v?this.classes.add(x):this.classes.delete(x)};this.disabled=false;this.selectors=new Map();}
  addEventListener(n,fn){(this.events[n]||=[]).push(fn);}
  setAttribute(k,v){this.attributes[k]=v;}
  replaceChildren(){this.children=[];}
  append(c){this.children.push(c);}
  querySelector(k){if(!this.selectors.has(k))this.selectors.set(k,new Element());return this.selectors.get(k);}
  send(n,detail={}){for(const fn of this.events[n]||[])fn({preventDefault(){},...detail});}
  click(){if(!this.disabled)this.send('click');}
}
function fixture(search='',store=new Map()){
  const ids=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
  const document=new Element();document.getElementById=id=>ids[id];document.createElement=()=>new Element();document.hidden=false;
  const window=new Element();let now=0,serial=0;const timers=new Map();
  const location={search,pathname:'/'};
  const context={document,window,BeingPuzzle:game,URLSearchParams,location,history:{replaceState(a,b,url){location.search=url.slice(url.indexOf('?'));}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,due:now+ms});return id;},clearTimeout(id){timers.delete(id);}};
  function wait(ms){const end=now+ms;for(let n=0;n<10000;n++){const entry=[...timers].filter(([,v])=>v.due<=end).sort((a,b)=>a[1].due-b[1].due)[0];if(!entry)break;timers.delete(entry[0]);now=entry[1].due;entry[1].fn();}now=end;}
  function tile(x,y){const found=ids.terrain.children.find(e=>e.attributes['--x']===x&&e.attributes['--y']===y);assert(found,`Missing tile ${x},${y}`);return found;}
  function put(x,y){ids.create.click();tile(x,y).click();}
  function remove(x,y){ids.erase.click();tile(x,y).click();}
  function level(n){assert.equal(ids.board.dataset.level,String(n));}
  vm.runInNewContext(code,context);
  return {ids,document,window,store,wait,tile,put,remove,level,context};
}
const f=fixture();const {ids,wait,put,remove,level}=f;
level(1);assert(ids.erase.disabled&&ids.shift.disabled);wait(900);
put(2,4);put(4,4);wait(7000);level(2);assert(!ids.erase.disabled&&ids.shift.disabled);
remove(3,3);remove(3,2);put(2,4);put(4,4);wait(7000);level(3);
put(2,4);wait(2000);remove(2,4);put(4,4);wait(7000);level(3);
assert.equal(ids.board.dataset.won,'true');assert(ids.again.classes.has('show'));
assert.equal(ids.chapter.children.length,3);assert.equal(ids['chapter-total'].textContent,'/ 03');
assert.equal(ids.reward.textContent,'变');assert.equal(ids['shift-name'].textContent,'变');
wait(30000);level(3);
console.log('Controller PASS: three levels, final reward, completion without advancing.');
const resumed=fixture('',f.store);resumed.level(3);assert(resumed.ids.shift.disabled);
resumed.ids.chapter.value='1';resumed.ids.chapter.send('change');resumed.level(2);
ids.again.click();level(1);
const continued=fixture('?level=3');continued.level(3);assert(!continued.ids.erase.disabled&&continued.ids.shift.disabled);
continued.wait(900);continued.put(2,4);continued.wait(2000);continued.remove(2,4);continued.put(4,4);continued.wait(1800);
continued.ids.restart.click();continued.wait(10000);continued.level(3);assert.equal(continued.ids.board.dataset.won,'false');
const cancel=fixture();cancel.wait(900);cancel.put(2,4);cancel.put(4,4);cancel.wait(3300);cancel.ids.restart.click();cancel.wait(10000);cancel.level(1);
const malformed=new Map([['being-puzzle-three-progress','broken json']]);fixture('?level=99',malformed).level(1);
for(const n of [0,4,8,99])fixture('?level='+n).level(1);
fixture('',new Map([['being-puzzle-three-progress',JSON.stringify({current:7,unlocked:7})]])).level(1);
console.log('Checkpoint/reset PASS: resume, replay, reset during transition, invalid level and saved data fallback.');
console.log('Mocked DOM/controller checks only, not browser E2E or visual acceptance.');
