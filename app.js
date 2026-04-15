const items = [
  { n:"Plastic bottle", c:"recycle", s:"images/recycle/plastic-bottle.png" },
{ n:"Glass bottle", c:"recycle", s:"images/recycling-centre/glass-bottle.png" },
  { n:"Tin can", c:"recycle", s:"images/recycle/tin-can.png" },
  { n:"Cardboard box", c:"recycle", s:"images/recycle/cardboard-box.png" },
  { n:"Newspaper", c:"recycle", s:"images/recycle/newspaper.png" },
  { n:"Yoghurt pot", c:"recycle", s:"images/recycle/yoghurt-pot.png" },
  // NEW ITEMS

{ n:"Shampoo bottle", c:"recycle", s:"images/recycle/shampoo-bottle.png" },
{ n:"Cereal box", c:"recycle", s:"images/recycle/cereal-box.png" },
{ n:"Foil tray", c:"recycle", s:"images/recycle/foil-tray.png" },

{ n:"Small branches", c:"garden", s:"images/garden-waste/small-branches.png" },
{ n:"Dead houseplant", c:"garden", s:"images/garden-waste/dead-houseplant.png" },

{ n:"Broken mug", c:"general", s:"images/general-waste/broken-mug.png" },

{ n:"Kettle", c:"centre", s:"images/recycling-centre/kettle.png" },
{ n:"Extension leads", c:"centre", s:"images/recycling-centre/extension-leads.png" },
  { n:"Takeaway bag", c:"recycle", s:"images/recycle/takeaway-bag.png" },
  { n:"Fizzy bottle", c:"recycle", s:"images/recycle/fizzy-bottle.png" },
  { n:"Burger box", c:"recycle", s:"images/recycle/burger-box.png" },
  { n:"Fizzy can", c:"recycle", s:"images/recycle/fizzy-can.png" },
  { n:"Grass", c:"garden", s:"images/garden-waste/grass.png" },
  { n:"Leaves", c:"garden", s:"images/garden-waste/leaves.png" },
  { n:"Twigs", c:"garden", s:"images/garden-waste/twigs.png" },
  { n:"Flowers", c:"garden", s:"images/garden-waste/flowers.png" },
  { n:"Crisp packet", c:"general", s:"images/general-waste/crisp-packet.png" },
  { n:"Dirty pizza box", c:"general", s:"images/general-waste/dirty-pizza-box.png" },
  { n:"Food waste", c:"general", s:"images/general-waste/food-waste.png" },
  { n:"Broken ceramic", c:"general", s:"images/general-waste/broken-ceramic.png" },
  { n:"Plastic film", c:"general", s:"images/general-waste/plastic-film.png" },
  { n:"Old bread", c:"general", s:"images/general-waste/old-bread.png" },
  { n:"T-shirt", c:"centre", s:"images/recycling-centre/tshirt.png" },
  { n:"Jeans", c:"centre", s:"images/recycling-centre/jeans.png" },
  { n:"Battery", c:"centre", s:"images/recycling-centre/battery.png" },
  { n:"Phone", c:"centre", s:"images/recycling-centre/phone.png" },
  { n:"Toaster", c:"centre", s:"images/recycling-centre/toaster.png" },
  { n:"Lightbulb", c:"centre", s:"images/recycling-centre/lightbulb.png" }
  
];
const rotateOverlay=document.getElementById('rotateOverlay');
const startScreen=document.getElementById('startScreen');
const startGameBtn=document.getElementById('startGameBtn');
const itemEl=document.getElementById('currentItem');
const shadowEl=document.getElementById('itemShadow');
const nextEl=document.getElementById('nextItemPreview');
const scoreEl=document.getElementById('score');
const timerEl=document.getElementById('timer');
const counterEl=document.getElementById('counter');
const streakEl=document.getElementById('streak');
const streakPill=document.getElementById('streakPill');
const feedbackEl=document.getElementById('feedback');
const restartBtn=document.getElementById('restartBtn');
const playAgainBtn=document.getElementById('playAgainBtn');
const retroOverlay=document.getElementById('retroOverlay');
const retroText=document.getElementById('retroText');
const retroSubtext=document.getElementById('retroSubtext');
const gameOverPanel=document.getElementById('gameOverPanel');
const finalLevel=document.getElementById('finalLevel');
const finalScore=document.getElementById('finalScore');
const game=document.getElementById('game');
const dragLine=document.getElementById('dragLine');
const bgEl=document.getElementById('bg');

