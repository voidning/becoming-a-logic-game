(()=>{
  'use strict';
  const game=BeingPuzzle;
  const $=id=>document.getElementById(id);
  const storageKey='being-puzzle-three-progress';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  const safeLevel=value=>Number.isInteger(value)&&value>=0&&value<game.count?value:0;
  const query=new URLSearchParams(location.search).get('level');
  const initial=query!==null?safeLevel(Number(query)-1):safeLevel(saved.current);
  let unlocked=Math.max(initial,safeLevel(saved.unlocked));
  let state=game.create(initial),mode='create',selected=null,transition=false,moving=false;
  let timer=null,messageTimer=null,generation=0;
  const tiles=new Map();
  function later(fn,ms){const version=generation;return setTimeout(()=>{if(version===generation)fn();},ms);}
  function persist(current=state.level){
    try{localStorage.setItem(storageKey,JSON.stringify({current,unlocked}));}catch{}
  }
  function feedback(text,persistMessage=false){
    clearTimeout(messageTimer);$('feedback').textContent=text;
    if(!persistMessage)messageTimer=later(()=>{$('feedback').textContent='';},2600);
  }
  function stock(){
    $('supply').replaceChildren();
    const label=document.createElement('span');label.textContent='余量';label.className='stock-label';$('supply').append(label);
    for(let i=0;i<state.total;i++){
      const dot=document.createElement('span');dot.className='unit'+(i>=state.stock?' empty-unit':'');dot.setAttribute('aria-hidden','true');$('supply').append(dot);
    }
    $('supply').setAttribute('aria-label',`可用材料 ${state.stock} 份，共 ${state.total} 份`);
  }
  function tools(){
    const allowed={create:true,erase:state.canErase,shift:state.canShift};
    const labels={create:'有：放入一份材料',erase:'无：移除并收回一份材料',shift:'变：第三关完成时获得的名称'};
    for(const name of ['create','erase','shift']){
      $(name).disabled=!allowed[name]||transition||state.won;
      $(name).setAttribute('aria-pressed',String(mode===name));
      $(name).setAttribute('aria-label',allowed[name]?labels[name]:'尚未获得这种能力');
    }
    $('erase-name').textContent=state.canErase?'无':'?';
    $('shift-name').textContent=state.canShift?'变':'?';
  }
  function render(){
    $('board').dataset.level=String(state.level+1);$('board').dataset.won=String(state.won);
    for(const cell of state.cells){
      const button=tiles.get(game.key(cell.x,cell.y));
      const isSelected=selected&&selected.x===cell.x&&selected.y===cell.y;
      button.className=`tile ${cell.y===4?'bridge':'wall'} ${cell.filled?'filled':'empty'}${isSelected?' selected':''}`;
      button.disabled=transition||state.won;
      button.setAttribute('aria-pressed',String(!!isSelected));
      button.setAttribute('aria-label',`${cell.y===4?'通路':'材料'}，第${cell.x+1}列第${cell.y+1}行，${cell.filled?'已有材料':'空位'}`);
      button.querySelector('.mark').textContent=mode==='create'?'+':mode==='erase'?'−':isSelected?'·':'↔';
    }
    $('actor').style.left=`calc(var(--cell)*${state.player+.5})`;
    $('actor').classList.toggle('waiting',!state.won&&!!game.blocked(state));
    stock();tools();
  }
  function chapters(){
    $('chapter').replaceChildren();
    for(let i=0;i<game.count;i++){
      const option=document.createElement('option');option.value=String(i);option.textContent=`${String(i+1).padStart(2,'0')} · ${game.info(i).name}${i>unlocked?' · 未到达':''}`;option.disabled=i>unlocked;$('chapter').append(option);
    }
    $('chapter').value=String(state.level);
    $('chapter-total').textContent='/ '+String(game.count).padStart(2,'0');
  }
  function build(){
    tiles.clear();$('terrain').replaceChildren();
    for(let x=0;x<7;x++)if(!state.cells.some(c=>c.x===x&&c.y===4)){
      const floor=document.createElement('div');floor.className='floor';floor.style.setProperty('--x',x);floor.setAttribute('aria-hidden','true');$('terrain').append(floor);
    }
    for(const cell of state.cells){
      const button=document.createElement('button');button.type='button';button.style.setProperty('--x',cell.x);button.style.setProperty('--y',cell.y);
      button.innerHTML='<span class="piece" aria-hidden="true"></span><span class="mark" aria-hidden="true"></span>';
      button.addEventListener('click',()=>edit(cell.x,cell.y));tiles.set(game.key(cell.x,cell.y),button);$('terrain').append(button);
    }
    chapters();$('goal').classList.remove('complete');$('actor').classList.remove('arrived');$('reward').classList.remove('show');render();
  }
  const errors={stock:'没有可用材料了',occupied:'这个位置已经有材料',empty:'这里已经是空的',support:'它正站在这里',player:'它正经过这里'};
  function edit(x,y){
    if(transition||state.won)return;
    const result=game.edit(state,x,y,mode);
    if(!result.changed){if(errors[result.reason])feedback(errors[result.reason]);return;}
    state=result.state;feedback('');render();advance();
  }
  function settle(){
    moving=true;
    timer=later(()=>{moving=false;if(state.won)win();else advance();},620);
  }
  function advance(){
    if(moving||transition||state.won||document.hidden)return;
    const next=game.step(state);if(next===state)return;
    state=next;render();settle();
  }
  function win(){
    $('goal').classList.add('complete');$('actor').classList.add('arrived');
    const reward=game.info(state.level).reward;
    if(state.level<game.count-1){
      const nextLevel=state.level+1;
      unlocked=Math.max(unlocked,nextLevel);persist(nextLevel);transition=true;tools();
      if(reward){
        $(reward).classList.add('new');$('reward').textContent=reward==='erase'?'无':'变';$('reward').classList.add('show');feedback('获得新的能力',true);
      }else feedback('继续',true);
      $('reader').textContent=`第 ${state.level+1} 关完成。${reward?'获得新能力。':''}即将进入下一关。`;
      timer=later(()=>{
        $('board').classList.add('leaving');
        timer=later(()=>start(nextLevel,false),480);
      },reward?1900:1000);
    }else{
      persist();$('shift').classList.add('new');$('reward').textContent='变';$('reward').classList.add('show');feedback('三关完成。',true);
      $('reader').textContent='三关完成。获得“变”。';$('again').classList.add('show');
    }
  }
  function choose(next){
    if(transition||state.won||(next==='erase'&&!state.canErase)||next==='shift')return;
    mode=next;selected=null;render();
    feedback('');
  }
  function start(level=state.level,delay=true){
    generation++;clearTimeout(timer);clearTimeout(messageTimer);moving=false;transition=false;selected=null;
    state=game.create(level);mode=level===1?'erase':'create';
    unlocked=Math.max(unlocked,level);persist();
    $('again').classList.remove('show');$('erase').classList.remove('new');$('shift').classList.remove('new');
    build();$('board').classList.remove('leaving');feedback(game.info(level).hint,true);
    try{history.replaceState(null,'',`${location.pathname}?level=${level+1}`);}catch{}
    timer=later(advance,delay?700:500);
  }
  for(const name of ['create','erase','shift'])$(name).addEventListener('click',()=>choose(name));
  $('restart').addEventListener('click',()=>start());$('again').addEventListener('click',()=>start(0));
  $('chapter').addEventListener('change',()=>{const next=Number($('chapter').value);if(next<=unlocked)start(safeLevel(next));});
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();if(selected){selected=null;render();feedback('');}else start();}
    if(event.target?.tagName==='SELECT')return;
    if(event.key==='1')choose('create');if(event.key==='2')choose('erase');
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)advance();});
  start(initial);
})();
