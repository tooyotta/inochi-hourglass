const glass=document.getElementById('glassButton'), stage=glass.parentElement, canvas=document.getElementById('particles'), ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let phase=0,last=0,frame=0;
const lower=new Path2D('M512 778C480 833 401 865 312 935C205 1019 142 1126 146 1238C149 1324 189 1393 278 1410Q512 1440 746 1410C835 1393 875 1324 878 1238C882 1126 819 1019 712 935C623 865 544 833 512 778Z');
const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
// Small clumps leave the neck at different rates. Evaluate the rate at
// release time so dense sections travel down the stream with the grains.
function flowAt(seconds) {
  const surge = Math.pow(0.5 + 0.5 * Math.sin(seconds * 6.7), 3);
  const variation = 0.5 + 0.5 * Math.sin(seconds * 13.1 + 1.4);
  return 0.28 + 0.5 * surge + 0.22 * variation;
}

const fallingGrains = Array.from({ length: 240 }, (_, i) => ({
  offset: random(i),
  speed: 0.9 + random(i + 8) * 0.4,
  scatter: random(i + 99) - 0.5,
  size: 0.65 + random(i + 3) * 1.2,
  density: random(i + 701),
  facet: random(i + 800) * Math.PI * 2,
  color: i % 3 === 0 ? '#d9a383' : '#aa7058',
}));

const surfaceFacets = Array.from({ length: 220 }, (_, i) => ({
  x: 160 + random(i + 2100) * 704,
  y: i < 110 ? 295 + random(i + 3100) * 465 : 1160 + random(i + 3100) * 264,
  normal: random(i + 4200) * Math.PI * 2,
  size: 1 + random(i + 5200) * 1.6,
}));

function drawSurfaceGlints(path, chamber) {
  const outline = path.getAttribute('d');
  if (!outline) return;
  ctx.save();
  ctx.clip(chamber);
  ctx.clip(new Path2D(outline));
  ctx.fillStyle = '#ffe0be';
  // Like BYOBU's foil facets, a grain flashes only near the reflection angle.
  for (const grain of surfaceFacets) {
    const alignment = Math.cos(grain.normal + phase * 2.3 + grain.x * 0.008);
    if (alignment < 0.989) continue;
    ctx.globalAlpha = Math.pow((alignment - 0.989) / 0.011, 2) * 0.9;
    ctx.fillRect(grain.x, grain.y, grain.size, grain.size * 0.72);
  }
  ctx.restore();
}

const upper = new Path2D(document.querySelector('#upper path').getAttribute('d'));
const upperSurface = document.getElementById('surface');
const bottomPile = document.getElementById('bottomSand');

function draw(now) {
  frame = 0;
  const active = glass.dataset.active === 'true' && !document.hidden;
  if (active && last) phase += Math.min((now - last) / 1000, 0.05);
  last = active ? now : 0;
  ctx.clearRect(0, 0, 1024, 1536);
  if (!active) return;

  const landing = Number(glass.dataset.landing) || 1420;
  const fall = landing - 773;
  const flow = flowAt(phase);
  ctx.save();
  ctx.clip(lower);

  const core = ctx.createLinearGradient(512, 773, 512, landing);
  core.addColorStop(0, '#b87e6378');
  core.addColorStop(1, '#a5745528');
  ctx.globalAlpha = 0.35 + flow * 0.55;
  ctx.fillStyle = core;
  ctx.fillRect(512 - flow * 1.5, 773, 1.5 + flow * 2.5, fall);

  for (const grain of fallingGrains) {
    const age = (phase * grain.speed + grain.offset) % 1;
    const packetFlow = flowAt(phase - age / grain.speed);
    if (grain.density > packetFlow) continue;
    const y = 773 + age * age * fall;
    const x = 512 + grain.scatter * (2 + age * (5 + packetFlow * 4));
    const alignment = Math.cos(grain.facet + age * 15 + phase * 3);
    const glint = alignment > 0.992;
    ctx.globalAlpha = glint ? 0.96 : 0.4 + packetFlow * 0.4;
    ctx.fillStyle = glint ? '#ffe3c2' : grain.color;
    const size = grain.size * (glint ? 1.45 : 1);
    ctx.fillRect(x, y, size, size * (1 + age * 0.9));
  }

  for (let i = 0; i < 34; i++) {
    const age = (phase * 1.7 + random(i + 400)) % 1;
    if (random(i + 900) > flowAt(phase - age / 1.7 - 0.7)) continue;
    const reach = 8 + random(i + 300) * 35;
    const x = 512 + (i % 2 ? 1 : -1) * reach * age;
    const y = landing - 18 * Math.sin(age * Math.PI) + age * reach * 0.42;
    ctx.globalAlpha = (1 - age) * 0.65;
    ctx.fillStyle = '#c28b70';
    ctx.fillRect(x, y, 1.1, 1.1);
  }

  ctx.restore();
  drawSurfaceGlints(upperSurface, upper);
  drawSurfaceGlints(bottomPile, lower);
  if (!reduced.matches) frame = requestAnimationFrame(draw);
}
function sync(){if(frame)cancelAnimationFrame(frame);frame=0;draw(performance.now())}
new MutationObserver(sync).observe(glass,{attributes:true,attributeFilter:['data-active','data-landing']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
// Object-only zoom: surrounding controls remain readable and usable.
let scale=1,tx=0,ty=0,gesture=false,initialDistance=0,initialScale=1;const points=new Map();
function apply(){const box=stage.getBoundingClientRect();const maxX=box.width*(scale-1)/2,maxY=(box.width*1.5)*(scale-1)/2;tx=Math.max(-maxX,Math.min(maxX,tx));ty=Math.max(-maxY,Math.min(maxY,ty));glass.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;window.hourglassGestureActive=gesture||scale>1;}
function zoom(next){scale=Math.max(1,Math.min(3,next));if(scale===1){tx=0;ty=0}apply()}
const distance=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
stage.addEventListener('pointerdown',e=>{if(!e.target.closest(".glass"))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(scale>1)stage.setPointerCapture(e.pointerId);if(points.size===2){for(const id of points.keys())stage.setPointerCapture(id);gesture=true;initialDistance=distance();initialScale=scale;apply()}});
stage.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;const old=points.get(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){gesture=true;zoom(initialScale*distance()/Math.max(1,initialDistance))}else if(scale>1){gesture=true;tx+=e.clientX-old.x;ty+=e.clientY-old.y;apply()}});
function release(e){points.delete(e.pointerId);if(points.size<2)initialDistance=0;setTimeout(()=>{if(points.size===0){gesture=false;apply()}},100)}stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',e=>points.delete(e.pointerId));
glass.addEventListener('dblclick',()=>{if(scale>1)zoom(1)});
stage.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoom(scale*Math.exp(-e.deltaY*.008))}},{passive:false});apply();
