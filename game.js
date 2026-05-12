const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x1a0a2e, 20, 60);

const W = window.innerWidth, H = window.innerHeight;
renderer.setSize(W, H);
const aspect = W/H;
const cam = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);

function updateCamera() {
    const currentW = window.innerWidth;
    const currentH = window.innerHeight;
    const currentAspect = currentW / currentH;
    cam.aspect = currentAspect;
    
    // Adjust Z based on aspect ratio to keep the game zone visible
    // 11.5 is the half-width of the spawn zone. We want to see at least that much.
    // In portrait, we need the camera further back.
    if (currentAspect < 1) {
        cam.position.z = Math.max(18, 12 / (currentAspect * Math.tan(cam.fov * Math.PI / 360)));
    } else {
        cam.position.z = 18;
    }
    cam.updateProjectionMatrix();
}
updateCamera();

const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambLight);
const dirLight = new THREE.DirectionalLight(0xfff0ff, 1.2);
dirLight.position.set(5, 10, 8);
dirLight.castShadow = true;
scene.add(dirLight);
const pinkLight = new THREE.PointLight(0xff6b9d, 1.5, 30);
pinkLight.position.set(-5, 5, 5);
scene.add(pinkLight);
const purpleLight = new THREE.PointLight(0x7c3aed, 1.2, 30);
purpleLight.position.set(5, -3, 5);
scene.add(purpleLight);

// Background stars
const starGeo = new THREE.BufferGeometry();
const starVerts = [];
for(let i=0;i<800;i++){
  starVerts.push((Math.random()-.5)*80,(Math.random()-.5)*80,-20-Math.random()*20);
}
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starVerts,3));
const starMat = new THREE.PointsMaterial({color:0xffffff,size:0.08,transparent:true,opacity:.8});
const stars = new THREE.Points(starGeo,starMat);
scene.add(stars);

// Floating bg orbs
const orbs = [];
const orbColors = [0xff6b9d,0x7c3aed,0x00cec9,0xffd700,0x5352ed];
for(let i=0;i<12;i++){
  const g = new THREE.SphereGeometry(.4+Math.random()*.6,10,10);
  const m = new THREE.MeshStandardMaterial({color:orbColors[i%5],transparent:true,opacity:.12,roughness:.3});
  const o = new THREE.Mesh(g,m);
  o.position.set((Math.random()-.5)*22,(Math.random()-.5)*14,-8-Math.random()*6);
  scene.add(o);
  orbs.push({mesh:o, speed:0.003+Math.random()*.006, offset:Math.random()*Math.PI*2});
}

// Ground platform
const groundGeo = new THREE.BoxGeometry(22,0.3,2);
const groundMat = new THREE.MeshStandardMaterial({color:0x2d1b69,roughness:.5,metalness:.3});
const ground = new THREE.Mesh(groundGeo,groundMat);
ground.position.set(0,-7.5,0);
ground.receiveShadow = true;
scene.add(ground);
const groundGlow = new THREE.PointLight(0xff6b9d,.8,8);
groundGlow.position.set(0,-7,1);
scene.add(groundGlow);

// Basket (player)
const basketGroup = new THREE.Group();
const bMat = new THREE.MeshStandardMaterial({color:0xff6b9d,roughness:.3,metalness:.4});
const bDark = new THREE.MeshStandardMaterial({color:0xc0446e,roughness:.4,metalness:.3});
const bBody = new THREE.Mesh(new THREE.BoxGeometry(3.2,0.7,1),bMat);
bBody.castShadow = true;
basketGroup.add(bBody);
const bRim = new THREE.Mesh(new THREE.BoxGeometry(3.6,0.18,1.1),bDark);
bRim.position.y = 0.4;
basketGroup.add(bRim);
for(let i=-1;i<=1;i++){
  const div = new THREE.Mesh(new THREE.BoxGeometry(0.12,0.7,1.05),bDark);
  div.position.x = i*1.1;
  basketGroup.add(div);
}
basketGroup.position.set(0,-6.8,0);
scene.add(basketGroup);

// Candy definitions
const CANDIES = [
  {pts:10,color:0xff4757,geo:()=>new THREE.SphereGeometry(.42,16,12)},
  {pts:15,color:0x2ed573,geo:()=>new THREE.BoxGeometry(.72,.72,.72)},
  {pts:20,color:0x5352ed,geo:()=>new THREE.ConeGeometry(.42,0.84,6)},
  {pts:25,color:0xff6348,geo:()=>new THREE.OctahedronGeometry(.5)},
  {pts:30,color:0xffc312,geo:()=>new THREE.TorusGeometry(.28,.14,10,16)},
];

