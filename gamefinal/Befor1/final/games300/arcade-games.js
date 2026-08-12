/* ============================================================
   ARCADE GAMES – 5 games
   🐦 Flappy Bird | 🔢 Number Rush | 🔵 Bubble Pop | 🏎️ Racing | 🌙 Gravity Jump
   ============================================================ */

// ── FLAPPY BIRD (Canvas) ────────────────────────────────────
const FLAP={running:false,frame:null,scores:{},idx:0,
  bird:{y:160,vy:0},pipes:[],score:0,best:0,
  W:360,H:300,G:0.35,JUMP:-6,PW:50,GAP:95,SPD:2.5,
  PLAYER_COLORS:['#ff4d6d','#4db8ff']};
function startFlappy(){
  FLAP.scores={}; State.players.forEach(p=>FLAP.scores[p.name]=0); FLAP.idx=0;
  shellSetup('🐦 FLAPPY BIRD',{useCanvas:true,cw:360,ch:300});
  buildScoreStrip('shell-scores',FLAP.scores);
  shellStatus().innerHTML=`<span id="flap-status">Tap canvas or button below to flap!</span>`;
  bindCanvasTap(shellCanvas(), () => {
    if (!FLAP.running) flapStart();
    else flapJump();
  });
  flapNewGame();
}
function flapNewGame(){
  FLAP.running=false; cancelAnimationFrame(FLAP.frame);
  FLAP.bird={y:150,vy:0}; FLAP.pipes=[]; FLAP.score=0;
  const p=State.players[FLAP.idx];
  shellFooter().innerHTML=`
    <button class="btn-primary" onclick="flapStart()">${p.emoji} ${p.name}: START / FLAP</button>
    <div id="flap-touch-ctr"></div>
  `;
  flapDraw();
}
function flapStart(){
  FLAP.running=true;
  renderVirtualDPad('flap-touch-ctr', null, () => flapJump(), 'FLAP 🐦');
  flapLoop();
}
function flapJump(){FLAP.bird.vy=FLAP.JUMP;playSound('click');}
function flapLoop(){
  if(!FLAP.running)return;
  // Physics
  FLAP.bird.vy+=FLAP.G; FLAP.bird.y+=FLAP.bird.vy;
  // Pipes
  if(!FLAP.pipes.length||FLAP.pipes[FLAP.pipes.length-1].x<FLAP.W-160){
    const top=40+Math.random()*(FLAP.H-FLAP.GAP-60);
    FLAP.pipes.push({x:FLAP.W+10,top,bot:top+FLAP.GAP,scored:false});
  }
  FLAP.pipes.forEach(p=>{p.x-=FLAP.SPD;if(!p.scored&&p.x<80){p.scored=true;FLAP.score++;}});
  FLAP.pipes=FLAP.pipes.filter(p=>p.x>-FLAP.PW);
  // Collision
  const bx=80,by=FLAP.bird.y,br=14;
  if(by-br<0||by+br>FLAP.H){flapDie();return;}
  for(const p of FLAP.pipes){if(bx+br>p.x&&bx-br<p.x+FLAP.PW&&(by-br<p.top||by+br>p.bot)){flapDie();return;}}
  flapDraw();
  FLAP.frame=requestAnimationFrame(flapLoop);
}
function flapDie(){
  FLAP.running=false; cancelAnimationFrame(FLAP.frame);
  const p=State.players[FLAP.idx];
  if(FLAP.score>FLAP.scores[p.name])FLAP.scores[p.name]=FLAP.score;
  updateScoreChip(p.name,FLAP.scores[p.name]); playSound('die');
  flapDraw();
  setTimeout(()=>{
    FLAP.idx=(FLAP.idx+1)%State.playerCount;
    if(FLAP.idx===0){const s=Object.entries(FLAP.scores).sort((a,b)=>b[1]-a[1]);showResult(FLAP.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);return;}
    flapNewGame();
  },1500);
}
function flapDraw(){
  const cv=shellCanvas(),ctx=shellCtx();if(!cv||!ctx)return;
  ctx.fillStyle='#1a2a4a';ctx.fillRect(0,0,FLAP.W,FLAP.H);
  // Ground
  ctx.fillStyle='#2a4a2a';ctx.fillRect(0,FLAP.H-20,FLAP.W,20);
  // Pipes
  FLAP.pipes.forEach(p=>{ctx.fillStyle='#4dff91';ctx.fillRect(p.x,0,FLAP.PW,p.top);ctx.fillRect(p.x,-5,FLAP.PW+6,p.top+5);ctx.fillRect(p.x,p.bot,FLAP.PW,FLAP.H);ctx.fillRect(p.x-3,p.bot-5,FLAP.PW+6,10);});
  // Bird
  const color=State.players[FLAP.idx].color;
  ctx.save();ctx.translate(80,FLAP.bird.y);ctx.rotate(Math.max(-0.5,Math.min(0.5,FLAP.bird.vy*0.06)));
  ctx.font='24px serif';ctx.textAlign='center';ctx.fillText('🐦',0,8);ctx.restore();
  // Score
  ctx.fillStyle='#fff';ctx.font='bold 28px Fredoka One,cursive';ctx.textAlign='center';ctx.fillText(FLAP.score,FLAP.W/2,36);
  if(!FLAP.running&&FLAP.score>0){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,FLAP.W,FLAP.H);ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka One,cursive';ctx.fillText(`Score: ${FLAP.score}`,FLAP.W/2,FLAP.H/2);}
}
document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&FLAP.running){e.preventDefault();flapJump();}
  if(e.key==='ArrowUp'&&FLAP.running&&State.playerCount>1){e.preventDefault();flapJump();}
  if((e.code==='Space'||e.key==='ArrowUp')&&!FLAP.running&&document.getElementById('shell-canvas')?.style.display!=='none'&&State.currentGame?.id==='flappy'){flapStart();}
});

