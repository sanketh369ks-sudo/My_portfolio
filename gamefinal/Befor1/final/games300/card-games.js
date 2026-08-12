/* ============================================================
   CARD / CHANCE GAMES – 5 games
   🃏 Higher or Lower | 🎲 Dice Duel | 🪨 RPS | 🎰 Slots | ⚔️ Card War
   ============================================================ */

// ── HIGHER OR LOWER ─────────────────────────────────────────
const HL={scores:{},idx:0,round:1,rounds:6,deck:[],cur:0,streak:0,
  VALS:['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
  SUITS:['♠','♥','♦','♣']};
function startHigherLower(){
  HL.scores={}; State.players.forEach(p=>HL.scores[p.name]=0);
  HL.idx=0;HL.round=1;HL.streak=0;
  HL.deck=Array.from({length:52},()=>Math.floor(Math.random()*13)+1);
  HL.cur=HL.deck.shift();
  shellSetup('🃏 HIGHER OR LOWER');
  buildScoreStrip('shell-scores',HL.scores);
  shellMain().innerHTML=`
    <div class="hl-area">
      <div class="hl-info" id="hl-info"></div>
      <div class="playing-card hl-card" id="hl-card"></div>
      <div class="hl-btns">
        <button class="btn-primary" style="background:var(--p3);min-width:130px" onclick="hlGuess('h')">⬆ HIGHER</button>
        <button class="btn-primary" style="background:var(--p1);min-width:130px" onclick="hlGuess('l')">⬇ LOWER</button>
      </div>
      <div class="hl-streak" id="hl-streak"></div>
    </div>`;
  hlRender();
}
function hlCardHTML(v){const s=HL.SUITS[Math.floor(Math.random()*4)];const r=s==='♥'||s==='♦';return `<div style="color:${r?'#ff4d6d':'#fff'};font-size:1.1em">${HL.VALS[v-1]}<br><span style="font-size:2em">${s}</span><br>${HL.VALS[v-1]}</div>`;}
function hlRender(){
  const el=document.getElementById('hl-card');if(el)el.innerHTML=hlCardHTML(HL.cur);
  const p=State.players[HL.idx];
  const i=document.getElementById('hl-info');
  if(i)i.innerHTML=`${p ? p.emoji : '🎮'} <b>${p ? p.name : 'Player'}</b> – Round ${HL.round}/${HL.rounds}`;

  if (p && p.name && p.name.startsWith('CPU')) {
    setTimeout(() => {
      const g = Math.random() > 0.5 ? 'h' : 'l';
      hlGuess(g);
    }, 600);
  }
}
function hlGuess(g){
  if(!HL.deck.length)return;
  const next=HL.deck.shift(),ok=(g==='h'&&next>=HL.cur)||(g==='l'&&next<=HL.cur);
  const p=State.players[HL.idx];
  if(ok){HL.streak++;HL.scores[p.name]+=(1+Math.floor(HL.streak/2));updateScoreChip(p.name,HL.scores[p.name]);playSound('match');}
  else{HL.streak=0;playSound('die');}
  HL.cur=next; hlRender();
  const st=document.getElementById('hl-streak');if(st)st.textContent=HL.streak>1?`🔥 ${HL.streak}× streak!`:'';
  HL.idx=(HL.idx+1)%State.playerCount; if(HL.idx===0)HL.round++;
  if(HL.round>HL.rounds){setTimeout(()=>{const s=Object.entries(HL.scores).sort((a,b)=>b[1]-a[1]);showResult(HL.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);},600);}
}

// ── DICE DUEL ────────────────────────────────────────────────
const DD={scores:{},round:1,rounds:5,rolling:false,FACES:['','⚀','⚁','⚂','⚃','⚄','⚅']};
function startDice(){
  DD.scores={}; State.players.forEach(p=>DD.scores[p.name]=0); DD.round=1; DD.rolling=false;
  shellSetup('🎲 DICE DUEL');
  buildScoreStrip('shell-scores',DD.scores);
  shellMain().innerHTML=`<div class="dice-area"><div class="dice-round-lbl" id="dd-round">Round 1/${DD.rounds}</div><div class="dice-grid" id="dd-grid"></div><div class="dice-result" id="dd-res">Roll to begin!</div></div>`;
  shellFooter().innerHTML=`<button class="btn-primary" onclick="diceRoll()">🎲 ROLL ALL DICE</button>`;
  diceRenderGrid();
}
function diceRenderGrid(vals=null){
  const g=document.getElementById('dd-grid');if(!g)return;g.innerHTML='';
  State.players.forEach((p,i)=>{const v=vals?vals[i]:null;const d=document.createElement('div');d.className='dice-item';d.innerHTML=`<div class="die-face" style="border-color:${p.color};color:${p.color}">${v?DD.FACES[v]:'\ud83c\udfb2'}</div><div style="color:${p.color};font-size:.8rem;font-weight:900">${p.emoji} ${p.name}</div>`;g.appendChild(d);});
}
function diceRoll(){
  if(DD.rolling)return;DD.rolling=true;let t=0;
  const int=setInterval(()=>{diceRenderGrid(State.players.map(()=>Math.floor(Math.random()*6)+1));t++;if(t>=14){clearInterval(int);DD.rolling=false;
    const f=State.players.map(()=>Math.floor(Math.random()*6)+1);diceRenderGrid(f);
    const mx=Math.max(...f),ws=f.map((v,i)=>v===mx?i:-1).filter(i=>i>=0);
    ws.forEach(wi=>{DD.scores[State.players[wi].name]++;updateScoreChip(State.players[wi].name,DD.scores[State.players[wi].name]);});
    const res=document.getElementById('dd-res');
    if(res)res.textContent=ws.length>1?'Tie!':`${State.players[ws[0]].emoji} ${State.players[ws[0]].name} wins (${DD.FACES[f[ws[0]]]})!`;
    playSound(ws.length>1?'draw':'win'); DD.round++;
    if(DD.round>DD.rounds){setTimeout(()=>{const s=Object.entries(DD.scores).sort((a,b)=>b[1]-a[1]);showResult(DD.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);},1000);}
    else{const rl=document.getElementById('dd-round');if(rl)rl.textContent=`Round ${DD.round}/${DD.rounds}`;}
  }},80);playSound('start');
}

// ── ROCK PAPER SCISSORS ──────────────────────────────────────
const RPS={scores:{},round:1,rounds:5,choices:{},revealed:false,BEATS:{rock:'scissors',paper:'rock',scissors:'paper'},EMO:{rock:'🪨',paper:'📄',scissors:'✂️'}};
function startRPS(){
  RPS.scores={}; State.players.forEach(p=>RPS.scores[p.name]=0); RPS.round=1;
  shellSetup('🪨 ROCK PAPER SCISSORS'); buildScoreStrip('shell-scores',RPS.scores); rpsRound();
}
function rpsRound(){
  RPS.choices={}; RPS.revealed=false;
  let h=`<div class="rps-round">Round ${RPS.round}/${RPS.rounds}</div><div class="rps-grid">`;
  State.players.forEach((p,i)=>h+=`<div class="rps-pcard" id="rps-p${i}"><div style="color:${p.color};font-weight:900">${p.emoji} ${p.name}</div><div class="rps-choice-disp" id="rps-c${i}">❓</div><div class="rps-btns-row"><button class="rps-pick" onclick="rpsPick(${i},'rock')">🪨</button><button class="rps-pick" onclick="rpsPick(${i},'paper')">📄</button><button class="rps-pick" onclick="rpsPick(${i},'scissors')">✂️</button></div></div>`);
  h+=`</div><div class="rps-result" id="rps-result">Each player pick secretly!</div>`;
  shellMain().innerHTML=h;

  State.players.forEach((p, i) => {
    if (p.name.startsWith('CPU')) {
      setTimeout(() => {
        const opts = ['rock', 'paper', 'scissors'];
        rpsPick(i, opts[Math.floor(Math.random() * 3)]);
      }, 400);
    }
  });
}
function rpsPick(idx,ch){
  if(RPS.revealed||RPS.choices[State.players[idx].name])return;
  RPS.choices[State.players[idx].name]=ch;
  const el=document.getElementById(`rps-c${idx}`);if(el)el.textContent='✅';
  document.getElementById(`rps-p${idx}`).querySelectorAll('.rps-pick').forEach(b=>b.disabled=true);
  playSound('click');
  if(Object.keys(RPS.choices).length===State.playerCount){RPS.revealed=true;setTimeout(rpsReveal,500);}
}
function rpsReveal(){
  State.players.forEach((p,i)=>{const el=document.getElementById(`rps-c${i}`);if(el)el.textContent=RPS.EMO[RPS.choices[p.name]]||'?';});
  const names=State.players.map(p=>p.name),winners=[];
  if(State.playerCount===2){const[n1,n2]=names,c1=RPS.choices[n1],c2=RPS.choices[n2];if(c1!==c2){if(RPS.BEATS[c1]===c2)winners.push(n1);else winners.push(n2);}}
  else{const u=[...new Set(Object.values(RPS.choices))];if(u.length===2){const w=u.find(c=>u.find(o=>o!==c&&RPS.BEATS[c]===o));if(w)names.forEach(n=>{if(RPS.choices[n]===w)winners.push(n);});}}
  winners.forEach(n=>{RPS.scores[n]++;updateScoreChip(n,RPS.scores[n]);});
  const res=document.getElementById('rps-result');
  if(res)res.textContent=winners.length?winners.map(n=>{const p=State.players.find(pl=>pl.name===n);return `${p.emoji} ${n} wins!`;}).join(' '):"It's a tie!";
  playSound(winners.length?'win':'draw'); RPS.round++;
  if(RPS.round>RPS.rounds){setTimeout(()=>{const s=Object.entries(RPS.scores).sort((a,b)=>b[1]-a[1]);showResult(RPS.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);},1200);}
  else setTimeout(rpsRound,1600);
}

// ── SLOT MACHINE ─────────────────────────────────────────────
const SLOTS={scores:{},idx:0,round:1,rounds:3,spinning:false,SYM:['🍒','🍋','🍊','⭐','💎','7️⃣','🍇','🎰']};
function startSlots(){
  SLOTS.scores={}; State.players.forEach(p=>SLOTS.scores[p.name]=0); SLOTS.idx=0; SLOTS.round=1;
  shellSetup('🎰 SLOT MACHINE'); buildScoreStrip('shell-scores',SLOTS.scores);
  shellMain().innerHTML=`<div class="slot-machine"><div class="slot-display"><div class="slot-reel" id="sr1">🎰</div><div class="slot-reel" id="sr2">🎰</div><div class="slot-reel" id="sr3">🎰</div></div><div class="slot-result" id="slot-res">Pull the lever!</div><div class="slot-player" id="slot-pname"></div></div>`;
  shellFooter().innerHTML=`<button class="btn-primary" style="background:linear-gradient(135deg,#ff4d6d,#ffd44d)" onclick="slotSpin()">🎰 SPIN!</button>`;
  slotsInfo();
}
function slotsInfo(){const p=State.players[SLOTS.idx];const el=document.getElementById('slot-pname');if(el)el.innerHTML=`${p.emoji} <b>${p.name}</b> – Round ${SLOTS.round}/${SLOTS.rounds}`;}
function slotSpin(){
  if(SLOTS.spinning)return;SLOTS.spinning=true;let t=0;playSound('start');
  const int=setInterval(()=>{
    ['sr1','sr2','sr3'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=SLOTS.SYM[Math.floor(Math.random()*SLOTS.SYM.length)];});
    t++;if(t>=18){clearInterval(int);SLOTS.spinning=false;
      const f=Array.from({length:3},()=>SLOTS.SYM[Math.floor(Math.random()*SLOTS.SYM.length)]);
      ['sr1','sr2','sr3'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=f[i];});
      const p=State.players[SLOTS.idx];let pts=0;
      const res=document.getElementById('slot-res');
      if(f[0]===f[1]&&f[1]===f[2]){pts=f[0]==='💎'?20:f[0]==='7️⃣'?15:10;if(res)res.textContent=`🎊 JACKPOT! +${pts}`;playSound('win');}
      else if(f[0]===f[1]||f[1]===f[2]||f[0]===f[2]){pts=3;if(res)res.textContent=`Two of a kind! +3`;playSound('match');}
      else{if(res)res.textContent='No match…';playSound('click');}
      SLOTS.scores[p.name]+=pts;updateScoreChip(p.name,SLOTS.scores[p.name]);
      setTimeout(()=>{
        SLOTS.idx++;if(SLOTS.idx>=State.playerCount){SLOTS.round++;SLOTS.idx=0;}
        if(SLOTS.round>SLOTS.rounds&&SLOTS.idx===0){const s=Object.entries(SLOTS.scores).sort((a,b)=>b[1]-a[1]);showResult(SLOTS.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);return;}
        slotsInfo();
      },1400);
    }
  },80);
}

