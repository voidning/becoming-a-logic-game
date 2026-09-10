(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BeingPuzzle = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const key = (x,y) => `${x},${y}`;
  const cell=(x,y,filled=false,extra={})=>({x,y,filled,...extra});
  const gaps=xs=>xs.map(x=>cell(x,4));
  const layouts = [
    {name:'初见',cells:gaps([2,4]),stock:2,hint:'点按虚线空位',reward:'erase'},
    {name:'回收',cells:[...gaps([2,4]),cell(3,3,true),cell(3,2,true)],stock:0,hint:'试试刚得到的能力'},
    {name:'余量',cells:gaps([2,4]),stock:1,hint:'只有一份材料',reward:'shift'}
  ];
  const info=level=>({name:layouts[level].name,hint:layouts[level].hint,reward:layouts[level].reward||null});
  function create(level=0) {
    if (!Number.isInteger(level)||level<0||level>=layouts.length) throw new RangeError('Unknown level');
    const layout=layouts[level];
    return {level,player:0,stock:layout.stock,total:layout.stock+layout.cells.filter(c=>c.filled).length,canErase:level>=1,canShift:false,won:false,cells:layout.cells.map(c=>({...c}))};
  }
  function copy(s) { return {...s,cells:s.cells.map(c=>({...c}))}; }
  function occupied(s) {
    if(s.cells.some(c=>c.x===s.player&&c.y===3&&c.filled))return 'player';
    if(s.cells.some(c=>c.x===s.player&&c.y===4&&!c.filled))return 'support';
    return null;
  }
  function award(s) {
    if(s.player===6){s.won=true;if(s.level===0)s.canErase=true;if(s.level===2)s.canShift=true;}
    return s;
  }
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
    const reason=occupied(next);
    if(reason)return {state:s,changed:false,reason};
    return {state:next,changed:true,reason:null};
  }
  function step(s) {
    if(blocked(s)!==null) return s;
    const next=copy(s);
    next.player++;
    return award(next);
  }
  return {create,edit,step,blocked,key,info,count:layouts.length};
});
