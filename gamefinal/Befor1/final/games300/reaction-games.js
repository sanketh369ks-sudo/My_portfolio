/* ============================================================
   REACTION GAMES – 4 games
   ⚡ Reaction Test | ⏱️ Stop the Clock | 🎯 Quick Draw | 💣 Bomb Defuse
   ============================================================ */

// ──────────────────────────────────────────────────────────────
// ⚡ REACTION TEST
// ──────────────────────────────────────────────────────────────
const REACT = {
  scores:{}, round:1, rounds:5,
  waiting:false, startTime:0, timeout:null,
  KEYS:['z','m','q','p'],
};
function startReaction() {
  REACT.scores={}; State.players.forEach(p=>REACT.scores[p.name]=0);
  REACT.round=1; REACT.waiting=false;
  shellSetup('⚡ REACTION TEST');
  buildScoreStrip('shell-scores', REACT.scores);
  shellMain().innerHTML=`
    <div class="react-wrap">
      <div class="react-circle" id="rc-circle" style="cursor:pointer;"><span id="rc-inner">GET READY</span></div>
      <div class="react-msg" id="rc-msg">Wait for GREEN – then tap or press key!</div>
      <div class="react-keys" id="rc-keys"></div>
    </div>`;
  const k=document.getElementById('rc-keys');
  State.players.forEach((p,i)=>k.innerHTML+=`<span style="color:${p.color}">${p.emoji} <kbd>${REACT.KEYS[i].toUpperCase()}</kbd></span>`);
  
  const circle = document.getElementById('rc-circle');
  if (circle) {
    circle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerReactPlayer(0);
    });
  }

  renderMultiplayerTouchBar('shell-footer', State.playerCount, (pIdx) => {
    triggerReactPlayer(pIdx);
  });

  reactNext();
}

function triggerReactPlayer(i) {
  if (i < 0 || i >= State.playerCount) return;
  if (!REACT.waiting) {
    REACT.scores[State.players[i].name]--;
    updateScoreChip(State.players[i].name, REACT.scores[State.players[i].name]);
    playSound('die');
    return;
  }
  clearTimeout(REACT.timeout);
  REACT.waiting = false;
  const ms = Math.round(performance.now() - REACT.startTime);
  const p = State.players[i];
  REACT.scores[p.name] += Math.max(0, 10 - Math.floor(ms / 100));
  updateScoreChip(p.name, REACT.scores[p.name]);
  const c = document.getElementById('rc-circle');
  if (c) c.style.background = p.color;
  const msg = document.getElementById('rc-msg');
  if (msg) msg.textContent = `${p.emoji} ${ms}ms!`;
  playSound('match');
  REACT.round++;
  if (REACT.round > REACT.rounds) setTimeout(reactEnd, 1000);
  else setTimeout(reactNext, 1400);
}

function reactNext(){
  clearTimeout(REACT.timeout); REACT.waiting=false;
  const c=document.getElementById('rc-circle'), inn=document.getElementById('rc-inner'), msg=document.getElementById('rc-msg');
  if(!c)return;
  c.style.background='#ff4d6d'; c.style.boxShadow='0 0 40px #ff4d6d88';
  inn.textContent=`Round ${REACT.round}/${REACT.rounds}`; msg.textContent='Wait for GREEN...';
  REACT.timeout=setTimeout(()=>{
    if(!document.getElementById('rc-circle'))return;
    c.style.background='#4dff91'; c.style.boxShadow='0 0 50px #4dff91aa';
    inn.textContent='GO!'; REACT.waiting=true; REACT.startTime=performance.now(); playSound('start');

    // Auto reaction for CPU players
    State.players.forEach((p, i) => {
      if (p.name.startsWith('CPU')) {
        setTimeout(() => {
          if (REACT.waiting) triggerReactPlayer(i);
        }, 250 + Math.random() * 300);
      }
    });

    REACT.timeout=setTimeout(()=>{ if(REACT.waiting){msg.textContent='Too slow!'; REACT.round++; REACT.round>REACT.rounds?setTimeout(reactEnd,800):setTimeout(reactNext,1200); REACT.waiting=false;}},3000);
  }, 1500+Math.random()*3000);
}
function reactEnd(){ const s=Object.entries(REACT.scores).sort((a,b)=>b[1]-a[1]); showResult(REACT.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]); }