const bins={
  recycle:document.querySelector('.binWrap[data-key="recycle"]'),
  garden:document.querySelector('.binWrap[data-key="garden"]'),
  general:document.querySelector('.binWrap[data-key="general"]'),
  centre:document.querySelector('.binWrap[data-key="centre"]')
};
const hints={
  recycle:document.getElementById('hint-recycle'),
  garden:document.getElementById('hint-garden'),
  general:document.getElementById('hint-general'),
  centre:document.getElementById('hint-centre')
};

const backgrounds=[
  { score:0, file:'images/kitchen-background.png' },
  { score:500, file:'images/kitchen-background-2.png' },
  { score:1000, file:'images/kitchen-background-3.png' },
  { score:1500, file:'images/kitchen-background-4.png' },
  { score:2000, file:'images/kitchen-background-5.png' }
];

let order=[],idx=0,current=null,score=0,streak=0,correctCount=0,level=1,timeLeft=60,timerId=null,dragging=false,dragStart=null,animating=false,ended=false,lastRelease=null,levelPerfect=true,panicMode=false,currentBackgroundIndex=0,pendingBackgroundIndex=0,started=false,lastMultiplier=1;

const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const levelGoal=l=>l*5;
function isTouchDevice(){
  return ('ontouchstart' in window) || navigator.maxTouchPoints>0;
}

function isPortraitMobile(){
  return isTouchDevice() && window.innerHeight>window.innerWidth;
}

function updateOrientationGate(){
  const portraitBlocked=isPortraitMobile();

  if(rotateOverlay){
    if(portraitBlocked) rotateOverlay.classList.remove('hidden');
    else rotateOverlay.classList.add('hidden');
  }

  if(startScreen){
    if(portraitBlocked) startScreen.classList.add('hidden');
    else if(!started) startScreen.classList.remove('hidden');
  }

  return portraitBlocked;
}
function getMultiplier(){
  if(streak>=30) return 5;
  if(streak>=20) return 4;
  if(streak>=10) return 3;
  if(streak>=5) return 2;
  return 1;
}