// ── NUMBER RUSH ────────────────────────────────────────────
const NR={scores:{},idx:0,round:1,rounds:3,nums:[],found:0,start:0,iv:null};
function startNumRush(){
  NR.scores={}; State.players.forEach(p=>NR.scores[p.name]=0); NR.idx=0; NR.round=1;
  shellSetup('🔢 NUMBER RUSH'); buildScoreStrip('shell-scores',NR.scores);
  nrNext();
}
function nrNext(){
  NR.nums=Array.from({length:25},(_,i)=>i+1).sort(()=>Math.random()-.5);
  NR.found=0; NR.start=performance.now();
  const p=State.players[NR.idx];
  shellStatus().innerHTML=`${p.emoji} <b>${p.name}</b> – Click 1→25 in order! Round ${NR.round}/${NR.rounds}`;
  const grid=`<div class="nr-grid">${NR.nums.map(n=>`<button class="nr-num" id="nr-${n}" onclick="nrClick(${n})">${n}</button>`).join('')}</div>`;
  shellMain().innerHTML=grid+`<div class="nr-next" id="nr-next">Find: <b>1</b></div>`;
}
function nrClick(n){
  if(n!==NR.found+1)return;
  const btn=document.getElementById(`nr-${n}`);if(btn){btn.style.background=State.players[NR.idx].color;btn.disabled=true;}
  NR.found++;
  const nxt=document.getElementById('nr-next');if(nxt)nxt.innerHTML=NR.found<25?`Find: <b>${NR.found+1}</b>`:'';
  if(NR.found===25){
    const elapsed=((performance.now()-NR.start)/1000).toFixed(2);
    const pts=Math.max(5,Math.round(60-parseFloat(elapsed)));
    const p=State.players[NR.idx];NR.scores[p.name]+=pts;updateScoreChip(p.name,NR.scores[p.name]);
    playSound('win'); shellStatus().innerHTML=`${p.emoji} Finished in <b>${elapsed}s</b>! +${pts} pts`;
    setTimeout(()=>{
      NR.idx=(NR.idx+1)%State.playerCount;if(NR.idx===0)NR.round++;
      if(NR.round>NR.rounds&&NR.idx===0){const s=Object.entries(NR.scores).sort((a,b)=>b[1]-a[1]);showResult(NR.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);return;}
      nrNext();},1800);
  }
}

