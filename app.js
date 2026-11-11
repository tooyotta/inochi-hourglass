const $ = id => document.getElementById(id);
let saved={};try{saved=JSON.parse(localStorage.getItem('inochi-settings-v2')||'{}')||{}}catch{}
const valid=n=>Number.isInteger(n)&&n>=1&&n<=990;
let minutes=valid(saved.minutes)?saved.minutes:990, remaining=minutes*60000, deadline=0, mode='ready', audio;
$('minutes').value=minutes;$('purpose').value=typeof saved.purpose==='string'?saved.purpose.slice(0,60):'';$('sound').checked=saved.sound===true;
function save(){try{localStorage.setItem('inochi-settings-v2',JSON.stringify({minutes,purpose:$('purpose').value,sound:$('sound').checked}))}catch{}}
function current(){return mode==='running'?Math.max(0,deadline-Date.now()):remaining}
function renderSand(ratio) {
  const level = 757 - Math.sqrt(ratio) * 410;
  // The visible surface narrows as it approaches the neck of the glass.
  const radius = 350 * Math.pow(Math.max(0, (757 - level) / 410), 0.83);
  const depth = radius * 0.16;
  const left = 512 - radius;
  const right = 512 + radius;
  const front = `C${left} ${level + depth} ${right} ${level + depth} ${right} ${level}`;

  $('topSand').setAttribute('d', ratio > 0
    ? `M${left} ${level}${front}L900 760H124Z` : '');
  $('surface').setAttribute('d', ratio > 0
    ? `M${left} ${level}${front}C${right} ${level - depth} ${left} ${level - depth} ${left} ${level}Z` : '');

  const elapsed = 1 - ratio;
  const pileSize = Math.cbrt(elapsed);
  const peak = 1424 - pileSize * 237;
  const spread = 355 * pileSize;
  const foot = 1424 - pileSize * 27;
  const base = 1424 + pileSize * 51;
  $('bottomSand').setAttribute('d', elapsed > 0
    ? `M${512 - spread} ${foot}C${512 - spread * .58} ${foot - 42 * pileSize} ${512 - spread * .24} ${peak} 512 ${peak}C${512 + spread * .25} ${peak} ${512 + spread * .64} ${foot - 43 * pileSize} ${512 + spread} ${foot}Q512 ${base} ${512 - spread} ${foot}Z` : '');
  $('glassButton').dataset.landing = String(Math.min(1420, peak + 4));
}

function render(){const left=current(), seconds=Math.ceil(left/1000), ratio=left/(minutes*60000);$('time').innerHTML=`${String(Math.floor(seconds/60)).padStart(2,'0')}<span>:</span>${String(seconds%60).padStart(2,'0')}`;$('time').setAttribute('aria-label',`残り${Math.floor(seconds/60)}分${seconds%60}秒`);
renderSand(ratio);
$('glassButton').dataset.active=String(mode==='running');
$('state').textContent={ready:'準備ができました',running:'大切な時間が、流れています',paused:'ひと休みしています',done:'おつかれさまでした'}[mode];document.body.classList.toggle('running',mode==='running');$('start').innerHTML=mode==='running'?'Ⅱ <span>一時停止</span>':mode==='paused'?'▶ <span>つづける</span>':mode==='done'?'↻ <span>もう一度</span>':'▶ <span>はじめる</span>';
const purpose=$('purpose').value.trim();$('sessionLabel').textContent=mode==='done'?`${minutes}分を、${purpose||'大切なこと'}に捧げました。`:purpose?`${purpose}のための、${minutes}分。`:'';
for(const el of document.querySelectorAll('[data-min]')){const active=Number(el.dataset.min)===minutes;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));el.disabled=mode==='running'||mode==='paused'}$('minutes').disabled=mode==='running'||mode==='paused';$('special').disabled=mode==='running'||mode==='paused';}
function choose(n){if(!valid(n)){$('validation').textContent='1〜990の整数で入力してください。';return false}minutes=n;remaining=n*60000;mode='ready';$('minutes').value=n;$('validation').textContent='';save();render();return true}
function unlockAudio(){if(!$('sound').checked)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume()}catch{}}
function chime(){if(!$('sound').checked||!audio)return;try{[523.25,659.25,783.99].forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.2;o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+1.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+1.3)})}catch{}}
function toggle(){if(mode==='running'){remaining=current();mode=remaining>0?'paused':'done'}else{if(mode==='ready'&&!choose(Number($('minutes').value)))return;if(mode==='done')remaining=minutes*60000;unlockAudio();deadline=Date.now()+remaining;mode='running'}render()}
$('start').onclick=toggle;$('glassButton').onclick=()=>{if(!window.hourglassGestureActive)toggle()};$('reset').onclick=()=>{remaining=minutes*60000;mode='ready';render()};$('presets').onclick=e=>{const el=e.target.closest('[data-min]');if(el&&!el.disabled)choose(Number(el.dataset.min))};$('minutes').onchange=()=>choose(Number($('minutes').value));$('special').onclick=()=>choose(990);$('purpose').oninput=()=>{save();render()};$('sound').onchange=()=>{save();unlockAudio()};$('aboutOpen').onclick=()=>$('about').showModal();$('aboutClose').onclick=()=>$('about').close();$('about').onclick=e=>{if(e.target===$('about')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}};
function tick(){if(mode==='running'&&current()===0){remaining=0;mode='done';chime();$('announcement').textContent='設定した時間が終了しました。おつかれさまでした。'}render()}
setInterval(tick,250);document.addEventListener('visibilitychange',tick);render();