function flashMultiplierUp(multiplier){
  streakPill.classList.remove('multiplier-pop');
  void streakPill.offsetWidth;
  streakPill.classList.add('multiplier-pop');
  showRetro(`x${multiplier} STREAK!`,'MULTIPLIER UP');
}
function fallback(img,label){
  img.onerror=()=>{const svg=encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"><rect width="220" height="220" rx="22" fill="#d1d5db"/><text x="110" y="110" font-size="18" font-family="Arial" text-anchor="middle" fill="#111827">${label}</text></svg>`);img.src=`data:image/svg+xml;charset=utf-8,${svg}`;}
}
function pop(el){el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}
function hud(){
  const multiplier=getMultiplier();
  scoreEl.textContent=score;
  timerEl.textContent=timeLeft;
  counterEl.textContent=`${Math.min(correctCount+1, levelGoal(level))}/${levelGoal(level)}`;
  streakEl.textContent=streak;

  const streakBadge=document.getElementById('streakBadge');
  if(streakBadge) streakBadge.textContent=`x${multiplier}`;

  pop(scoreEl);

  if(multiplier>1) streakPill.classList.add('streak-active');
  else streakPill.classList.remove('streak-active');
}
function message(text,good){
  feedbackEl.textContent=text;
  feedbackEl.style.background=good?'rgba(22,163,74,.9)':'rgba(220,38,38,.9)';
  feedbackEl.classList.add('show');
  setTimeout(()=>feedbackEl.classList.remove('show'),850);
}
function showRetro(main,sub=''){
  retroText.textContent=main;
  retroSubtext.textContent=sub;
  retroOverlay.classList.remove('show');
  void retroOverlay.offsetWidth;
  retroOverlay.classList.add('show');
}
function showPerfectFlash(){
  const oldMainColor=retroText.style.color;
  const oldSubColor=retroSubtext.style.color;
  const oldMainShadow=retroText.style.textShadow;
  const oldSubShadow=retroSubtext.style.textShadow;

  retroText.style.color='#ffd700';
  retroSubtext.style.color='#fff1a8';
  retroText.style.textShadow='0 0 14px rgba(255,215,0,.9),0 4px 0 #7a5600,0 8px 18px rgba(0,0,0,.45)';
  retroSubtext.style.textShadow='0 0 10px rgba(255,215,0,.65),0 3px 0 #7a5600,0 6px 14px rgba(0,0,0,.4)';

  showRetro('PERFECT!','+50 BONUS');

  setTimeout(()=>{
    retroText.style.color=oldMainColor;
    retroSubtext.style.color=oldSubColor;
    retroText.style.textShadow=oldMainShadow;
    retroSubtext.style.textShadow=oldSubShadow;
  },1200);
}
function tone(freq,duration,type='sine',volume=.03){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator();
    const g=ctx.createGain();
    o.type=type;
    o.frequency.value=freq;
    g.gain.value=volume;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime+duration/1000);
  }catch(e){}
}
const sfxGood=()=>{tone(580,90,'triangle',.04);setTimeout(()=>tone(860,120,'triangle',.03),70)};
const sfxBad=()=>tone(220,120,'square',.03);
const sfxBounce=()=>tone(180,80,'sawtooth',.02);
const sfxLevel=()=>{tone(520,80,'square',.03);setTimeout(()=>tone(660,80,'square',.03),90);setTimeout(()=>tone(840,110,'square',.03),180)};
const sfxPanicTick=()=>{tone(980,70,'square',.035);setTimeout(()=>tone(1280,50,'square',.025),55)};
const sfxCheer=()=>{
  tone(520,180,'triangle',.035);
  setTimeout(()=>tone(660,180,'triangle',.03),60);
  setTimeout(()=>tone(780,220,'triangle',.028),120);
  setTimeout(()=>tone(920,260,'triangle',.024),170);
  setTimeout(()=>tone(660,320,'sawtooth',.018),90);
  setTimeout(()=>tone(740,320,'sawtooth',.014),150);
};

function clearHighlights(){Object.values(hints).forEach(e=>e.classList.remove('correct','wrong'))}
function highlight(key,cls){clearHighlights();if(hints[key]) hints[key].classList.add(cls);setTimeout(clearHighlights,500)}
function openingCenter(key){const r=bins[key].getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.13}}
function targetAt(x,y){
  let found=null;
  Object.entries(bins).forEach(([k,w])=>{
    const r=w.getBoundingClientRect(),l=r.left+r.width*.06,rr=r.right-r.width*.06,t=r.top,b=r.top+r.height*.28;
    if(x>=l&&x<=rr&&y>=t&&y<=b) found=k;
  });
  return found;
}
function resetPos(){
  itemEl.style.left='50%';
  itemEl.style.bottom=window.innerWidth<700?'22vh':'9.5vh';
  itemEl.style.top='auto';
  itemEl.style.transform='translateX(-50%)';
  itemEl.style.opacity='1';

  shadowEl.style.left='50%';
  shadowEl.style.bottom=window.innerWidth<700?'20vh':'8vh';
  shadowEl.style.width='';
  shadowEl.style.opacity='1';
}
function setItem(){
  current=order[idx];
  if(!current){
    order=shuffle(items); idx=0; current=order[idx];
  }
  itemEl.style.display='block';
  shadowEl.style.display='block';
  itemEl.src=current.s; fallback(itemEl,current.n);
  const next=order[(idx+1)%order.length];
  nextEl.style.display='block';
  nextEl.src=next.s; fallback(nextEl,next.n);
  resetPos();
  hud();
}
function nextItem(){idx+=1;setItem()}
function points(){
  return 10*getMultiplier();
}