// ── BUBBLE POP ────────────────────────────────────────────
const BPOP={scores:{},idx:0,round:1,rounds:3,bubbles:[],iv:null,spawnIv:null,time:20,timeLeft:20};
function startBubble(){
  BPOP.scores={}; State.players.forEach(p=>BPOP.scores[p.name]=0); BPOP.idx=0; BPOP.round=1;
  shellSetup('🔵 BUBBLE POP',{useCanvas:true,cw:360,ch:280});
  buildScoreStrip('shell-scores',BPOP.scores);
  bpopRound();
}
function bpopRound(){
  BPOP.bubbles=[];BPOP.timeLeft=BPOP.time;clearInterval(BPOP.iv);clearInterval(BPOP.spawnIv);
  const p=State.players[BPOP.idx];shellStatus().innerHTML=`${p.emoji} <b>${p.name}</b> – Pop bubbles! Round ${BPOP.round}/${BPOP.rounds}`;
  shellFooter().innerHTML=`<button class="btn-primary" onclick="bpopStart()">▶ START</button>`;
  bpopDraw();
}
function bpopStart(){
  shellFooter().innerHTML=`<div id="bpop-timer" style="font-size:1.5rem;font-weight:900;color:var(--accent)">⏱ ${BPOP.timeLeft}s</div>`;
  BPOP.spawnIv=setInterval(()=>{if(BPOP.bubbles.length<18)BPOP.bubbles.push({x:20+Math.random()*320,y:300,vy:-1-Math.random(),r:14+Math.random()*18,c:State.players[BPOP.idx].color,pop:false});},500);
  BPOP.iv=setInterval(()=>{
    BPOP.timeLeft--;const t=document.getElementById('bpop-timer');if(t)t.textContent=`⏱ ${BPOP.timeLeft}s`;
    BPOP.bubbles.forEach(b=>{b.y+=b.vy;});BPOP.bubbles=BPOP.bubbles.filter(b=>b.y>-b.r&&!b.pop);
    bpopDraw();
    if(BPOP.timeLeft<=0){clearInterval(BPOP.iv);clearInterval(BPOP.spawnIv);bpopEnd();}
  },1000);
  requestAnimationFrame(bpopDrawLoop);
}
function bpopDrawLoop(){if(BPOP.timeLeft>0&&document.getElementById('shell-canvas'))requestAnimationFrame(bpopDrawLoop);bpopDraw();}
function bpopDraw(){
  const cv=shellCanvas(),ctx=shellCtx();if(!cv||!ctx)return;
  ctx.fillStyle='#0a1a2a';ctx.fillRect(0,0,cv.width,cv.height);
  BPOP.bubbles.forEach(b=>{
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.strokeStyle=b.c;ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle=b.c+'33';ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(b.x-b.r*.3,b.y-b.r*.3,b.r*.2,0,Math.PI*2);ctx.fill();
  });
}
shellCanvas()?.addEventListener('click',e=>{
  if(!BPOP.timeLeft)return;
  const rect=shellCanvas().getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  BPOP.bubbles.forEach(b=>{if(!b.pop&&Math.hypot(mx-b.x,my-b.y)<b.r){b.pop=true;const p=State.players[BPOP.idx];BPOP.scores[p.name]++;updateScoreChip(p.name,BPOP.scores[p.name]);playSound('click');}});
  BPOP.bubbles=BPOP.bubbles.filter(b=>!b.pop);
});
function bpopEnd(){
  setTimeout(()=>{
    BPOP.idx=(BPOP.idx+1)%State.playerCount;if(BPOP.idx===0)BPOP.round++;
    if(BPOP.round>BPOP.rounds&&BPOP.idx===0){const s=Object.entries(BPOP.scores).sort((a,b)=>b[1]-a[1]);showResult(BPOP.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);return;}
    bpopRound();},1000);
}