// Particle pool
const particles = [];
function spawnParticles(pos,color,n=14){
  for(let i=0;i<n;i++){
    const g = new THREE.SphereGeometry(.1,6,6);
    const m = new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.6,transparent:true,opacity:1});
    const mesh = new THREE.Mesh(g,m);
    mesh.position.copy(pos);
    scene.add(mesh);
    const vx=(Math.random()-.5)*4, vy=1.5+Math.random()*3, vz=(Math.random()-.5)*2;
    gsap.to(mesh.position,{x:pos.x+vx,y:pos.y+vy,z:pos.z+vz,duration:.9,ease:'power2.out'});
    gsap.to(m,{opacity:0,duration:.9,ease:'power2.in',onComplete:()=>{scene.remove(mesh);}});
    gsap.to(mesh.scale,{x:.01,y:.01,z:.01,duration:.9,ease:'power2.in'});
  }
}

// Floating text popups
const popups3D = [];
function spawnPopup(pos, text, color){
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;font-family:'Comic Sans MS',cursive;font-size:22px;font-weight:bold;color:#${color.toString(16).padStart(6,'0')};text-shadow:0 0 8px #${color.toString(16).padStart(6,'0')};pointer-events:none;z-index:15;white-space:nowrap;`;
  div.textContent = text;
  document.body.appendChild(div);
  const vec = pos.clone().project(cam);
  const sx = (vec.x+1)/2*window.innerWidth, sy = (-vec.y+1)/2*window.innerHeight;
  div.style.left = sx+'px'; div.style.top = sy+'px';
  div.style.transform = 'translate(-50%,-50%) scale(0)';
  gsap.to(div,{opacity:1,y:-40,duration:.8,ease:'power2.out'});
  gsap.to(div.style,{transform:'translate(-50%,-50%) scale(1)',duration:.15});
  gsap.to(div,{opacity:0,duration:.4,delay:.55,onComplete:()=>div.remove()});
}

// Game state
let state='menu', score=0, highScore=0, lives=3, combo=0, maxCombo=0, multiplier=1;
let frameN=0, speed=1.0, spawnRate=90, powerupTimer=0, currentLevel=1;
let shieldActive=false, slowActive=false, doubleActive=false;
let items=[], basketX=0, targetX=0, comboTween=null;

function lerp(a,b,t){return a+(b-a)*t;}

// UI refs
const scoreVal=document.getElementById('score-val');
const bestVal=document.getElementById('best-val');
const comboText=document.getElementById('combo-text');
const multText=document.getElementById('mult-text');
const powerupBar=document.getElementById('powerup-bar');
const powerupLabel=document.getElementById('powerup-label');
const powerupFill=document.getElementById('powerup-fill');
const levelBadge=document.getElementById('level-badge');
const overlay=document.getElementById('overlay');
const startPanel=document.getElementById('start-panel');
const gameoverPanel=document.getElementById('gameover-panel');
const h=[document.getElementById('h1'),document.getElementById('h2'),document.getElementById('h3')];

function updateHearts(){
  h.forEach((el,i)=>{
    if(i>=lives){el.textContent='🖤';el.style.opacity='.3';}
    else{el.textContent='❤️';el.style.opacity='1';}
  });
}

function showCombo(){
  if(combo<2){gsap.to(comboText,{opacity:0,duration:.2});gsap.to(multText,{opacity:0,duration:.2});return;}
  const colors=['','','#2ed573','#5352ed','#ff6348','#ffc312','#ff4757'];
  const c=colors[Math.min(combo,6)]||'#ff4757';
  comboText.textContent=combo+'x COMBO!';
  comboText.style.color=c;
  comboText.style.textShadow=`0 0 18px ${c}`;
  multText.textContent='×'+multiplier+' POINTS';
  if(comboTween) comboTween.kill();
  gsap.to(comboText,{opacity:1,duration:.15});
  gsap.to(multText,{opacity:1,duration:.15});
  gsap.to(document.getElementById('combo-box'),{scale:1.18,duration:.12,yoyo:true,repeat:1,ease:'power2.out'});
}

function updatePowerupBar(){
  if(powerupTimer<=0){gsap.to(powerupBar,{opacity:0,duration:.3});return;}
  gsap.to(powerupBar,{opacity:1,duration:.2});
  const col=shieldActive?'#00cec9':doubleActive?'#ffd700':'#c084fc';
  const lbl=shieldActive?'🛡️ SHIELD':doubleActive?'⭐ 2X POINTS':'❄️ SLOW-MO';
  powerupLabel.textContent=lbl;
  powerupLabel.style.color=col;
  powerupFill.style.background=col;
  powerupFill.style.width=(powerupTimer/300*100)+'%';
}