function applyBackground(index){
  currentBackgroundIndex=index;
  if(bgEl){
    bgEl.style.background=`url('${backgrounds[index].file}') center/cover no-repeat`;
  }
}

function getUnlockedBackgroundIndex(){
  let unlocked=0;
  for(let i=0;i<backgrounds.length;i++){
    if(score>=backgrounds[i].score) unlocked=i;
  }
  return unlocked;
}

function updatePendingBackgroundUnlock(){
  const unlocked=getUnlockedBackgroundIndex();
  if(unlocked>pendingBackgroundIndex){
    pendingBackgroundIndex=unlocked;
    message('New background unlocked!',true);
  }
}

function applyPendingBackgroundIfNeeded(){
  if(pendingBackgroundIndex>currentBackgroundIndex){
    applyBackground(pendingBackgroundIndex);
    showRetro(`LEVEL ${level}`,`NEW BACKGROUND!`);
  }
}

function setPanicMode(active){
  panicMode=active;
  if(!active){
    game.style.transition='transform .12s ease, filter .12s ease';
    game.style.transform='';
    game.style.filter='';
    feedbackEl.style.boxShadow='';
    return;
  }
  game.style.transition='transform .08s ease, filter .08s ease';
}

function panicPulse(){
  if(!panicMode || ended) return;
  game.style.transform='scale(1.008)';
  game.style.filter='saturate(1.15) brightness(1.04) hue-rotate(-8deg)';
  setTimeout(()=>{
    if(!panicMode || ended) return;
    game.style.transform='';
    game.style.filter='saturate(1) brightness(1)';
  },90);
}

function restartLevelTimer(){
  if(timerId) clearInterval(timerId);
  timeLeft=60;
  setPanicMode(false);
  hud();
  timerId=setInterval(()=>{
    timeLeft-=1;
    if(timeLeft<=5 && timeLeft>0){
      if(!panicMode) setPanicMode(true);
      sfxPanicTick();
      panicPulse();
    }
    if(timeLeft>5 && panicMode){
      setPanicMode(false);
    }
    hud();
    if(timeLeft<=0) endGame();
  },1000);
}

function levelCheck(){
  if(correctCount>=levelGoal(level)){
    const completedLevel=level;
    const wasPerfect=levelPerfect;

    if(wasPerfect){
      score+=50;
      hud();
      updatePendingBackgroundUnlock();
    }

    level+=1;
    correctCount=0;
    levelPerfect=true;
    setPanicMode(false);
    applyPendingBackgroundIfNeeded();
    sfxLevel();
    showRetro(`LEVEL ${completedLevel} COMPLETE!`,`LEVEL ${level} · GET ${levelGoal(level)} ITEMS`);

    if(wasPerfect){
      setTimeout(()=>{
        sfxCheer();
        showPerfectFlash();
      },1250);
    }

    restartLevelTimer();
  }
}

function endGame(){
  ended=true;
  animating=true;
  dragging=false;
  setPanicMode(false);
  if(timerId) clearInterval(timerId);
  timerId=null;
  showRetro('GAME OVER',`LEVEL ${level}`);
  finalLevel.textContent=`LEVEL ${level}`;
  finalScore.textContent=`SCORE ${score}`;
  gameOverPanel.classList.remove('hidden');
}

function getReleaseMissTarget(sx, sy){
  const gr=game.getBoundingClientRect();
  if(!lastRelease){
    return {x:sx, y:gr.height-80};
  }
  const dx=lastRelease.x-dragStart.x;
  const dy=lastRelease.y-dragStart.y;
  const power=Math.min(Math.max(Math.hypot(dx,dy),140),420);
  const nx=dx===0&&dy===0?0:dx/Math.hypot(dx,dy);
  const ny=dx===0&&dy===0?-1:dy/Math.hypot(dx,dy);
  const tx=Math.min(gr.width-40,Math.max(40,sx+nx*power));
  const ty=Math.min(gr.height-70,Math.max(80,sy+ny*power*.9));
  return {x:tx,y:ty};
}