// ── CARD WAR ─────────────────────────────────────────────────
const CW={scores:{},round:1,rounds:7,VALS:['2','3','4','5','6','7','8','9','10','J','Q','K','A'],SUITS:['♠','♥','♦','♣']};
function startCardWar(){
  CW.scores={}; State.players.forEach(p=>CW.scores[p.name]=0); CW.round=1;
  shellSetup('⚔️ CARD WAR'); buildScoreStrip('shell-scores',CW.scores);
  shellMain().innerHTML=`<div class="cw-area"><div class="cw-round" id="cw-round">Round 1/${CW.rounds}</div><div class="cw-cards" id="cw-cards"><p style="color:var(--text-dim)">Draw cards to duel!</p></div><div class="cw-result" id="cw-res"></div></div>`;
  shellFooter().innerHTML=`<button class="btn-primary" onclick="cwDraw()">🃏 DRAW CARDS!</button>`;
}
function cwDraw(){
  const cards=State.players.map(()=>({v:Math.floor(Math.random()*13),s:CW.SUITS[Math.floor(Math.random()*4)]}));
  const area=document.getElementById('cw-cards');if(!area)return;area.innerHTML='';
  cards.forEach((c,i)=>{const p=State.players[i];const red=c.s==='♥'||c.s==='♦';const d=document.createElement('div');d.className='playing-card cw-card';d.style.borderColor=p.color;d.innerHTML=`<div style="color:${red?'#ff4d6d':'#fff'}">${CW.VALS[c.v]}<br><span style="font-size:1.8em">${c.s}</span></div><div style="color:${p.color};font-size:.75rem;font-weight:900;margin-top:6px">${p.emoji} ${p.name}</div>`;area.appendChild(d);});
  const mx=Math.max(...cards.map(c=>c.v)),ws=cards.map((c,i)=>c.v===mx?i:-1).filter(i=>i>=0);
  ws.forEach(wi=>{CW.scores[State.players[wi].name]++;updateScoreChip(State.players[wi].name,CW.scores[State.players[wi].name]);});
  const res=document.getElementById('cw-res');
  if(res)res.textContent=ws.length>1?`⚔️ TIE! ${ws.map(i=>State.players[i].name).join(' & ')}`:`${State.players[ws[0]].emoji} ${State.players[ws[0]].name} wins with ${CW.VALS[cards[ws[0]].v]}!`;
  playSound(ws.length>1?'draw':'win'); CW.round++;
  if(CW.round>CW.rounds){setTimeout(()=>{const s=Object.entries(CW.scores).sort((a,b)=>b[1]-a[1]);showResult(CW.scores,s[0][0],s.length>1&&s[0][1]===s[1][1]);},1200);return;}
  const rl=document.getElementById('cw-round');if(rl)rl.textContent=`Round ${CW.round}/${CW.rounds}`;
}