// ── RACING CARS (Canvas) ────────────────────────────────────
const RACE={scores:{},running:false,frame:null,cars:[],TRACK_W:360,TRACK_H:280,winner:null};
function startRacing(){
  RACE.scores={}; State.players.forEach(p=>RACE.scores[p.name]=0);
  RACE.running=false; RACE.winner=null;
  RACE.cars=State.players.map((p,i)=>({x:60,y:60+i*55,vx:0,vy:0,color:p.color,emoji:p.emoji,name:p.name,laps:0,progress:0,angle:0,key:['z','m','q','p'][i],fuel:100}));
  shellSetup('🏎️ RACING',{useCanvas:true,cw:360,ch:280});
  buildScoreStrip('shell-scores',RACE.scores);
  shellStatus().innerHTML=State.players.map((p,i)=>`<span style="color:${p.color}">${p.emoji}<kbd>${['Z','M','Q','P'][i]}</kbd></span>`).join(' ');
  shellFooter().innerHTML=`<button class="btn-primary" onclick="raceStart()">🏁 START RACE!</button>`;
  raceDraw();
}
const RACE_KEYS={};
document.addEventListener('keydown',e=>{RACE_KEYS[e.key.toLowerCase()]=true;});
document.addEventListener('keyup',e=>{RACE_KEYS[e.key.toLowerCase()]=false;});
function raceStart(){
  RACE.running=true;shellFooter().innerHTML='<b style="color:var(--text-dim)">Mash your key to go faster!</b>';
  raceLoop();
}
function raceLoop(){
  if(!RACE.running)return;
  RACE.cars.forEach(car=>{
    if(RACE_KEYS[car.key]){car.vx=Math.min(car.vx+0.3,5);} else{car.vx*=0.96;}
    car.x+=car.vx;
    // Loop back
    if(car.x>RACE.TRACK_W-30){car.x=RACE.TRACK_W-30;car.laps++;playSound('match');if(car.laps>=3&&!RACE.winner){RACE.winner=car;raceEnd(car);return;}}
    car.progress=car.x/RACE.TRACK_W+car.laps*10;
  });
  raceDraw();
  RACE.frame=requestAnimationFrame(raceLoop);
}
function raceEnd(winCar){
  RACE.running=false;cancelAnimationFrame(RACE.frame);
  RACE.cars.forEach((c,i)=>{ RACE.scores[c.name]=RACE.cars.length-i; });
  RACE.scores[winCar.name]=RACE.cars.length+2;
  updateScoreChip(winCar.name,RACE.scores[winCar.name]);
  setTimeout(()=>{const s=Object.entries(RACE.scores).sort((a,b)=>b[1]-a[1]);showResult(RACE.scores,s[0][0],false);},1200);
}
function raceDraw(){
  const cv=shellCanvas(),ctx=shellCtx();if(!cv||!ctx)return;
  ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,cv.width,cv.height);
  // Track lanes
  RACE.cars.forEach((car,i)=>{
    const y=car.y;
    ctx.fillStyle='#222';ctx.fillRect(20,y-18,cv.width-40,36);
    ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=1;ctx.strokeRect(20,y-18,cv.width-40,36);
    // Progress
    ctx.fillStyle=car.color+'55';ctx.fillRect(20,y-18,(car.x-20),36);
    // Car emoji
    ctx.font='22px serif';ctx.textAlign='left';ctx.fillText(car.emoji,car.x-15,y+8);
    // Lap label
    ctx.fillStyle=car.color;ctx.font='bold 11px Nunito';ctx.textAlign='right';ctx.fillText(`Lap ${car.laps+1}/3`,cv.width-22,y+5);
  });
  // Finish line
  for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#fff':'#000';ctx.fillRect(cv.width-32,20+i*30,12,30);}
  if(RACE.winner){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#ffd44d';ctx.font='bold 28px Fredoka One,cursive';ctx.textAlign='center';ctx.fillText(`${RACE.winner.emoji} WINS! 🏁`,cv.width/2,cv.height/2);}
}

