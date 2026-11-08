const glass=document.getElementById('glassButton'), stage=glass.parentElement, canvas=document.getElementById('particles'), ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let phase=0,last=0,frame=0;
const lower=new Path2D('M512 778C480 833 401 865 312 935C205 1019 142 1126 146 1238C149 1324 189 1393 278 1410Q512 1440 746 1410C835 1393 875 1324 878 1238C882 1126 819 1019 712 935C623 865 544 833 512 778Z');
const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
function draw(now){frame=0;const active=glass.dataset.active==='true'&&!document.hidden;if(active&&last)phase+=Math.min((now-last)/1000,.05);last=now;ctx.clearRect(0,0,1024,1536);if(!active){last=0;return}const landing=Number(glass.dataset.landing)||1420,fall=landing-773;ctx.save();ctx.clip(lower);
// A translucent core is surrounded by hundreds of individually accelerating grains.
const core=ctx.createLinearGradient(512,773,512,landing);core.addColorStop(0,'#dfc27d70');core.addColorStop(.6,'#c6a56225');core.addColorStop(1,'#bca16a08');ctx.fillStyle=core;ctx.fillRect(510.7,773,2.6,fall);
for(let i=0;i<220;i++){const age=(phase*(.9+random(i+8)*.4)+random(i))%1, y=773+age*age*fall, spread=1+age*4, x=512+(random(i+99)-.5)*spread*2+Math.sin(phase*7+i)*.7;ctx.globalAlpha=.35+random(i+7)*.6;ctx.fillStyle=i%4===0?'#f4dea2':i%3===0?'#c9aa64':'#a68d51';const r=.6+random(i+3)*1.1;ctx.fillRect(x,y,r,r*(1+age*.7));}
// Impact grains arc outwards and settle into the mound.
for(let i=0;i<34;i++){const t=(phase*1.7+random(i+400))%1, side=i%2?1:-1, reach=8+random(i+300)*35;ctx.globalAlpha=(1-t)*.65;ctx.fillStyle='#d6ba79';const x=512+side*reach*t,y=landing-18*Math.sin(t*Math.PI)+t*reach*.42;ctx.fillRect(x,y,1.1,1.1)}ctx.restore();ctx.globalAlpha=1;if(!reduced.matches)frame=requestAnimationFrame(draw)}
function sync(){if(frame)cancelAnimationFrame(frame);frame=0;draw(performance.now())}
new MutationObserver(sync).observe(glass,{attributes:true,attributeFilter:['data-active','data-landing']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
// Object-only zoom: surrounding controls remain readable and usable.
let scale=1,tx=0,ty=0,gesture=false,initialDistance=0,initialScale=1,previous=null;const points=new Map();
const zoomLabel=document.getElementById('zoomReset');
function apply(){const box=stage.getBoundingClientRect();const maxX=box.width*(scale-1)/2,maxY=(box.width*1.5)*(scale-1)/2;tx=Math.max(-maxX,Math.min(maxX,tx));ty=Math.max(-maxY,Math.min(maxY,ty));glass.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;zoomLabel.textContent=`${Math.round(scale*100)}%`;document.getElementById('zoomOut').disabled=scale<=1;document.getElementById('zoomIn').disabled=scale>=3;window.hourglassGestureActive=gesture||scale>1;}
function zoom(next){scale=Math.max(1,Math.min(3,next));if(scale===1){tx=0;ty=0}apply()}
document.getElementById('zoomIn').onclick=()=>zoom(scale+.25);document.getElementById('zoomOut').onclick=()=>zoom(scale-.25);zoomLabel.onclick=()=>zoom(1);
const distance=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
stage.addEventListener('pointerdown',e=>{if(e.target.closest('.zoom-tools'))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(scale>1)stage.setPointerCapture(e.pointerId);previous={x:e.clientX,y:e.clientY};if(points.size===2){for(const id of points.keys())stage.setPointerCapture(id);gesture=true;initialDistance=distance();initialScale=scale;apply()}});
stage.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;const old=points.get(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size===2){gesture=true;zoom(initialScale*distance()/Math.max(1,initialDistance))}else if(scale>1){gesture=true;tx+=e.clientX-old.x;ty+=e.clientY-old.y;apply()}});
function release(e){points.delete(e.pointerId);previous=null;if(points.size<2)initialDistance=0;setTimeout(()=>{if(points.size===0){gesture=false;apply()}},100)}stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',e=>points.delete(e.pointerId));
stage.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoom(scale*Math.exp(-e.deltaY*.008))}},{passive:false});apply();