// ──────────────────────────────────────────────────────────────
// ⏱️ STOP THE CLOCK
// ──────────────────────────────────────────────────────────────
const STC = { scores:{}, round:1, rounds:3, idx:0, running:false, startTime:0, iv:null, TARGET:3000 };
function startStopClock(){
  STC.scores={}; State.players.forEach(p=>STC.scores[p.name]=0);
  STC.round=1; STC.idx=0; STC.running=false;
  shellSetup('⏱️ STOP THE CLOCK');
  buildScoreStrip('shell-scores', STC.scores);
  shellMain().innerHTML=`
    <div class="stc-wrap">
      <div class="stc-target">🎯 TARGET: <b>3.000s</b></div>
      <div class="stc-display" id="stc-time">0.000</div>
      <div class="stc-info" id="stc-info"></div>
    </div>`;
  shellFooter().innerHTML=`<button class="btn-primary" id="stc-btn" onclick="stcAction()">▶ START</button>`;
  stcUpdateInfo();
}
function stcUpdateInfo(){ const p=State.players[STC.idx]; document.getElementById('stc-info').innerHTML=`${p.emoji} <b>${p.name}</b> – Round ${STC.round}/${STC.rounds} – Stop at exactly 3.000s!`; }
function stcAction(){
  if(!STC.running){
    STC.running=true; STC.startTime=performance.now(); document.getElementById('stc-btn').textContent='⏹ STOP';
    STC.iv=setInterval(()=>{ const el=document.getElementById('stc-time'); if(el)el.textContent=((performance.now()-STC.startTime)/1000).toFixed(3); },16);
  } else {
    clearInterval(STC.iv); STC.running=false;
    const elapsed=performance.now()-STC.startTime, diff=Math.abs(elapsed-STC.TARGET), pts=Math.max(0,10-Math.floor(diff/150));
    const p=State.players[STC.idx]; STC.scores[p.name]+=pts; updateScoreChip(p.name,STC.scores[p.name]);
    document.getElementById('stc-time').textContent=(elapsed/1000).toFixed(3);
    document.getElementById('stc-info').innerHTML=`${p.emoji} stopped at ${(elapsed/1000).toFixed(3)}s &rarr; <b style="color:${pts>=7?'var(--p3)':'var(--p1)'}">+${pts} pts</b>`;
    document.getElementById('stc-btn').textContent='▶ NEXT';
    playSound(pts>=7?'match':'click');
    setTimeout(()=>{
      STC.idx++; if(STC.idx>=State.playerCount){STC.round++;STC.idx=0;}
      if(STC.round>STC.rounds&&STC.idx===0){ const s=Object.entries(STC.scores).sort((a,b)=>b[1]-a[1]); showResult(STC.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]); return; }
      stcUpdateInfo(); document.getElementById('stc-btn').textContent='▶ START'; document.getElementById('stc-time').textContent='0.000';
    },1600);
  }
}

// ──────────────────────────────────────────────────────────────
// 🎯 QUICK DRAW
// ──────────────────────────────────────────────────────────────
const QD={ scores:{}, round:1, rounds:5, waiting:false, fired:false, timeout:null, KEYS:['z','m','q','p'] };
function startQuickDraw(){
  QD.scores={}; State.players.forEach(p=>QD.scores[p.name]=0);
  QD.round=1; QD.fired=false;
  shellSetup('🎯 QUICK DRAW');
  buildScoreStrip('shell-scores', QD.scores);
  shellMain().innerHTML=`
    <div class="qdraw-wrap">
      <div class="qdraw-signal" id="qd-sig" style="cursor:pointer;">🤠</div>
      <div class="qdraw-msg" id="qd-msg">Get ready for the duel…</div>
    </div>
    <div class="react-keys" id="qd-keys"></div>`;
  const k=document.getElementById('qd-keys');
  State.players.forEach((p,i)=>k.innerHTML+=`<span style="color:${p.color}">${p.emoji} <kbd>${QD.KEYS[i].toUpperCase()}</kbd></span>`);
  
  const sig = document.getElementById('qd-sig');
  if (sig) {
    sig.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerQDPlayer(0);
    });
  }

  renderMultiplayerTouchBar('shell-footer', State.playerCount, (pIdx) => {
    triggerQDPlayer(pIdx);
  });

  qdNext();
}

