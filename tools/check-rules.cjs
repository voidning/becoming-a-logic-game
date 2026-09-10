const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=require('node:path').resolve(__dirname,'..','site')+require('node:path').sep;
const game=require(root+'puzzle.js');
const id=s=>JSON.stringify(s);
function nextStates(s,modes=['create','erase']){
  const output=[];
  const walked=game.step(s);if(walked!==s)output.push({state:walked,action:{kind:'walk'}});
  for(const mode of modes){
    for(const c of s.cells){const r=game.edit(s,c.x,c.y,mode);if(r.changed)output.push({state:r.state,action:{kind:mode,at:[c.x,c.y]}});}
  }
  return output;
}
function explore(level,modes){
  const first=game.create(level),queue=[first],states=new Map([[id(first),first]]),edges=new Map(),parents=new Map();let win=null;
  for(let i=0;i<queue.length;i++){
    const s=queue[i],sid=id(s);
    assert.equal(s.stock+s.cells.filter(c=>c.filled).length,s.total,'Conservation');
    assert(s.stock>=0&&s.stock<=s.total);
    assert(!s.cells.some(c=>c.y===4&&c.x===s.player&&!c.filled),'Player has support');
    if(s.won)win??=s;
    const children=nextStates(s,modes);edges.set(sid,children.map(r=>id(r.state)));
    for(const r of children)if(!states.has(id(r.state))){states.set(id(r.state),r.state);parents.set(id(r.state),{previous:sid,action:r.action});queue.push(r.state);}
  }
  const solvable=new Set([...states].filter(([,s])=>s.won).map(([k])=>k));
  const reverse=new Map();for(const [parent,children] of edges)for(const child of children){if(!reverse.has(child))reverse.set(child,[]);reverse.get(child).push(parent);}
  const back=[...solvable];for(let i=0;i<back.length;i++)for(const p of reverse.get(back[i])||[])if(!solvable.has(p)){solvable.add(p);back.push(p);}
  const actions=[];if(win){let cursor=id(win);while(parents.has(cursor)){const p=parents.get(cursor);actions.push(p.action);cursor=p.previous;}actions.reverse();}
  return {states,win,solvable,actions};
}
assert.equal(game.count,3);
for(const invalid of [-1,3,7,99])assert.throws(()=>game.create(invalid),RangeError);
const paths=[];
for(let level=0;level<game.count;level++){
  const result=explore(level);assert(result.win,`Level ${level+1} solvable`);
  assert.equal(result.solvable.size,result.states.size,`Level ${level+1} has no trapped legal states`);
  if(level===0)assert(result.win.canErase);
  if(level===2)assert(result.win.canShift);
  paths.push(result.actions);
  console.log(`Level ${level+1}: PASS ${result.states.size} states, shortest route ${result.actions.length} actions, no dead ends`);
}
assert.equal(explore(1,['create']).win,null,'Level 2 requires erasing');
assert.equal(explore(1,['erase']).win,null,'Level 2 also requires creation');
assert.equal(explore(2,['create']).win,null,'Level 3 requires reuse');
assert.equal(game.edit(game.create(2),2,4,'bad-mode').reason,'mode');
const html=fs.readFileSync(root+'index.html','utf8');
for(const [,asset] of html.matchAll(/<script src="([^"]+)"/g)){const p=root+asset.split('?')[0];assert(fs.existsSync(p));new vm.Script(fs.readFileSync(p,'utf8'),{filename:p});}
console.log('Rules/syntax/assets PASS. This check does not test browser rendering.');