function spawnItem(){
  const zone=11.5;
  const r=Math.random();
  if(r<0.05){
    const types=['shield','2x','slow'];
    const t=types[Math.floor(Math.random()*3)];
    const colors={shield:0x00cec9,'2x':0xffd700,slow:0xc084fc};
    const group=new THREE.Group();

    if(t==='shield'){
      // Cyan hexagonal shield disc + outer ring
      const disc=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.14,6),new THREE.MeshStandardMaterial({color:0x00cec9,emissive:0x00cec9,emissiveIntensity:.6,metalness:.6,roughness:.2}));
      disc.rotation.x=Math.PI/2;
      group.add(disc);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.76,.09,10,6),new THREE.MeshStandardMaterial({color:0x00ffee,emissive:0x00ffee,emissiveIntensity:.9,metalness:.5,roughness:.1}));
      group.add(ring);
      const inner=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.18,6),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x00cec9,emissiveIntensity:1,transparent:true,opacity:.85}));
      inner.rotation.x=Math.PI/2;
      group.add(inner);
    } else if(t==='2x'){
      // Gold star shape — two overlapping octahedrons rotated
      const mat2x=new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xff9900,emissiveIntensity:.7,metalness:.8,roughness:.1});
      const o1=new THREE.Mesh(new THREE.OctahedronGeometry(.58),mat2x);
      group.add(o1);
      const o2=new THREE.Mesh(new THREE.OctahedronGeometry(.58),mat2x);
      o2.rotation.y=Math.PI/4; o2.rotation.x=Math.PI/4;
      group.add(o2);
      const core=new THREE.Mesh(new THREE.SphereGeometry(.22,10,10),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffd700,emissiveIntensity:1.5}));
      group.add(core);
    } else {
      // Purple icosahedron (crystal/ice) + orbiting ring for slow-mo
      const icoMat=new THREE.MeshStandardMaterial({color:0xc084fc,emissive:0x7c3aed,emissiveIntensity:.7,transparent:true,opacity:.9,metalness:.2,roughness:.1,wireframe:false});
      const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(.58,0),icoMat);
      group.add(ico);
      const wireMat=new THREE.MeshStandardMaterial({color:0xe9d5ff,emissive:0xe9d5ff,emissiveIntensity:.5,wireframe:true,transparent:true,opacity:.6});
      const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(.63,0),wireMat);
      group.add(wire);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.8,.06,8,32),new THREE.MeshStandardMaterial({color:0xe9d5ff,emissive:0xc084fc,emissiveIntensity:.8}));
      ring.rotation.x=Math.PI/3;
      group.add(ring);
    }

    const light=new THREE.PointLight(colors[t],1.2,4);
    group.add(light);
    group.position.set((Math.random()-.5)*zone*2,10,0);
    scene.add(group);
    items.push({mesh:group,type:'powerup',ptype:t,vy:0.7,vx:(Math.random()-.5)*.2,pts:0,color:colors[t],rotSpeed:{x:.012,y:.018,z:.008}});
    return;
  }
  if(r<0.22){
    const g=new THREE.SphereGeometry(.44,12,12);
    const mat=new THREE.MeshStandardMaterial({color:0x222222,roughness:.4,metalness:.7});
    const mesh=new THREE.Mesh(g,mat);
    mesh.position.set((Math.random()-.5)*zone*2,10,0);
    scene.add(mesh);
    const spike=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6),new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:.8}));
    spike.position.y=.44;
    mesh.add(spike);
    items.push({mesh,type:'bomb',vy:(0.6+Math.random()*.45),vx:(Math.random()-.5)*.3,pts:0,color:0xff4757,rotSpeed:(Math.random()-.5)*.06});
    return;
  }
  const c=CANDIES[Math.floor(Math.random()*CANDIES.length)];
  const mat=new THREE.MeshStandardMaterial({color:c.color,emissive:c.color,emissiveIntensity:.25,roughness:.25,metalness:.3});
  const mesh=new THREE.Mesh(c.geo(),mat);
  mesh.castShadow=true;
  mesh.position.set((Math.random()-.5)*zone*2,10,(Math.random()-.5)*.5);
  gsap.from(mesh.scale,{x:0,y:0,z:0,duration:.25,ease:'back.out(2)'});
  scene.add(mesh);
  items.push({mesh,type:'candy',pts:c.pts,color:c.color,vy:(0.55+Math.random()*.65)*speed,vx:(Math.random()-.5)*.28,rotSpeed:{x:(Math.random()-.5)*.05,y:(Math.random()-.5)*.06,z:(Math.random()-.5)*.04}});
}