function triggerQDPlayer(i) {
  if (i < 0 || i >= State.playerCount || QD.fired) return;
  if (!QD.waiting) {
    QD.scores[State.players[i].name]--;
    updateScoreChip(State.players[i].name, QD.scores[State.players[i].name]);
    playSound('die');
    return;
  }
  clearTimeout(QD.timeout);
  QD.waiting = false;
  QD.fired = true;
  const p = State.players[i];
  QD.scores[p.name]++;
  updateScoreChip(p.name, QD.scores[p.name]);
  const s = document.getElementById('qd-sig');
  if (s) s.textContent = '💨';
  const m = document.getElementById('qd-msg');
  if (m) {
    m.style.color = p.color;
    m.textContent = `${p.emoji} ${p.name} WINS!`;
  }
  playSound('win');
  QD.round++;
  if (QD.round > QD.rounds) setTimeout(qdEnd, 1000);
  else setTimeout(qdNext, 1400);
}

function qdNext(){
  QD.waiting=false; QD.fired=false;
  const s=document.getElementById('qd-sig'),m=document.getElementById('qd-msg');
  if(!s)return;
  s.textContent='🤠'; s.style.transform='scale(1)'; if(m){m.textContent=`Round ${QD.round}/${QD.rounds} – DRAW when you see 🔫`; m.style.color='';}
  QD.timeout=setTimeout(()=>{
    if(!document.getElementById('qd-sig'))return;
    s.textContent='🔫'; s.style.transform='scale(1.4)'; if(m)m.textContent='DRAW!!!';
    QD.waiting=true; playSound('start');

    // Auto trigger for CPU
    State.players.forEach((p, i) => {
      if (p.name.startsWith('CPU')) {
        setTimeout(() => {
          if (QD.waiting && !QD.fired) triggerQDPlayer(i);
        }, 220 + Math.random() * 300);
      }
    });

    QD.timeout=setTimeout(()=>{ if(!QD.fired){ if(m)m.textContent='Too slow!'; QD.round++; QD.round>QD.rounds?setTimeout(qdEnd,800):setTimeout(qdNext,1200); QD.waiting=false; }},2000);
  }, 1200+Math.random()*3000);
}
function qdEnd(){ const s=Object.entries(QD.scores).sort((a,b)=>b[1]-a[1]); showResult(QD.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]); }

// ──────────────────────────────────────────────────────────────
// 💣 BOMB DEFUSE
// ──────────────────────────────────────────────────────────────
const BOMB={ scores:{}, round:1, rounds:4, idx:0, wire:null, timer:6, iv:null, defused:false,
  WIRES:[{c:'#ff4d6d',n:'RED',k:'r'},{c:'#4db8ff',n:'BLUE',k:'b'},{c:'#4dff91',n:'GREEN',k:'g'},{c:'#ffd44d',n:'YELLOW',k:'y'}] };