function animateShot(targetKey){
  animating=true;
  const gr=game.getBoundingClientRect();
  const ir=itemEl.getBoundingClientRect();
  const sx=ir.left+ir.width/2;
  const sy=ir.top+ir.height/2;
  const missTarget=getReleaseMissTarget(sx,sy);
  const tp=targetKey?openingCenter(targetKey):missTarget;
  const correct=targetKey&&targetKey===current.c;
  const duration=680;
  const arc=Math.max(110,Math.abs(tp.x-sx)*.22);
  const t0=performance.now();
  itemEl.style.bottom='auto';

  function setFlightVisual(x,y,scale=1){
    itemEl.style.left=`${x}px`;
    itemEl.style.top=`${y}px`;
    itemEl.style.transform=`translate(-50%,-50%) scale(${scale})`;
  }

  function setShadowVisual(x,y,lift=0){
    const baseBottom=Math.max(8,gr.bottom-y-(ir.height*.35));
    shadowEl.style.left=`${x}px`;
    shadowEl.style.bottom=`${baseBottom}px`;
    shadowEl.style.width=`${Math.max(42,96-lift*22)}px`;
    shadowEl.style.opacity=`${Math.max(.16,.42-lift*.18)}`;
  }

  function finishToNext(delay=220){
    itemEl.style.opacity='0';
    shadowEl.style.opacity='0';
    setTimeout(()=>{
      animating=false;
      nextItem();
    },delay);
  }

  function frame(now){
    const t=Math.min((now-t0)/duration,1);
    const x=sx+(tp.x-sx)*t;
    const by=sy+(tp.y-sy)*t;
    const y=by-Math.sin(Math.PI*t)*arc;
    const sc=1-.15*t;
    const lift=Math.sin(Math.PI*t);

    setFlightVisual(x,y,sc);
    setShadowVisual(x,by,lift);

    if(t<1){
      requestAnimationFrame(frame);
      return;
    }

    if(!targetKey){
      levelPerfect=false;
      sfxBounce();
      streak=0;
      hud();
      message('Miss',false);
      setTimeout(()=>{
        animating=false;
        resetPos();
      },280);
      return;
    }

    if(correct){
      highlight(targetKey,'correct');
      sfxGood();

      const oldMultiplier=getMultiplier();
      streak+=1;
      const newMultiplier=getMultiplier();

      score+=points();
      correctCount+=1;
      hud();
      updatePendingBackgroundUnlock();

      if(newMultiplier>oldMultiplier){
        flashMultiplierUp(newMultiplier);
        message(`x${newMultiplier} multiplier!`,true);
      } else {
        message('Nice!',true);
      }

      lastMultiplier=newMultiplier;
      levelCheck();

      itemEl.style.opacity='0';
      shadowEl.style.opacity='0';
      setTimeout(()=>{
        animating=false;
        nextItem();
      },260);
      return;
    }

    levelPerfect=false;
    highlight(targetKey,'wrong');
    sfxBad();
    streak=0;
    hud();
    message('Wrong bin',false);

    const floorY=gr.bottom-(window.innerWidth<700?78:92);
    const sidePadding=window.innerWidth<700?42:56;
    const bounceDir=(tp.x<gr.left+gr.width/2)?1:-1;
    const bounceX=Math.max(gr.left+sidePadding,Math.min(gr.right-sidePadding,tp.x+(bounceDir*(window.innerWidth<700?110:150))));
    const bounceY=Math.min(floorY-110,tp.y+(window.innerWidth<700?85:110));
    const landX=Math.max(gr.left+sidePadding,Math.min(gr.right-sidePadding,bounceX+(bounceDir*(window.innerWidth<700?70:95))));
    const landY=floorY;

    const bounceStart=performance.now();
    const bounceDuration=230;
    const fallDuration=340;

    function bouncePhase(now2){
      const bt=Math.min((now2-bounceStart)/bounceDuration,1);
      const bx=tp.x+(bounceX-tp.x)*bt;
      const by=tp.y+(bounceY-tp.y)*bt-Math.sin(Math.PI*bt)*(window.innerWidth<700?24:32);
      const scale=.88+.05*(1-bt);

      setFlightVisual(bx,by,scale);
      setShadowVisual(bx,by,.22);

      if(bt<1){
        requestAnimationFrame(bouncePhase);
        return;
      }

      sfxBounce();
      const fallStart=performance.now();

      function fallPhase(now3){
        const ft=Math.min((now3-fallStart)/fallDuration,1);
        const fx=bounceX+(landX-bounceX)*ft;
        const fy=bounceY+(landY-bounceY)*(ft*ft);
        const scale=.92-.08*ft;

        setFlightVisual(fx,fy,scale);
        shadowEl.style.left=`${fx}px`;
        shadowEl.style.bottom=`${Math.max(10,gr.bottom-landY-(ir.height*.35))}px`;
        shadowEl.style.width=`${Math.max(46,98-ft*10)}px`;
        shadowEl.style.opacity=`${Math.max(.18,.34+.12*ft)}`;

        if(ft<1){
          requestAnimationFrame(fallPhase);
          return;
        }

        sfxBounce();
        finishToNext(180);
      }

      requestAnimationFrame(fallPhase);
    }

    requestAnimationFrame(bouncePhase);
  }

  requestAnimationFrame(frame);
}