function resetGame(){
  items.forEach(it=>scene.remove(it.mesh));
  items=[];score=0;lives=3;combo=0;maxCombo=0;multiplier=1;
  frameN=0;speed=1.0;spawnRate=90;powerupTimer=0;currentLevel=1;
  shieldActive=slowActive=doubleActive=false;
  basketX=0;targetX=0;basketGroup.position.x=0;
  scoreVal.textContent='0';bestVal.textContent='Best: '+highScore;
  updateHearts();gsap.to(comboText,{opacity:0});gsap.to(multText,{opacity:0});
  gsap.to(powerupBar,{opacity:0});levelBadge.textContent='Level 1';
  state='playing';
  gsap.to(overlay,{opacity:0,duration:.5,onComplete:()=>{overlay.style.display='none';}});
}

function gameOver(){
  state='gameover';
  const isNew=score>highScore;
  if(isNew)highScore=score;
  startPanel.style.display='none';
  gameoverPanel.style.display='block';
  document.getElementById('go-score').textContent=score;
  document.getElementById('new-best').style.display=isNew?'block':'none';
  document.getElementById('go-best').textContent='Best: '+highScore;
  document.getElementById('go-combo').textContent='Max Combo: '+maxCombo+'x';
  document.getElementById('go-level').textContent='Reached Level '+currentLevel;
  overlay.style.display='flex';overlay.style.opacity='0';
  gsap.to(overlay,{opacity:1,duration:.5});
  gsap.from(document.getElementById('gameover-panel'),{y:30,opacity:0,duration:.6,ease:'back.out(1.5)'});
}

// Basket glow pulse
gsap.to(bMat,{emissiveIntensity:.4,duration:1.2,repeat:-1,yoyo:true,ease:'sine.inOut'});
bMat.emissive=new THREE.Color(0xff6b9d);

// Controls
window.addEventListener('mousemove',e=>{
  const nx=((e.clientX/window.innerWidth)-.5)*22;
  targetX=Math.max(-10.5,Math.min(10.5,nx));
});
window.addEventListener('touchmove',e=>{
  e.preventDefault();
  const nx=((e.touches[0].clientX/window.innerWidth)-.5)*22;
  targetX=Math.max(-10.5,Math.min(10.5,nx));
},{passive:false});
let keysDown={};
window.addEventListener('keydown',e=>{keysDown[e.key]=true;});
window.addEventListener('keyup',e=>{keysDown[e.key]=false;});

document.getElementById('play-btn').addEventListener('click',resetGame);
document.getElementById('replay-btn').addEventListener('click',resetGame);
document.getElementById('menu-btn').addEventListener('click',()=>{
  state='menu';items.forEach(it=>scene.remove(it.mesh));items=[];
  startPanel.style.display='block';gameoverPanel.style.display='none';
  document.getElementById('hi-overlay').textContent=highScore>0?'Best: '+highScore:'';
  overlay.style.display='flex';overlay.style.opacity='0';gsap.to(overlay,{opacity:1,duration:.4});
});
window.addEventListener('resize',()=>{
  const W2=window.innerWidth,H2=window.innerHeight;
  renderer.setSize(W2,H2);
  updateCamera();
});