// ── GRAVITY JUMP (Canvas) ────────────────────────────────────
const GJ={scores:{},idx:0,round:1,rounds:3,running:false,frame:null,player:{x:60,y:220,vy:0,onGround:true},obstacles:[],score:0,speed:3,spawnTimer:0,W:360,H:280,G:0.5,JUMP:-10};
function startGravJump(){
  GJ.scores={}; State.players.forEach(p=>GJ.scores[p.name]=0); GJ.idx=0; GJ.round=1;
  shellSetup('🌙 GRAVITY JUMP',{useCanvas:true,cw:360,ch:280});
  buildScoreStrip('shell-scores',GJ.scores);
  gjNewRound();
}
function gjNewRound(){
  GJ.player={x:60,y:220,vy:0,onGround:true};GJ.obstacles=[];GJ.score=0;GJ.speed=3;GJ.spawnTimer=0;GJ.running=false;
  const p=State.players[GJ.idx];
  shellStatus().innerHTML=`${p.emoji} <b>${p.name}</b> – Jump over obstacles! Round ${GJ.round}/${GJ.rounds}`;
  shellFooter().innerHTML=`<button class="btn-primary" onclick="gjStart()">🌙 START</button>`;
  gjDraw();
}
function gjStart(){RACE.running=false;GJ.running=true;shellFooter().innerHTML='<span style="color:var(--text-dim)">SPACE / tap to jump!</span>';gjLoop();}
function gjJump(){if(GJ.player.onGround){GJ.player.vy=GJ.JUMP;GJ.player.onGround=false;playSound('click');}}
function gjLoop(){
  if(!GJ.running)return;
  GJ.player.vy+=GJ.G;GJ.player.y+=GJ.player.vy;
  if(GJ.player.y>=220){GJ.player.y=220;GJ.player.vy=0;GJ.player.onGround=true;}
  GJ.spawnTimer++;if(GJ.spawnTimer>70-GJ.score){GJ.spawnTimer=0;GJ.obstacles.push({x:GJ.W+10,w:20,h:20+Math.random()*30,scored:false});}
  GJ.speed=3+GJ.score*.15;
  GJ.obstacles.forEach(o=>{o.x-=GJ.speed;if(!o.scored&&o.x<60){o.scored=true;GJ.score++;}});
  GJ.obstacles=GJ.obstacles.filter(o=>o.x>-o.w);
  // Collision
  for(const o of GJ.obstacles){if(GJ.player.x+16>o.x&&GJ.player.x<o.x+o.w&&GJ.player.y+16>GJ.H-o.h-20){gjDie();return;}}
  gjDraw();
  GJ.frame=requestAnimationFrame(gjLoop);
}
function gjDie(){
  GJ.running=false;cancelAnimationFrame(GJ.frame);
  const p=State.players[GJ.idx];const pts=GJ.score;GJ.scores[p.name]+=pts;updateScoreChip(p.name,GJ.scores[p.name]);playSound('die');
  gjDraw();
  setTimeout(()=>{
    GJ.idx=(GJ.idx+1)%State.playerCount;if(GJ.idx===0)GJ.round++;
    if(GJ.round>GJ.rounds&&GJ.idx===0){const s=Object.entries(GJ.scores).sort((a,b)=>b[1]-a[1]);showResult(GJ.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);return;}
    gjNewRound();},1500);
}
function gjDraw(){
  const cv=shellCanvas(),ctx=shellCtx();if(!cv||!ctx)return;
  const H=GJ.H,W=GJ.W;
  ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
  // Stars
  ctx.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<20;i++){ctx.fillRect((i*37)%W,(i*29)%200,2,2);}
  // Ground
  ctx.fillStyle='#4a3a1a';ctx.fillRect(0,H-20,W,20);ctx.strokeStyle='#ffd44d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,H-20);ctx.lineTo(W,H-20);ctx.stroke();
  // Obstacles
  GJ.obstacles.forEach(o=>{ctx.fillStyle='#ff4d6d';ctx.fillRect(o.x,H-o.h-20,o.w,o.h);});
  // Player
  ctx.font='24px serif';ctx.textAlign='left';ctx.fillText(State.players[GJ.idx].emoji,GJ.player.x,GJ.player.y+16);
  // Score
  ctx.fillStyle='#fff';ctx.font='bold 22px Fredoka One,cursive';ctx.textAlign='right';ctx.fillText(`⭐ ${GJ.score}`,W-10,34);
  if(!GJ.running&&GJ.score>0){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px Fredoka One,cursive';ctx.textAlign='center';ctx.fillText(`Score: ${GJ.score}`,W/2,H/2);}
}
// Gravity Jump keyboard
document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&GJ.running){e.preventDefault();gjJump();}
});
shellCanvas()?.addEventListener('click',()=>{if(GJ.running)gjJump();});