function startBomb(){
  BOMB.scores={}; State.players.forEach(p=>BOMB.scores[p.name]=0);
  BOMB.round=1; BOMB.idx=0;
  shellSetup('💣 BOMB DEFUSE');
  buildScoreStrip('shell-scores', BOMB.scores);
  shellMain().innerHTML=`
    <div class="bomb-wrap">
      <div class="bomb-face" id="bomb-face">💣</div>
      <div class="bomb-count" id="bomb-count">6</div>
      <div class="bomb-wire" id="bomb-wire">Cut the wire!</div>
      <div class="bomb-info" id="bomb-info"></div>
    </div>
    <div class="bomb-btns">
      <button class="bomb-key-btn" style="background:#ff4d6d" onclick="bombCut('r')">R RED</button>
      <button class="bomb-key-btn" style="background:#4db8ff" onclick="bombCut('b')">B BLUE</button>
      <button class="bomb-key-btn" style="background:#4dff91;color:#000" onclick="bombCut('g')">G GREEN</button>
      <button class="bomb-key-btn" style="background:#ffd44d;color:#000" onclick="bombCut('y')">Y YELLOW</button>
    </div>`;
  bombNext();
}
function bombNext(){
  clearInterval(BOMB.iv); BOMB.defused=false; BOMB.timer=6;
  BOMB.wire=BOMB.WIRES[Math.floor(Math.random()*4)];
  const p=State.players[BOMB.idx];
  const wEl=document.getElementById('bomb-wire'),iEl=document.getElementById('bomb-info'),cEl=document.getElementById('bomb-count'),fEl=document.getElementById('bomb-face');
  if(wEl){wEl.textContent=`✂️ CUT THE ${BOMB.wire.n} WIRE`;wEl.style.color=BOMB.wire.c;}
  if(iEl)iEl.innerHTML=`${p.emoji} <b>${p.name}</b> – Round ${BOMB.round}/${BOMB.rounds}`;
  if(cEl)cEl.textContent=BOMB.timer; if(fEl)fEl.textContent='💣';
  BOMB.iv=setInterval(()=>{ BOMB.timer--; const c=document.getElementById('bomb-count'); if(c)c.textContent=BOMB.timer; if(BOMB.timer<=0)bombExplode(); },1000);
}
function bombCut(k){
  if(BOMB.defused)return; BOMB.defused=true; clearInterval(BOMB.iv);
  const p=State.players[BOMB.idx],f=document.getElementById('bomb-wire');
  if(k===BOMB.wire.k){ const pts=BOMB.timer+1; BOMB.scores[p.name]+=pts; updateScoreChip(p.name,BOMB.scores[p.name]); if(f)f.textContent=`✅ DEFUSED! +${pts} pts`; document.getElementById('bomb-face').textContent='🎉'; playSound('match'); }
  else { if(f)f.textContent=`💥 WRONG WIRE!`; document.getElementById('bomb-face').textContent='💥'; playSound('die'); }
  setTimeout(bombAdvance,1200);
}
function bombExplode(){ if(BOMB.defused)return; BOMB.defused=true; clearInterval(BOMB.iv); document.getElementById('bomb-face').textContent='💥'; document.getElementById('bomb-wire').textContent='💥 BOOM!'; playSound('die'); setTimeout(bombAdvance,1000); }
function bombAdvance(){
  BOMB.idx++; if(BOMB.idx>=State.playerCount){BOMB.round++;BOMB.idx=0;}
  if(BOMB.round>BOMB.rounds&&BOMB.idx===0){ const s=Object.entries(BOMB.scores).sort((a,b)=>b[1]-a[1]); showResult(BOMB.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]); return; }
  bombNext();
}

// ── KEYBOARD BRIDGE ───────────────────────────────────────────
document.addEventListener('keydown', e=>{
  if(!document.getElementById('screen-shell').classList.contains('active'))return;
  const k=e.key.toLowerCase();
  // Reaction Test
  if(document.getElementById('rc-circle')){
    REACT.KEYS.slice(0,State.playerCount).forEach((bk,i)=>{ if(k===bk){ if(!REACT.waiting){REACT.scores[State.players[i].name]--; updateScoreChip(State.players[i].name,REACT.scores[State.players[i].name]); playSound('die'); return;} clearTimeout(REACT.timeout); REACT.waiting=false; const ms=Math.round(performance.now()-REACT.startTime); const p=State.players[i]; REACT.scores[p.name]+=Math.max(0,10-Math.floor(ms/100)); updateScoreChip(p.name,REACT.scores[p.name]); const c=document.getElementById('rc-circle'); if(c){c.style.background=p.color;} document.getElementById('rc-msg').textContent=`${p.emoji} ${ms}ms!`; playSound('match'); REACT.round++; REACT.round>REACT.rounds?setTimeout(reactEnd,1000):setTimeout(reactNext,1400); }});
  }
  // Quick Draw
  if(document.getElementById('qd-sig')){
    QD.KEYS.slice(0,State.playerCount).forEach((bk,i)=>{ if(k===bk){ if(QD.fired)return; if(!QD.waiting){ QD.scores[State.players[i].name]--; updateScoreChip(State.players[i].name,QD.scores[State.players[i].name]); playSound('die'); return; } clearTimeout(QD.timeout); QD.waiting=false; QD.fired=true; const p=State.players[i]; QD.scores[p.name]++; updateScoreChip(p.name,QD.scores[p.name]); document.getElementById('qd-sig').textContent='💨'; document.getElementById('qd-msg').style.color=p.color; document.getElementById('qd-msg').textContent=`${p.emoji} ${p.name} WINS!`; playSound('win'); QD.round++; QD.round>QD.rounds?setTimeout(qdEnd,1000):setTimeout(qdNext,1400); }});
  }
  // Stop Clock
  if(k===' '&&document.getElementById('stc-time')){e.preventDefault();stcAction();}
  // Bomb
  if(['r','b','g','y'].includes(k)&&document.getElementById('bomb-wire')&&!BOMB.defused)bombCut(k);
});
