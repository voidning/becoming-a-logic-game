(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeingPuzzle = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const key = (x,y) => `${x},${y}`;
  const layouts = [
    { cells: [{x:2,y:4,filled:false}, {x:4,y:4,filled:false}], stock:2 },
    { cells: [{x:2,y:4,filled:false}, {x:4,y:4,filled:false}, {x:3,y:3,filled:true}, {x:3,y:2,filled:true}], stock:0 }
  ];
  function create(level=0) {
    if (level!==0 && level!==1) throw new RangeError('Unknown level');
    return {level,player:0,stock:layouts[level].stock,canErase:level===1,won:false,cells:layouts[level].cells.map(c=>({...c}))};
  }
  function copy(s) { return {...s,cells:s.cells.map(c=>({...c}))}; }
  function blocked(s) {
    if(s.won) return 'done';
    const next=s.player+1;
    if(s.cells.some(c=>c.x===next&&c.y===3&&c.filled)) return 'wall';
    if(s.cells.some(c=>c.x===next&&c.y===4&&!c.filled)) return 'gap';
    return null;
  }
  function edit(s,x,y,mode) {
    if(s.won) return {state:s,changed:false,reason:'done'};
    if(mode!=='create'&&mode!=='erase') return {state:s,changed:false,reason:'mode'};
    if(mode==='erase'&&!s.canErase) return {state:s,changed:false,reason:'locked'};
    const i=s.cells.findIndex(c=>c.x===x&&c.y===y);
    if(i<0) return {state:s,changed:false,reason:'fixed'};
    const cell=s.cells[i];
    if(mode==='create'&&cell.filled) return {state:s,changed:false,reason:'occupied'};
    if(mode==='erase'&&!cell.filled) return {state:s,changed:false,reason:'empty'};
    if(mode==='create'&&s.stock===0) return {state:s,changed:false,reason:'stock'};
    if(cell.y===4&&cell.x===s.player) return {state:s,changed:false,reason:'support'};
    if(cell.y===3&&cell.x===s.player) return {state:s,changed:false,reason:'player'};
    const next=copy(s);
    next.cells[i].filled=mode==='create';
    next.stock+=mode==='create'?-1:1;
    return {state:next,changed:true,reason:null};
  }
  function step(s) {
    if(blocked(s)!==null) return s;
    const next=copy(s);
    next.player++;
    if(next.player===6) {next.won=true;if(next.level===0)next.canErase=true;}
    return next;
  }
  return {create,edit,step,blocked,key};
});