const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  // Ambient animations
  stars.rotation.y=t*.003;
  orbs.forEach((o,i)=>{o.mesh.position.y+=Math.sin(t*o.speed*2+o.offset)*.004;o.mesh.rotation.x+=.003;o.mesh.rotation.y+=.005;});
  pinkLight.intensity=1.2+Math.sin(t*1.5)*.4;
  purpleLight.intensity=1.0+Math.sin(t*1.2+1)*.3;
  groundGlow.intensity=.6+Math.sin(t*2)*.25;

  if(state!=='playing'){renderer.render(scene,cam);return;}

  frameN++;

  // Keyboard
  if(keysDown['ArrowLeft'])targetX=Math.max(-10.5,targetX-.18);
  if(keysDown['ArrowRight'])targetX=Math.min(10.5,targetX+.18);

  // Basket movement
  basketX=lerp(basketX,targetX,.16);
  basketGroup.position.x=basketX;
  basketGroup.rotation.z=lerp(basketGroup.rotation.z,(targetX-basketX)*.04,.15);

  // Basket color if shielded
  bMat.color.set(shieldActive?0x00cec9:0xff6b9d);
  bMat.emissive.set(shieldActive?0x00cec9:0xff6b9d);

  // Score-based level up
  const newLevel=1+Math.floor(score/150);
  if(newLevel!==currentLevel){
    currentLevel=newLevel;
    speed=Math.min(2.4, 1.0+currentLevel*0.12);
    spawnRate=Math.max(36, 90-currentLevel*4);
    levelBadge.textContent='Level '+currentLevel;
    gsap.fromTo(levelBadge,{scale:1.6,color:'#ffd700'},{scale:1,color:'#a78bfa',duration:.6,ease:'back.out(2)'});
  }

  // Spawn
  if(frameN%spawnRate===0){ spawnItem(); }

  // Update items
  const sv=(slowActive)?.42:1;
  items=items.filter(it=>{
    it.mesh.position.y-=it.vy*sv*.05;
    if(it.vx)it.mesh.position.x+=it.vx*sv;
    if(it.mesh.position.x>11.5){it.mesh.position.x=11.5;it.vx=-Math.abs(it.vx);}
    if(it.mesh.position.x<-11.5){it.mesh.position.x=-11.5;it.vx=Math.abs(it.vx);}
    if(it.rotSpeed){
      if(it.rotSpeed.x!==undefined){it.mesh.rotation.x+=it.rotSpeed.x;it.mesh.rotation.y+=it.rotSpeed.y;it.mesh.rotation.z+=it.rotSpeed.z;}
      else it.mesh.rotation.y+=it.rotSpeed;
    }

    // Collision
    const bx=basketGroup.position.x, by=basketGroup.position.y;
    const dx=Math.abs(it.mesh.position.x-bx), dy=Math.abs(it.mesh.position.y-by);
    const hit=dx<2.0&&dy<0.9;

    if(hit){
      spawnParticles(it.mesh.position,it.color);
      if(it.type==='bomb'){
        if(shieldActive){
          shieldActive=false;
          spawnPopup(it.mesh.position,'\uD83D\uDEE1 BLOCKED!',0x00cec9);
          gsap.to(basketGroup.position,{z:0.8,duration:.12,yoyo:true,repeat:1});
        } else {
          lives--;updateHearts();combo=0;multiplier=1;showCombo();
          spawnPopup(it.mesh.position,'💥 BOOM!',0xff4757);
          gsap.to(cam.position,{x:.4,duration:.06,yoyo:true,repeat:5,onComplete:()=>cam.position.x=0});
          gsap.to(basketGroup.rotation,{z:.3,duration:.08,yoyo:true,repeat:3});
          if(lives<=0){scene.remove(it.mesh);gameOver();return false;}
        }
      } else if(it.type==='powerup'){
        powerupTimer=300;
        if(it.ptype==='shield')shieldActive=true;
        else if(it.ptype==='2x'){doubleActive=true;multiplier=Math.max(multiplier,2);}
        else slowActive=true;
        const pcols={shield:0x00cec9,'2x':0xffd700,slow:0xc084fc};
        const plbls={shield:'✨ SHIELD!','2x':'⚡ 2X POINTS!',slow:'❄️ SLOW-MO!'};
        spawnPopup(it.mesh.position,plbls[it.ptype],pcols[it.ptype]);
        gsap.to(basketGroup.scale,{x:1.12,y:1.12,z:1.12,duration:.14,yoyo:true,repeat:1});
      } else {
        const pts=it.pts*multiplier;score+=pts;combo++;
        if(combo>maxCombo)maxCombo=combo;
        multiplier=Math.min(5,1+Math.floor(combo/5));
        scoreVal.textContent=score;showCombo();
        const label=(multiplier>1?'×'+multiplier+' ':'')+'+'+(pts);
        spawnPopup(it.mesh.position,label,it.color);
        gsap.from(basketGroup.scale,{x:1.08,y:1.08,z:1.08,duration:.14,ease:'power2.out'});
      }
      scene.remove(it.mesh);return false;
    }

    // Missed
    if(it.mesh.position.y<-9){
      if(it.type==='candy'){combo=0;multiplier=1;showCombo();}
      scene.remove(it.mesh);return false;
    }
    return true;
  });

  // Powerup timer
  if(powerupTimer>0){powerupTimer--;updatePowerupBar();if(powerupTimer<=0){shieldActive=slowActive=doubleActive=false;updatePowerupBar();}}

  renderer.render(scene,cam);
}
animate();