function startDrag(x,y){
  if(!started||ended||animating||!current||timeLeft<=0) return;
  dragging=true;
  dragStart={x,y};
  lastRelease={x,y};
  itemEl.classList.add('dragging');
  dragLine.style.display='block';
  dragLine.style.left=`${x}px`;
  dragLine.style.top=`${y}px`;
  dragLine.style.width='0px';
}

function moveDrag(x,y){
  if(!dragging) return;
  lastRelease={x,y};
  const dx=x-dragStart.x, dy=y-dragStart.y, len=Math.hypot(dx,dy), a=Math.atan2(dy,dx)*180/Math.PI;
  dragLine.style.width=`${len}px`;
  dragLine.style.transform=`rotate(${a}deg)`;
}

function endDrag(x,y){
  if(!dragging) return;
  lastRelease={x,y};
  dragging=false;
  itemEl.classList.remove('dragging');
  dragLine.style.display='none';
  animateShot(targetAt(x,y));
}
function showStartScreen(){
  started=false;
  if(timerId) clearInterval(timerId);
  timerId=null;
  setPanicMode(false);
  updateOrientationGate();
}

function beginGame(){
  if(updateOrientationGate()) return;
  started=true;
  if(startScreen) startScreen.classList.add('hidden');
  showRetro('LEVEL 1','GET 5 ITEMS');
  restartLevelTimer();
}
itemEl.addEventListener('mousedown',e=>{e.preventDefault();startDrag(e.clientX,e.clientY)});
window.addEventListener('mousemove',e=>moveDrag(e.clientX,e.clientY));
window.addEventListener('mouseup',e=>endDrag(e.clientX,e.clientY));
itemEl.addEventListener('touchstart',e=>{const t=e.touches[0];startDrag(t.clientX,t.clientY)},{passive:true});
window.addEventListener('touchmove',e=>{const t=e.touches[0]; if(t) moveDrag(t.clientX,t.clientY)},{passive:true});
window.addEventListener('touchend',e=>{const t=e.changedTouches[0]; if(t) endDrag(t.clientX,t.clientY)},{passive:true});
window.addEventListener('resize',updateOrientationGate);
window.addEventListener('orientationchange',updateOrientationGate);
startGameBtn.addEventListener('click',beginGame);
restartBtn.addEventListener('click',init);
playAgainBtn.addEventListener('click',init);

function init(){
  ended=false;
  started=false;
  score=0;
  streak=0;
  correctCount=0;
  level=1;
  idx=0;
  levelPerfect=true;
  currentBackgroundIndex=0;
  pendingBackgroundIndex=0;
  setPanicMode(false);
  applyBackground(0);
  order=shuffle(items);
  animating=false;
  clearHighlights();
  gameOverPanel.classList.add('hidden');
  setItem();
  hud();
  showStartScreen();
}

init();