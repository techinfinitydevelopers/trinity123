// @ts-nocheck  — ported from a plain-JS prototype; types are intentionally loose.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {toCreasedNormals} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {ORIGIN,FIELDS,COUNTRIES} from './data';
import {UNI} from './uni';
import {MARKUP} from './markup';

export type WorldOpts={
  /** public URL of the assets folder. default '/tw' */
  assetBase?:string;
  /** pass your site's existing Lenis instance to avoid two smooth-scrollers */
  lenis?:any;
  /** country page link for the "Explore <country>" button. default '/destinations/<k>' */
  destHref?:(c:{k:string;n:string})=>string;
  /** custom lead handler. default: POST JSON to leadEndpoint */
  onLead?:(p:Record<string,string>)=>Promise<void>|void;
  /** default '/api/leads' */
  leadEndpoint?:string;
  /** called with true while the flight cabin (dark) is on screen — use it to recolour your header */
  onDark?:(dark:boolean)=>void;
  /** skip the picker and fly straight to a country key (uk, usa, canada, ...) */
  initialCountry?:string;
  /** allow #c=<key> deep-link. default true */
  hashPick?:boolean;
};

export function mountWorld(root:HTMLElement,opts:WorldOpts={}){
const AB=(opts.assetBase??'/tw').replace(/\/$/,'');
const cleanups:Array<()=>void>=[];let raf=0;
const onWin=(t:string,f:any,o?:any)=>{window.addEventListener(t,f,o);cleanups.push(()=>window.removeEventListener(t,f,o))};
root.classList.add('tw');root.innerHTML=MARKUP;
const $=(s:string)=>root.querySelector(s) as any,$$=(s:string)=>[...root.querySelectorAll(s)] as any[];
const G:any={};
G.__UNI__=Object.fromEntries(Object.entries(UNI).map(([k,v])=>[k,{url:AB+'/'+v.src,artist:v.artist,license:v.license}]));
const IMG:any=Object.fromEntries(COUNTRIES.map((c:any)=>[c.k,AB+'/city/'+c.k+'.jpg']));
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});

/* ---------- smooth scroll (locked until a country is chosen) ---------- */
const ownLenis=!opts.lenis;
const lenis=opts.lenis||new Lenis({lerp:.075,wheelMultiplier:.9,touchMultiplier:1.4,smoothWheel:true});
const lenisSync=()=>ScrollTrigger.update();lenis.on('scroll',lenisSync);
const tick=t=>lenis.raf(t*1000);
if(ownLenis){gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0)}
cleanups.push(()=>{lenis.off&&lenis.off('scroll',lenisSync);if(ownLenis){gsap.ticker.remove(tick);lenis.destroy()}else lenis.start()});
lenis.stop();
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=root.querySelector(a.getAttribute('href'));if(t&&t.id){e.preventDefault();if(!state.k){shake();return}lenis.scrollTo(t,{duration:2.4,easing:x=>1-Math.pow(1-x,4)})}}));

/* ---------- state ---------- */
const state={k:null,c:null};
const R=10;
const ll=(lat,lon,r=1)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return new THREE.Vector3(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b))};
const toLL=v=>{const n=v.clone().normalize();return {lat:Math.asin(n.y)*180/Math.PI,lon:Math.atan2(-n.z,n.x)*180/Math.PI}};
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};

/* ---------- renderer / scene ---------- */
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance',logarithmicDepthBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.002,1200);
const asp=()=>innerWidth/innerHeight;const mobile=()=>innerWidth<760||asp()<1.25;
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
onWin('resize',resize);resize();
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.03).texture;
scene.environmentIntensity=.8;
const sun=new THREE.DirectionalLight(0xfff6e6,2.6);sun.position.set(25,25,70);scene.add(sun);
scene.add(new THREE.AmbientLight(0xa9c4f5,1.5));
scene.add(new THREE.HemisphereLight(0xdbe9ff,0x35507a,.8));
const rimL=new THREE.DirectionalLight(0x6fa8ff,.8);rimL.position.set(-40,10,-30);scene.add(rimL);

/* stars */
{const g=new THREE.BufferGeometry(),n=1800,p=new Float32Array(n*3);for(let i=0;i<n;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(500+Math.random()*100);p.set([v.x,v.y,v.z],i*3)}
g.setAttribute('position',new THREE.BufferAttribute(p,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false,transparent:true,opacity:.85,fog:false})))}

/* globe */
const spin=new THREE.Group();scene.add(spin);const globe=new THREE.Group();spin.add(globe);let spinV=0,spinX=0;
const TL=new THREE.TextureLoader();
const B=AB+'/earth/';
const W=AB+'/earth/';
const maxA=renderer.capabilities.getMaxAnisotropy();
const eTex=TL.load(W+'2_no_clouds_4k.jpg');eTex.colorSpace=THREE.SRGBColorSpace;eTex.anisotropy=maxA;
const bumpT=TL.load(W+'elev_bump_4k.jpg'),specT=TL.load(W+'water_4k.png');bumpT.anisotropy=specT.anisotropy=maxA;
const earth=new THREE.Mesh(new THREE.SphereGeometry(R,128,128),new THREE.MeshPhongMaterial({map:eTex,bumpMap:bumpT,bumpScale:.12,specularMap:specT,shininess:22,specular:new THREE.Color(0x3a5a88),emissive:new THREE.Color(0x1a2a44),emissiveMap:eTex,emissiveIntensity:.55}));
globe.add(earth);
const BASE={x:22*Math.PI/180,y:-Math.PI/2-78*Math.PI/180};globe.rotation.set(BASE.x,BASE.y,0);
const cTex=TL.load(B+'earth_clouds_1024.png');cTex.colorSpace=THREE.SRGBColorSpace;
const cloudM=new THREE.Mesh(new THREE.SphereGeometry(R*1.01,96,96),new THREE.MeshPhongMaterial({map:cTex,transparent:true,opacity:.38,depthWrite:false,blending:THREE.AdditiveBlending}));
globe.add(cloudM);
const atmo=new THREE.Mesh(new THREE.SphereGeometry(R*1.075,64,64),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 vN;void main(){float i=pow(clamp(.66-dot(vN,vec3(0.,0.,1.)),0.,1.),2.8);gl_FragColor=vec4(.36,.66,1.,1.)*i*1.25;}'}));
scene.add(atmo);
/* ---- particle intro: dust -> continents -> globe ---- */
const intro={p:0,done:false};G.__intro=intro;
const PN=mobile()?14000:26000;
const pStart=new Float32Array(PN*3),pTarget=new Float32Array(PN*3),pRnd=new Float32Array(PN);
function fillTargets(img){
  let data=null,cw=0,ch=0;
  if(img){const cv=document.createElement('canvas');cw=cv.width=1024;ch=cv.height=512;const x=cv.getContext('2d');x.drawImage(img,0,0,cw,ch);data=x.getImageData(0,0,cw,ch).data}
  for(let i=0;i<PN;i++){
    let u,vg,tries=0;
    do{u=Math.random();vg=Math.acos(1-2*Math.random())/Math.PI;tries++;
      if(!data)break;const px=((vg*(ch-1))|0)*cw+((u*(cw-1))|0),r=data[px*4],g=data[px*4+1],b=data[px*4+2];
      var land=(r>b*.8||g>b*.95);if(land||(tries>2&&Math.random()<.12))break}while(tries<8);
    const phi=u*Math.PI*2,th=vg*Math.PI,rr=R*1.002;
    pTarget[i*3]=-rr*Math.cos(phi)*Math.sin(th);pTarget[i*3+1]=rr*Math.cos(th);pTarget[i*3+2]=rr*Math.sin(phi)*Math.sin(th);
  }
}
for(let i=0;i<PN;i++){
  const arm=(Math.random()*3)|0,rr=R*(1.5+Math.pow(Math.random(),.8)*3.6),ang=rr*.55+arm*Math.PI*2/3+(Math.random()-.5)*(.5+rr*.04);
  let x=rr*Math.cos(ang),y=(Math.random()-.5)*R*.5*Math.exp(-rr/(R*3)),z=rr*Math.sin(ang);
  const tilt=.95,cy=Math.cos(tilt),sy=Math.sin(tilt);const y2=y*cy-z*sy,z2=y*sy+z*cy;
  pStart[i*3]=x;pStart[i*3+1]=y2;pStart[i*3+2]=z2;pRnd[i]=Math.random();
}
fillTargets(null);
const pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pStart,3));
pGeo.setAttribute('aStart',new THREE.BufferAttribute(pStart,3));
const pTgtAttr=new THREE.BufferAttribute(pTarget,3);pGeo.setAttribute('aTarget',pTgtAttr);
pGeo.setAttribute('aRnd',new THREE.BufferAttribute(pRnd,1));
const pMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{uP:{value:0},uT:{value:0},uA:{value:1},uS:{value:innerHeight*renderer.getPixelRatio()}},
  vertexShader:`attribute vec3 aStart;attribute vec3 aTarget;attribute float aRnd;uniform float uP,uT,uS;varying float vR;varying float vE;
  void main(){float pe=clamp((uP-aRnd*.38)/.62,0.,1.);float e=pe*pe*(3.-2.*pe);
    float ang=(1.-e)*(2.6+aRnd*1.6)+uT*.25*(1.-e);float c=cos(ang),s=sin(ang);
    vec3 st=vec3(aStart.x*c-aStart.z*s,aStart.y+sin(uT*.8+aRnd*30.)*.35*(1.-e),aStart.x*s+aStart.z*c);
    vec3 p=mix(st,aTarget,e);p+=normalize(aTarget)*sin(uT*2.+aRnd*40.)*.05*e;
    vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
    gl_PointSize=min(9.,(2.1+aRnd*2.4-e*1.2)*uS/900.*(60./-mv.z)*1.15);vR=aRnd;vE=e;}`,
  fragmentShader:`uniform float uA;varying float vR;varying float vE;
  void main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;float a=smoothstep(.5,.0,d);
    vec3 col=mix(vec3(1.,.78,.3),vec3(.45,.8,1.),vR);col=mix(col,vec3(.75,.9,1.),vE*.5);gl_FragColor=vec4(col,a*uA*(.9-.45*vE));}`});
const pts=new THREE.Points(pGeo,pMat);pts.frustumCulled=false;globe.add(pts);
if(eTex.image&&eTex.image.width)fillTargets(eTex.image),pTgtAttr.needsUpdate=true;
else eTex.addEventListener&&0;
let introGo=false;function startIntro(){if(introGo||(opts.hashPick!==false&&location.hash.startsWith('#c=')))return;introGo=true;$('#loading').classList.add('done');gsap.to(intro,{p:1,duration:5.2,delay:.9,ease:'power2.inOut',onComplete:introDone})}
function waitTex(n=0){if(eTex.image&&eTex.image.width){fillTargets(eTex.image);pTgtAttr.needsUpdate=true;startIntro()}else if(n<120)setTimeout(()=>waitTex(n+1),100);else startIntro()}waitTex();
const earthM=earth.material;
const il=document.createElement('div');il.id='introUI';il.innerHTML='<div class="il-t">Assembling the world</div><div class="il-b"><i></i></div><div class="il-n">0%</div>';root.appendChild(il);
const sw=document.createElement('div');sw.id='shock';root.appendChild(sw);let shocked=false;
function applyIntro(){
  il.querySelector('i').style.transform='scaleX('+intro.p+')';il.querySelector('.il-n').textContent=Math.round(intro.p*100)+'%';
  if(intro.p>.93&&!shocked){shocked=true;gsap.fromTo(sw,{scale:.2,opacity:.9},{scale:4,opacity:0,duration:1.6,ease:'power3.out'})}
  const p=intro.p,f=sm(.74,1,p);
  pMat.uniforms.uP.value=p;pMat.uniforms.uT.value=clock.elapsedTime;pMat.uniforms.uA.value=1-sm(.9,1,p);
  if(!intro.done){pinObjs.forEach(o=>o.mesh.visible=false);originMesh.visible=false;earthM.transparent=true;earthM.opacity=f;earth.visible=f>0;cloudM.material.opacity=.38*f;cloudM.visible=f>0;atmo.visible=p>.9;pts.visible=true}
}
function introDone(){intro.done=true;gsap.to(il,{opacity:0,y:20,duration:.6,onComplete:()=>il.remove()});pinObjs.forEach(o=>o.mesh.visible=true);originMesh.visible=true;earthM.transparent=false;earthM.opacity=1;earth.visible=true;cloudM.visible=true;cloudM.material.opacity=.38;pts.visible=false;
  root.classList.add('ready');
  gsap.from('#panel > *',{y:26,opacity:0,duration:.8,stagger:.09,ease:'power3.out'});gsap.from('#pins',{opacity:0,duration:1})}
if((opts.hashPick!==false&&location.hash.startsWith('#c='))){intro.p=1;il.style.display='none';setTimeout(introDone,0)}
else{earth.visible=false;cloudM.visible=false;atmo.visible=false;
  }
/* scroll progress bar */
const prog=document.createElement('div');prog.id='prog';root.appendChild(prog);
ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:s=>{prog.style.transform=`scaleX(${s.progress})`}});


/* pins */
const pinsDiv=$('#pins');
const pinObjs=COUNTRIES.map(c=>{
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(.09,16,16),new THREE.MeshBasicMaterial({color:0xf5b82e}));
  mesh.position.copy(ll(c.lat,c.lon,R*1.004));globe.add(mesh);
  const b=document.createElement('button');b.className='pin';b.dataset.k=c.k;b.innerHTML='<i></i><span>'+c.s+'</span>';
  b.addEventListener('click',()=>choose(c.k));pinsDiv.appendChild(b);
  return {c,mesh,b};
});
const originMesh=new THREE.Mesh(new THREE.SphereGeometry(.11,16,16),new THREE.MeshBasicMaterial({color:0xffffff}));
originMesh.position.copy(ll(ORIGIN.lat,ORIGIN.lon,R*1.004));globe.add(originMesh);
const ring=new THREE.Mesh(new THREE.RingGeometry(.16,.2,40),new THREE.MeshBasicMaterial({color:0xf5b82e,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
ring.visible=false;globe.add(ring);

/* aircraft (A350 GLB, CC BY 4.0) */
const planeG=new THREE.Group();globe.add(planeG);planeG.visible=false;
const PS=.013;planeG.scale.setScalar(PS);
new GLTFLoader().load(AB+'/a350.glb',g=>{
  g.scene.traverse(o=>{if(o.isMesh){try{o.geometry=toCreasedNormals(o.geometry,Math.PI/3.2)}catch(e){}o.material.envMapIntensity=1;if(o.material.map){o.material.map.anisotropy=maxA;o.material.map.needsUpdate=true}o.material.roughness=Math.min(o.material.roughness??.5,.5);o.material.metalness=Math.max(o.material.metalness??0,.15)}});
  planeG.add(g.scene);
  try{crispWindows(g.scene)}catch(err){console.error('windows',err)}
  $('#loading').classList.add('done');ScrollTrigger.refresh();
/* GLTFLoader.load is (url,onLoad,onProgress,onError) — this handler was in the onProgress
   slot, so every progress tick of a 4 MB model was logged as an error. The model itself
   always loaded; only the console said otherwise. */
},undefined,e=>console.error('a350.glb',e));


/* crisp vector windows + cockpit: replace the low-res decal textures so close-ups stay sharp */
function crispWindows(model){
  globe.updateMatrixWorld(true);planeG.updateMatrixWorld(true);model.updateMatrixWorld(true);
  const meshes=[];model.traverse(o=>{if(o.isMesh)meshes.push(o)});
  const rc=new THREE.Raycaster();rc.near=0;rc.far=1e4;
  const OFF=.014;
  const cast=(o,d)=>{ // local origin/dir -> local hit point or null
    const wo=planeG.localToWorld(o.clone()),wd=planeG.localToWorld(o.clone().add(d)).sub(wo).normalize();
    rc.set(wo,wd);const h=rc.intersectObjects(meshes,false)[0];return h?planeG.worldToLocal(h.point.clone()):null;
  };
  const patch=(nu,nv,fn,mat,off=OFF)=>{
    const pos=[],ok=[];
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const [o,d]=fn(i/nu,j/nv);const h=cast(o,d);
      if(h){h.addScaledVector(d,-off);pos.push(h.x,h.y,h.z);ok.push(1)}else{pos.push(0,0,0);ok.push(0)}
    }
    const idx=[];
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;if(ok[a]&&ok[b]&&ok[c]&&ok[d])idx.push(a,c,b,b,c,d)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat);planeG.add(m);return m;
  };
  const po=(f,u)=>({polygonOffset:true,polygonOffsetFactor:-f,polygonOffsetUnits:-f});
  const paint=new THREE.MeshStandardMaterial({color:0xf4f6f9,roughness:.38,metalness:.08,side:THREE.DoubleSide,...po(2)});
  const cockpit=new THREE.MeshStandardMaterial({color:0x07101f,roughness:.05,metalness:.5,envMapIntensity:1.8,side:THREE.DoubleSide,...po(6)});
  const frame=new THREE.MeshStandardMaterial({color:0x8d96a3,roughness:.5,side:THREE.DoubleSide,...po(4)});
  /* paint band over the old window decals, full cabin length (starboard + port) */
  patch(260,18,(u,v)=>[new THREE.Vector3(-21.8+49.8*u,1.5+1.5*v,14),new THREE.Vector3(0,0,-1)],paint);
  patch(260,18,(u,v)=>[new THREE.Vector3(-21.8+49.8*u,1.5+1.5*v,-14),new THREE.Vector3(0,0,1)],paint);
  /* cockpit: front windscreen (4 panes) + two side panes each side */
  const pane=(f)=>{patch(14,8,f(1.0),cockpit);patch(14,8,f(1.0),cockpit)};
  const FZ=[[-1.78,-.92],[-.84,-.04],[.04,.84],[.92,1.78]];
  FZ.forEach(([a,b])=>{
    patch(10,8,(u,v)=>[new THREE.Vector3(42,1.86+.74*v,a+(b-a)*u),new THREE.Vector3(-1,0,0)],frame,OFF+.004);
    patch(10,8,(u,v)=>[new THREE.Vector3(42,1.92+.62*v,(a+.05)+(b-a-.1)*u),new THREE.Vector3(-1,0,0)],cockpit,OFF+.008);
  });
  [[29.45,30.25],[30.33,31.15]].forEach(([a,b])=>{
    [[14,-1],[-14,1]].forEach(([z0,dz])=>{
      patch(10,8,(u,v)=>[new THREE.Vector3(a+(b-a)*u,1.74+.78*v,z0),new THREE.Vector3(0,0,dz)],frame,OFF+.004);
      patch(10,8,(u,v)=>[new THREE.Vector3(a+.04+(b-a-.08)*u,1.80+.66*v,z0),new THREE.Vector3(0,0,dz)],cockpit,OFF+.008);
    });
  });
  /* passenger windows (instanced = 3 draw calls) */
  const rr=(w,h,n=2.7)=>{const s=new THREE.Shape(),N=72;for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);const x=Math.sign(c)*Math.pow(Math.abs(c),2/n)*w/2,y=Math.sign(sn)*Math.pow(Math.abs(sn),2/n)*h/2;i?s.lineTo(x,y):s.moveTo(x,y)}return s};
  const gBez=new THREE.ShapeGeometry(rr(.40,.55),48),gRing=new THREE.ShapeGeometry(rr(.325,.465),48),gGlass=new THREE.ShapeGeometry(rr(.29,.42),48);
  const bez=new THREE.MeshStandardMaterial({color:0xdfe4ea,roughness:.5,metalness:.1,...po(5)});
  const ringM=new THREE.MeshStandardMaterial({color:0x9aa3b0,roughness:.5,...po(7)});
  const glass=new THREE.MeshStandardMaterial({color:0x0b1a38,roughness:.06,metalness:.35,envMapIntensity:1.6,...po(9)});
  const goldRing=new THREE.MeshStandardMaterial({color:0xf5b82e,roughness:.4,metalness:.3,...po(7)});
  const glow=new THREE.MeshBasicMaterial({color:0x8ec9ff,...po(9)});
  const WY=2.25,list=[];
  for(let k=-24;k<=17;k++){
    const x=14+k*.74;
    const h=cast(new THREE.Vector3(x,WY,14),new THREE.Vector3(0,0,-1));if(!h)continue;
    const hu=cast(new THREE.Vector3(x,WY+.06,14),new THREE.Vector3(0,0,-1)),hd=cast(new THREE.Vector3(x,WY-.06,14),new THREE.Vector3(0,0,-1));
    const tilt=hu&&hd?Math.atan2(hu.z-hd.z,.12):0;
    list.push({k,x,z:h.z+OFF+.002,tilt});
  }
  const mk=(geo,mat,dz,only0)=>{
    const arr=list.filter(w=>only0?w.k===0:w.k!==0);
    const im=new THREE.InstancedMesh(geo,mat,arr.length);const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
    arr.forEach((w,i)=>{e.set(w.tilt,0,0);q.setFromEuler(e);m.compose(new THREE.Vector3(w.x,WY,w.z+dz),q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,m)});
    im.instanceMatrix.needsUpdate=true;planeG.add(im);
  };
  mk(gBez,bez,0);mk(gRing,ringM,.003);mk(gGlass,glass,.006);
  const t0=list.find(w=>w.k===0);
  if(t0){mk(gBez,bez,0,true);mk(gRing,goldRing,.003,true);mk(gGlass,glow,.006,true)}
}
/* route arc */
const arcLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0xf5b82e,dashSize:.22,gapSize:.16,transparent:true,opacity:.95}));
arcLine.visible=false;globe.add(arcLine);
let A=new THREE.Vector3(),Bv=new THREE.Vector3(),ANG=1;
const alt=p=>.9+1.5*Math.pow(Math.sin(Math.PI*p),.8);
function dirAt(p){const s=Math.sin(ANG);return A.clone().multiplyScalar(Math.sin((1-p)*ANG)/s).add(Bv.clone().multiplyScalar(Math.sin(p*ANG)/s)).normalize()}
const posAt=p=>dirAt(p).multiplyScalar(R+alt(p));
function buildArc(){
  A=ll(ORIGIN.lat,ORIGIN.lon,1).normalize();Bv=ll(state.c.lat,state.c.lon,1).normalize();ANG=Math.max(.2,A.angleTo(Bv));
  const pts=[];for(let i=0;i<=140;i++){const p=i/140;pts.push(dirAt(p).multiplyScalar(R*1.006+.25*Math.sin(Math.PI*p)*(R*.2*ANG/Math.PI)))}
  arcLine.geometry.setFromPoints(pts);arcLine.computeLineDistances();arcLine.visible=true;
}
const _m=new THREE.Matrix4();
function placePlane(p){
  const pos=posAt(p),p1=posAt(Math.max(0,p-.003)),p2=posAt(Math.min(1,p+.003));
  const up=pos.clone().normalize(),f=p2.sub(p1).normalize();f.sub(up.clone().multiplyScalar(f.dot(up))).normalize();
  const r=new THREE.Vector3().crossVectors(f,up);
  _m.makeBasis(f,up,r);planeG.quaternion.setFromRotationMatrix(_m);planeG.position.copy(pos);
}

/* local (plane-space) camera path for the window approach, metres */
const V=a=>new THREE.Vector3(...a);
const posC=new THREE.CatmullRomCurve3([[66,14,54],[46,9,34],[29,5.6,18],[19.5,3.6,10],[15.4,2.7,5.8],[14.3,2.32,4.0]].map(V),false,'centripetal');
const lookC=new THREE.CatmullRomCurve3([[0,2,0],[8,2,0],[14,2.2,0],[14,2.3,2.4],[14,2.28,3.1],[14,2.25,3.05]].map(V),false,'centripetal');

/* ---------- camera rig ---------- */
const st={t:0,cur:0,speed:0,show:true,arc:0};
const wideOff=()=>mobile()?new THREE.Vector3(0,-5.5,0):new THREE.Vector3(-Math.min(12,7.2+Math.max(0,1.7-asp())*10),0,0);
const wideDist=()=>mobile()?58:40+Math.max(0,1.7-asp())*12;
const P=new THREE.Vector3(),L=new THREE.Vector3(),W1=new THREE.Vector3(),W2=new THREE.Vector3();
const clock=new THREE.Clock();
function pinProject(){
  const show=st.cur<.14;
  const cdir=camera.position.clone().normalize();
  pinObjs.forEach(o=>{
    if(!show){o.b.style.display='none';return}
    o.mesh.getWorldPosition(W1);const facing=W1.clone().normalize().dot(cdir)>.22;
    W1.project(camera);
    o.b.style.display=facing?'block':'none';
    o.b.style.transform=`translate(${(W1.x*.5+.5)*innerWidth}px,${(-W1.y*.5+.5)*innerHeight}px)`;
    o.b.classList.toggle('on',o.c.k===state.k);
  });
}
function frame(){
  raf=requestAnimationFrame(frame);
  if(!st.show)return;
  const dt=Math.min(clock.getDelta(),.05);
  st.cur+=(st.t-st.cur)*Math.min(1,dt*7);
  const t=st.cur;
  cloudM.rotation.y+=dt*.004;
  spinV+=((lenis.velocity||0)*.00035-spinV)*Math.min(1,dt*6);
  spinX=(spinX+spinV)*Math.pow(.94,dt*60);
  spin.rotation.y=spinX;
  const amp=1-sm(0,.15,st.cur),tt=clock.elapsedTime;
  globe.rotation.x=BASE.x+Math.sin(tt*.35)*.035*amp;
  globe.rotation.y=BASE.y+Math.sin(tt*.27)*.06*amp;
  ring.scale.setScalar(1+.35*Math.sin(clock.elapsedTime*3));
  const planeOn=!!state.k;planeG.visible=planeOn;
  if(planeOn){placePlane(sm(.02,.8,t))}
  globe.updateMatrixWorld(true);
  // camera
  const off=wideOff();
  const wide=new THREE.Vector3(off.x,off.y,wideDist()),wideLook=off.clone();
  let pos=wide.clone(),look=wideLook.clone(),fov=36;
  if(planeOn){
    planeG.getWorldPosition(W2);
    const dir=W2.clone().normalize();
    const track=dir.clone().multiplyScalar(R+16-9*sm(.1,.3,t));
    const kA=sm(0,.2,t);pos.lerp(track,kA);look.lerp(W2,kA);
    const e=sm(.28,.86,t);
    posC.getPoint(e,P);lookC.getPoint(e,L);planeG.localToWorld(P);planeG.localToWorld(L);
    const w=sm(.22,.5,t);pos.lerp(P,w);look.lerp(L,w);fov=36-9*e*e;
  }
  camera.position.copy(pos);camera.up.set(0,1,0);
  // keep "up" aligned with local up once close, so the plane stays level
  if(planeOn){const k=sm(.3,.55,t);if(k>0){const u=new THREE.Vector3(0,1,0).lerp(new THREE.Vector3(0,1,0).applyQuaternion(planeG.getWorldQuaternion(new THREE.Quaternion())),k);camera.up.copy(u.normalize())}}
  camera.lookAt(look);
  const a=asp(),fs=a<1?Math.min(1.9,Math.pow(1/a,.7)):1,F=Math.min(78,fov*fs);
  if(Math.abs(camera.fov-F)>.01){camera.fov=F;camera.updateProjectionMatrix()}
  atmo.visible=intro.done?t<.5:(intro.p>.9);
  if(!intro.done)applyIntro();
  pinProject();
  renderer.render(scene,camera);
}
frame();

/* ---------- country selection ---------- */
const chips=$('#chips'),input=$('#q');
COUNTRIES.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.k=c.k;b.textContent=c.n;b.addEventListener('click',()=>choose(c.k));chips.appendChild(b)});
function filter(){const q=input.value.trim().toLowerCase();$$('.chip').forEach(ch=>{const c=COUNTRIES.find(x=>x.k===ch.dataset.k);ch.style.display=(!q||c.n.toLowerCase().includes(q)||c.s.toLowerCase().includes(q)||c.city.toLowerCase().includes(q))?'':'none'})}
input.addEventListener('input',filter);
input.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=input.value.trim().toLowerCase();const c=COUNTRIES.find(x=>x.n.toLowerCase()===q||x.s.toLowerCase()===q)||COUNTRIES.find(x=>x.n.toLowerCase().includes(q)||x.s.toLowerCase().includes(q)||x.city.toLowerCase().includes(q));if(c)choose(c.k)}});
function shake(){gsap.fromTo('#panel',{x:-10},{x:0,duration:.6,ease:'elastic.out(1,.3)'})}
const GEN=['photo-1519452575417-564c1401ecc0','photo-1541339907198-e08756dedf3f','photo-1434030216411-0b793f4b4173','photo-1488190211105-8b0e65b80b4e','photo-1454165804606-c3d57bc86b40','photo-1503676260728-1c00da094a0b'].map(i=>`${AB}/stu/${i.replace('photo-','')}.jpg`);
function render(c){
  $('#pickedName').textContent=c.n;$('#cname').textContent=c.n;root.classList.add('compact');fitName();
  $('#go').innerHTML='Scroll to fly to <b>'+c.city+'</b> ↓';
  $('#c1 h1').innerHTML='Next stop:<br>'+c.n;
  $('#c1 p').textContent=ORIGIN.name+' → '+c.city+'. One consultancy, door to door — from test prep to your offer letter.';
  $('#c2 h2').innerHTML='Your window<br>to '+(c.s==='USA'||c.s==='UAE'?'the '+c.s:c.n)+'.';
  $('#c4 h2').innerHTML='Landing in<br>'+c.city+'.';
  $('#c4 p').textContent=c.u.slice(0,4).join(' · ');
  $('#route').textContent=ORIGIN.name.toUpperCase()+' → '+c.city.toUpperCase();
  const url=IMG[c.k];
  $('.v2').style.backgroundImage=`url(${url})`;
  $('.arrive .bg').style.backgroundImage=`url(${url})`;
  $('.arrive .tag').textContent='Welcome to '+c.n;
  $('.arrive h2').innerHTML='Study in <em>'+c.n+'.</em><br>We\'ll fly with you.';
  $('.arrive p').textContent=c.u.slice(0,3).join(', ')+' — your university in '+c.city+' is waiting.';
  const ex=$('#explore');ex.textContent='Explore '+c.n;{const h=opts.destHref?opts.destHref(c):'/destinations/'+c.k;ex.href=h||'#unis';ex.target='';ex.rel='noopener'}
  $('#uni-eyebrow').textContent='Destination '+c.s;
  $('#uni-lead').textContent=c.u.length+' universities in '+c.n+' we place students in. Keep scrolling →';
  const track=$('#track');track.querySelectorAll('.ucard:not(.intro)').forEach(n=>n.remove());
  const outro=track.querySelector('.outro');
  c.u.forEach((u,i)=>{
    const a=document.createElement('article');a.className='ucard';
    const U=(G.__UNI__||{})[u]||{},src=U.url||IMG[c.k];
    a.innerHTML=`<div class="ph"><img loading="lazy" decoding="async" alt="" src="${src}"></div><span class="no">0${i+1}</span><span class="loc"><i></i><b></b></span><div class="in"><h3></h3><small></small><div class="row2"><span class="pill">Shortlist with us</span><span class="go">Apply <em>→</em></span></div></div>`;
    const im=a.querySelector('img');im.alt=u+' campus';im.onerror=()=>{if(im.src!==IMG[c.k]){im.onerror=null;im.src=IMG[c.k]}};
    a.querySelector('h3').textContent=u;a.querySelector('small').textContent=c.n;a.querySelector('.loc b').textContent=c.s;a.dataset.credit=U.artist?('Photo: '+U.artist+(U.license?' ('+U.license+')':'')):'';
    track.insertBefore(a,outro);
  });
  $('#out-t').textContent='Not on the list?';
  $('#out-p').textContent='We shortlist universities in '+c.n+' by your profile, budget and goals.';
  $('#ie-also').textContent='Tests for '+c.n+': '+c.test;
  $$('.chip').forEach(ch=>ch.classList.toggle('on',ch.dataset.k===c.k));
  $$('.cdest').forEach(e=>e.textContent=c.n);
  renderStudent(c);
  ScrollTrigger.refresh();
}
function fitName(){const n=$('#cname');n.style.fontSize='';n.style.whiteSpace='nowrap';n.style.overflow='visible';const fs=parseFloat(getComputedStyle(n).fontSize),w=n.scrollWidth,max=innerWidth*.8;if(w>max)n.style.fontSize=(fs*max/w)+'px';n.style.overflow='hidden'}
onWin('resize',()=>{if($('#cname').textContent)fitName()});
function choose(k){
  const c=COUNTRIES.find(x=>x.k===k);if(!c)return;
  const first=!state.k;state.k=k;state.c=c;
  render(c);buildArc();
  // destination ring
  ring.visible=true;ring.position.copy(ll(c.lat,c.lon,R*1.006));ring.lookAt(ring.position.clone().multiplyScalar(2));
  gsap.fromTo('#pickedBox',{opacity:0,y:20},{opacity:1,y:0,duration:.8,delay:.5});
  gsap.fromTo('#cname',{opacity:0,y:40,letterSpacing:'.5em'},{opacity:1,y:0,letterSpacing:'.12em',duration:1.4,ease:'power3.out',delay:.3});
  root.classList.add('picked');$('#hint').firstChild.textContent='Scroll to take off';
  lenis.start();
}
$('#change').addEventListener('click',()=>{root.classList.remove('compact');lenis.start();lenis.scrollTo(root,{duration:2.6,easing:x=>1-Math.pow(1-x,4),onComplete:()=>input.focus()})});
if((opts.hashPick!==false&&location.hash.startsWith('#c='))){setTimeout(()=>choose(location.hash.slice(3)),400)}

/* ---------------- FLIGHT TIMELINE ---------------- */
const altEl=$('#alt');
const fl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'#flight',start:'top top',end:'bottom bottom',scrub:1.1,
  onUpdate:s=>{
    const u=fl.time();
    st.speed=0;
    st.show=u<6.9;canvas.style.visibility=u<6.9?'visible':'hidden';
    const dk=u>4.3&&u<12.9;opts.onDark&&opts.onDark(dk);$('.meter').classList.toggle('dk',dk);const ui=u<.9;$('#panel').style.pointerEvents=ui?'auto':'none';$('#pins').style.pointerEvents=ui?'auto':'none';
    let a=u<6.4?36000*sm(.2,3.2,u):(u<10?36000:36000-sm(9.9,12.6,u)*35200);
    altEl.textContent=(Math.round(a/10)*10).toLocaleString('en-US');
  }}});
fl.to(st,{t:1,duration:7,ease:'none'},0)
  .to('#panel',{opacity:0,x:-60,duration:.7},.05)
  .to('#cname',{opacity:0,duration:.8},.3)
  .to('#hint',{opacity:0,duration:.3},.2)
  .fromTo('#c1',{opacity:0,y:60},{opacity:1,y:0,duration:.5},.9)
  .to('#c1',{opacity:0,y:-60,duration:.5},2.5)
  .fromTo('#c2',{opacity:0,x:80},{opacity:1,x:0,duration:.5},3.2)
  .to('#c2',{opacity:0,x:80,duration:.5},4.7)
  .to('#flash',{opacity:.95,duration:.45,ease:'power2.in'},6.15)
  .set('#cabin',{opacity:1},6.55)
  .fromTo('#winwrap',{scale:.3,y:'8vh'},{scale:1,y:0,duration:1.5,ease:'power3.out'},6.55)
  .fromTo('.cabin .seat',{y:'20vh'},{y:0,duration:1.4,ease:'power3.out'},6.6)
  .to('#flash',{opacity:0,duration:.7},6.6)
  .fromTo('#c3',{opacity:0,y:50},{opacity:1,y:0,duration:.5},7.5)
  .to('#c3',{opacity:0,y:-40,duration:.5},9.2)
  .to('#shade',{yPercent:-94,duration:1.5,ease:'power2.inOut'},7.7)
  .fromTo('.v1',{scale:1.05},{scale:1.35,duration:3,ease:'none'},7.5)
  .to('.v1',{opacity:0,duration:1.4},9.9)
  .fromTo('.v2',{opacity:0,scale:1.0},{opacity:1,scale:1.45,duration:3.4,ease:'none'},9.9)
  .fromTo('#c4',{opacity:0,y:50},{opacity:1,y:0,duration:.5},10.3)
  .to('#c4',{opacity:0,y:-40,duration:.5},11.8)
  .to('#winwrap',{scale:10,duration:1.5,ease:'power2.in'},12)
  .to('.cabin .seat',{y:'30vh',opacity:0,duration:1},12)
  .fromTo('#arrive',{opacity:0,scale:1.15},{opacity:1,scale:1,duration:1,ease:'power2.out'},12.9)
  .to('.meter',{opacity:0,duration:.5},12.7)
  .fromTo('.arrive .bg',{scale:1.2},{scale:1,duration:1.4},12.9)
  .fromTo('.arrive .inner',{y:60,opacity:0},{y:0,opacity:1,duration:.8},13.3)
  .to('#cabin',{opacity:0,duration:.01},13.8)
  .to({},{duration:.7},14.3);
gsap.to('.arrive .inner',{y:-140,opacity:0,ease:'none',scrollTrigger:{trigger:'#unis',start:'top bottom',end:'top 35%',scrub:.8}});
gsap.to('.arrive .bg',{yPercent:12,scale:1.08,ease:'none',scrollTrigger:{trigger:'#unis',start:'top bottom',end:'top top',scrub:.8}});
ScrollTrigger.create({trigger:'#flight',start:'top top-=60',onToggle:s=>{}});
ScrollTrigger.create({trigger:'#unis',start:'top 80%',onEnter:()=>{},onLeaveBack:()=>{}});

/* ---------------- enter / exit helpers ---------------- */
function enterExit(el,{y=100,s=.96,start='top 94%',mid='top 58%',endS='bottom 42%',endE='bottom 6%'}={}){
  gsap.fromTo(el,{y,opacity:0,scale:s},{y:0,opacity:1,scale:1,ease:'none',scrollTrigger:{trigger:el,start,end:mid,scrub:.7}});
  gsap.to(el,{y:-y*.8,opacity:0,scale:s,ease:'none',immediateRender:false,scrollTrigger:{trigger:el,start:endS,end:endE,scrub:.7}});
}
function curtain(sec){
  gsap.fromTo(sec,{clipPath:'inset(7% 5% 0% 5% round 56px 56px 0px 0px)'},{clipPath:'inset(0% 0% 0% 0% round 0px 0px 0px 0px)',ease:'none',scrollTrigger:{trigger:sec,start:'top 98%',end:'top 35%',scrub:.7}});
}

/* ---------------- UNIVERSITIES ---------------- */
const mm=gsap.matchMedia();
mm.add('(min-width:761px)',()=>{
  const track=$('#track');
  const dist=()=>track.scrollWidth-innerWidth;
  const hz=gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#hs',start:'top top',end:()=>'+='+dist(),pin:true,scrub:.9,invalidateOnRefresh:true,anticipatePin:1,
    onUpdate:s=>gsap.set('#uprog',{scaleX:s.progress})}});
  const wire=()=>{};
  gsap.utils.toArray('.ucard:not(.intro)').forEach(c=>{
    gsap.fromTo(c.querySelector('img'),{xPercent:-8,scale:1.25},{xPercent:8,scale:1.25,ease:'none',scrollTrigger:{trigger:c,containerAnimation:hz,start:'left right',end:'right left',scrub:true}});
    gsap.fromTo(c,{y:80,rotate:2.5,opacity:.2},{y:0,rotate:0,opacity:1,ease:'none',scrollTrigger:{trigger:c,containerAnimation:hz,start:'left 105%',end:'left 62%',scrub:true}});
    gsap.to(c,{y:-40,opacity:.25,scale:.94,ease:'none',immediateRender:false,scrollTrigger:{trigger:c,containerAnimation:hz,start:'right 30%',end:'right -5%',scrub:true}});
  });
  gsap.to('#unis .bar,#unis > p',{opacity:0,ease:'none',scrollTrigger:{trigger:'#unis',start:'bottom 40%',end:'bottom 5%',scrub:true}});
});
mm.add('(max-width:760px)',()=>{
  $('#track').style.cssText='flex-direction:column;padding:0 20px';
  $('#hs').style.height='auto';
  $$('.ucard').forEach(c=>{c.style.flex='none';c.style.width='100%';c.style.height=c.classList.contains('intro')?'auto':'360px';enterExit(c,{y:60})});
  $('.bar').style.display='none';
});


/* ---------------- IELTS ---------------- */
const bandEl=$('#band');const targets=[8.5,8.0,7.5,8.0];const mods=$$('#mods .mod');
const small=innerWidth<=860;
ScrollTrigger.create({trigger:'#ielts',start:small?'top 65%':'top top',end:small?'bottom 70%':'bottom bottom',scrub:true,onUpdate:s=>{
  const p=gsap.utils.clamp(0,1,(s.progress-.08)/.74);
  bandEl.innerHTML=(5+3*p).toFixed(1)+'<sup>band</sup>';
  mods.forEach((m,i)=>{const v=4+(targets[i]-4)*p;m.querySelector('.v').textContent=v.toFixed(1);m.querySelector('i').style.transform='scaleX('+(v/9)+')'});
}});
gsap.fromTo('.ie .wrap',{opacity:0,y:120,scale:.95},{opacity:1,y:0,scale:1,ease:'none',scrollTrigger:{trigger:'#ielts',start:'top 92%',end:'top 25%',scrub:.7}});
gsap.to('.ie .wrap',{opacity:0,y:-110,scale:.96,ease:'none',immediateRender:false,scrollTrigger:{trigger:'#ielts',start:'bottom 78%',end:'bottom 22%',scrub:.7}});
gsap.from('#mods .mod',{x:90,opacity:0,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'#ielts',start:'top 60%'}});

/* ---------------- PROCESS / STATS / VOICES / CTA ---------------- */
enterExit('#process .wrap > .eyebrow',{y:40});enterExit('#process .h2',{y:70});
const line=$('#line');line.setAttribute('pathLength',100);$('.bgp').setAttribute('pathLength',100);
gsap.fromTo(line,{strokeDasharray:100,strokeDashoffset:100},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'#tl',start:'top 70%',end:'bottom 70%',scrub:true}});
gsap.utils.toArray('.st').forEach((s,i)=>{
  gsap.fromTo(s,{x:i%2?-90:90,opacity:0,rotateX:12},{x:0,opacity:1,rotateX:0,ease:'none',scrollTrigger:{trigger:s,start:'top 96%',end:'top 66%',scrub:.6}});
  gsap.to(s,{x:i%2?60:-60,opacity:0,ease:'none',immediateRender:false,scrollTrigger:{trigger:s,start:'bottom 30%',end:'bottom 2%',scrub:.6}});
});
/* ---------------- STUDENT SECTIONS ---------------- */
const UQ=(id,w=1100)=>`${AB}/stu/${id}.jpg`;
const SIMG={grp:'1522202176988-66273c2fd55f',lib:'1523240795612-9a054b0db644',fr:'1529156069898-49953e39b3ac',hall:'1519452635265-7b1fbfd1e4e0',map:'1488646953014-85cb44e25828',air:'1569154941061-e231b4725ef1',wing:'1436491865332-7a61a109cc05',caps:'1590012314607-cda9d9b699ae',café:'1543269865-cbf427effbad'};
const STU={
uk:{visa:'UK Student visa',offer:'CAS from your university',funds:'Maintenance funds in your bank statements',work:'Up to 20 hrs/week in term time (degree level)',post:'Graduate Route — typically 2 years to work after your degree'},
ireland:{visa:'Irish study visa + Stamp 2 permission',offer:'Offer letter + fee payment receipt',funds:'Proof of funds for living costs',work:'Up to 20 hrs/week in term, full-time in holidays',post:'Stay Back — typically 12–24 months depending on your level'},
france:{visa:'Long-stay student visa (VLS-TS) via Campus France',offer:'Campus France pre-enrolment + admission letter',funds:'Proof of monthly resources',work:'Up to about 964 hours a year alongside study',post:'Around 12 months to look for work after a Master’s'},
germany:{visa:'National (D) student visa',offer:'Admission letter (+ APS certificate for Indian students)',funds:'Blocked account (Sperrkonto) for living costs',work:'140 full days or 280 half days a year',post:'18 months to find a job after graduation'},
europe:{visa:'Student residence permit (rules vary by country)',offer:'University admission letter',funds:'Proof of funds per country rules',work:'Part-time rules vary by country',post:'Job-seeker permits exist in most — e.g. the Netherlands’ orientation year'},
usa:{visa:'F-1 visa (I-20, SEVIS fee, DS-160)',offer:'I-20 from your university',funds:'Financial documents covering year-one costs',work:'On-campus jobs up to 20 hrs/week in term',post:'OPT — 12 months, with a STEM extension available'},
canada:{visa:'Canadian study permit',offer:'Letter of acceptance from a designated institution',funds:'Proof of funds (GIC where applicable)',work:'Off-campus work up to 24 hrs/week during term (current rule)',post:'PGWP — up to 3 years depending on your programme'},
uae:{visa:'Student residence visa (sponsored by your university)',offer:'University admission + fee receipt',funds:'Sponsor / financial proof',work:'Needs a work permit — options are limited',post:'Graduates can explore long-term visa routes'},
korea:{visa:'D-2 student visa',offer:'Certificate of Admission',funds:'Bank balance certificate',work:'Part-time allowed with permission; hours depend on language level',post:'D-10 job-seeking visa after graduation'},
japan:{visa:'Student visa with Certificate of Eligibility (COE)',offer:'COE issued through your school',funds:'Bank / sponsor financial proof',work:'Up to 28 hrs/week with permission',post:'Up to a year of job-hunting stay after graduation'},
singapore:{visa:'Student’s Pass (ICA, via SOLAR)',offer:'In-Principle Approval from ICA',funds:'Proof of funds / tuition',work:'Limited part-time and internships — rules vary',post:'Employment Pass route once you have a job offer'},
malaysia:{visa:'Student Pass (via EMGS)',offer:'Offer letter + Visa Approval Letter',funds:'Proof of funds',work:'Limited part-time with permission',post:'Post-study options are limited — we guide you on current rules'},
australia:{visa:'Student visa (subclass 500)',offer:'Confirmation of Enrolment (CoE)',funds:'Proof of funds + genuine student statement',work:'Up to 48 hrs per fortnight in term',post:'Temporary Graduate visa (485) — typically 2–4 years'},
nz:{visa:'New Zealand student visa',offer:'Offer of Place + tuition payment',funds:'Proof of funds for living costs',work:'Up to 20 hrs/week in term (eligible courses)',post:'Post-study work visa — up to 3 years depending on level'}};
const pImgs=[SIMG.grp,SIMG.hall,SIMG.map,SIMG.lib,SIMG.air,SIMG.wing,null];
let STG=[],BEATS=[],KIT=[];
/* build static DOM once */
(function(){
  const nodes=$('#pnodes'),NS='http://www.w3.org/2000/svg';
  for(let i=0;i<7;i++){const a=(-90+i*(360/7))*Math.PI/180;const c=document.createElementNS(NS,'circle');c.setAttribute('cx',200+178*Math.cos(a));c.setAttribute('cy',200+178*Math.sin(a));c.setAttribute('r',8);nodes.appendChild(c);$('#pdots').appendChild(document.createElement('i'))}
  const lb=$('#lbeats'),dk=$('#deck');
  for(let i=0;i<4;i++){lb.insertAdjacentHTML('beforeend','<div class="beat"><small></small><h3></h3><p></p><span class="fact"></span></div>');dk.insertAdjacentHTML('beforeend','<div class="dcard"><img alt="" loading="lazy"><span></span></div>')}
  const kl=$('#klist');for(let i=0;i<8;i++)kl.insertAdjacentHTML('beforeend','<li><span class="ck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><div><b></b><small></small></div></li>');
})();
function renderStudent(c){
  const S=STU[c.k]||STU.uk,u0=(c.u||[])[0],uImg=((G.__UNI__||{})[u0]||{}).url||IMG[c.k];
  const test=c.test||'English test';
  STG=[
   ['12','months','Profile & goals','Map your marks, budget and dream course','A counsellor reviews your academics and goals, then shortlists the right courses in '+c.n+'.'],
   ['10','months','Test prep',test,'Coaching and mocks for '+test+' — run alongside your shortlist so nothing waits.'],
   ['8','months','Shortlist & apply','Universities in '+c.n,'Safe, match and reach options — applications, SOP and references prepared together.'],
   ['6','months','Offers arrive',S.offer,'Compare offers, scholarships and fees. You accept: '+S.offer+'.'],
   ['4','months','Funds & visa',S.visa,'Financial proof ('+S.funds.toLowerCase()+'), forms and interview prep for your '+S.visa+'.'],
   ['2','months','Pre-departure','Flights, stay and forex','Accommodation in '+c.city+', forex, insurance and a send-off briefing for you and your family.'],
   ['0','day one','Wheels down in '+c.city,'Welcome to '+c.n,'Airport pickup guidance, orientation week and your first day on campus. You made it.']];
  BEATS=[
   ['Week 1','Land & settle in '+c.city,'Orientation, bank account, SIM and getting your room sorted — we brief you before you fly.','Welcome week · new friends'],
   ['Month 1','Classes, campus & community','Meet your cohort, join clubs and find your study rhythm at '+(u0||'your university')+'.','Study groups · clubs'],
   ['Month 3','Part-time work & real life',S.work+'.','Earn while you learn'],
   ['After graduation','Your next step',S.post+'.','Stay & work after study']];
  KIT=[
   ['Valid passport','At least 6 months validity, with blank pages'],
   ['Academic documents','Transcripts, certificates and mark sheets'],
   [test+' score','Your official test report'],
   ['SOP, LORs & CV','Reviewed until they are application-ready'],
   [S.offer,'Your admission confirmation'],
   ['Proof of funds',S.funds],
   [S.visa,'Application, biometrics and interview prep'],
   ['Insurance & travel','Health cover, tickets and accommodation proof']];
  $('#kvisa').textContent='For '+c.n+' you will need: '+S.visa+'. We prepare every document with you.';
  $('#kt').textContent=KIT.length;
  $$('#klist li').forEach((li,i)=>{li.querySelector('b').textContent=KIT[i][0];li.querySelector('small').textContent=KIT[i][1]});
  $$('.beat').forEach((b,i)=>{const x=BEATS[i];b.querySelector('small').textContent=x[0];b.querySelector('h3').textContent=x[1];b.querySelector('p').textContent=x[2];b.querySelector('.fact').textContent=x[3]});
  const dimg=[uImg,UQ(SIMG.lib),UQ(SIMG.fr),UQ(SIMG.caps)],dl=['Your campus · '+c.n,'Study groups','Friends for life','Graduation day'];
  $$('.dcard').forEach((d,i)=>{const im=d.querySelector('img');im.src=dimg[i];im.onerror=()=>{im.onerror=null;im.src=IMG[c.k]};d.querySelector('span').textContent=dl[i]});
  G.__pimgs=pImgs.map((x,i)=>x?UQ(x,900):uImg);
  setStage(G.__stg||0,true);
}
let curStg=-1;
function setStage(i,force){
  if(!STG.length)return;i=Math.max(0,Math.min(6,i));if(i===curStg&&!force)return;curStg=i;G.__stg=i;
  const s=STG[i];
  const fill=()=>{$('#pmo').textContent=s[0];$('#pmu').textContent=s[1];$('#ptag').textContent=s[2];$('#pt').textContent=s[3];$('#pp').textContent=s[4]};
  if(force){fill()}else{gsap.to('.ptxt,.mo b',{opacity:0,y:-10,duration:.16,onComplete:()=>{fill();gsap.fromTo('.ptxt,.mo b',{opacity:0,y:12},{opacity:1,y:0,duration:.35,ease:'power2.out'})}})}
  const a=$('#pimg'),b=$('#pimg2');const front=a.dataset.f==='1'?b:a,back=front===a?b:a;
  front.src=(G.__pimgs||[])[i]||'';front.style.opacity=1;back.style.opacity=0;front.dataset.f='1';back.dataset.f='0';
  $$('#pnodes circle').forEach((n,k)=>n.classList.toggle('on',k<=i));$$('#pdots i').forEach((n,k)=>n.classList.toggle('on',k===i));
}
/* scroll animations */
(function(){
  const circ=1118.5;
  // 1) timeline dial
  const orb=$('#porb');
  ScrollTrigger.create({trigger:'#path',start:'top top',end:()=>'+='+innerHeight*4.2,pin:true,scrub:true,anticipatePin:1,invalidateOnRefresh:true,
    onUpdate:s=>{const p=s.progress,q=Math.min(1,p/.86);
      $('#pring').style.strokeDashoffset=circ*(1-q);
      const ang=(-90+360*q)*Math.PI/180,R=.89*($('.dial').offsetWidth/2)*1;orb.style.transform=`translate(${Math.cos(ang)*R}px,${Math.sin(ang)*R}px)`;
      setStage(Math.round(q*6));
      gsap.set('.pwrap',{opacity:p>.9?1-(p-.9)/.1:1,y:p>.9?-(p-.9)*400:0});}});
  gsap.fromTo('#path .pwrap',{opacity:0,y:60},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:'#path',start:'top 90%',end:'top 30%',scrub:.6}});
  // 2) life deck
  const cards=gsap.utils.toArray('.dcard'),beats=gsap.utils.toArray('.beat');
  cards.forEach((c,i)=>gsap.set(c,{zIndex:10-i,rotate:[-2,3,-3,2][i],y:i*8,scale:1-i*.025}));
  const ltl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'#life',start:'top top',end:()=>'+='+innerHeight*3.4,pin:true,scrub:.8,anticipatePin:1,invalidateOnRefresh:true}});
  beats.forEach((b,i)=>{
    const t=i;
    ltl.fromTo(b,{opacity:0,y:40},{opacity:1,y:0,duration:.35},t+.05);
    if(i<3){ltl.to(b,{opacity:0,y:-40,duration:.3},t+.7);ltl.to(cards[i],{x:'38%',y:'-12%',rotate:14,opacity:0,duration:.55},t+.6);
      for(let k=i+1;k<4;k++)ltl.to(cards[k],{y:(k-i-1)*8,scale:1-(k-i-1)*.025,rotate:0,duration:.55},t+.6)}
  });
  ltl.to('#life .lwrap',{opacity:0,y:-60,duration:.4},3.75);
  gsap.fromTo('#life .lwrap',{opacity:0,y:60},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:'#life',start:'top 90%',end:'top 30%',scrub:.6}});
  // 3) kit checklist
  const li=gsap.utils.toArray('#klist li');
  ScrollTrigger.create({trigger:'#kit',start:'top top',end:()=>'+='+innerHeight*3,pin:true,scrub:true,anticipatePin:1,invalidateOnRefresh:true,
    onUpdate:s=>{const p=s.progress,n=Math.min(8,Math.floor(p/.88*8.999));
      li.forEach((e,i)=>e.classList.toggle('on',i<n));$('#kn').textContent=n;$('#kbar').style.transform=`scaleX(${n/8})`;$('#kcta').classList.toggle('on',n>=8);
      gsap.set('.kwrap',{opacity:p>.94?1-(p-.94)/.06:1,y:p>.94?-(p-.94)*500:0});}});
  gsap.fromTo('#kit .kwrap',{opacity:0,y:60},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:'#kit',start:'top 90%',end:'top 30%',scrub:.6}});
})();


curtain('#stats');enterExit('#stats .wrap',{y:80});
$$('[data-n]').forEach(el=>{
  const n=+el.dataset.n,suf=el.dataset.s,o={v:0};
  ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:()=>gsap.to(o,{v:n,duration:1.8,ease:'power2.out',onUpdate:()=>{el.textContent=suf==='.5'?Math.round(o.v)+'.5':Math.round(o.v).toLocaleString()+suf}})});
});
enterExit('#voices .wrap',{y:70});
const mq=$('#mq');
gsap.fromTo(mq,{x:0},{x:()=>-(mq.scrollWidth-innerWidth+40),ease:'none',scrollTrigger:{trigger:'#voices',start:'top bottom',end:'bottom top',scrub:.8,invalidateOnRefresh:true}});
gsap.fromTo(mq,{opacity:0,y:80},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:'#voices',start:'top 90%',end:'top 50%',scrub:.6}});
curtain('#cta');
gsap.fromTo('.cbox',{y:120,opacity:0,scale:.94},{y:0,opacity:1,scale:1,ease:'none',scrollTrigger:{trigger:'.cbox',start:'top 98%',end:'top 55%',scrub:.7}});
if(document.readyState==='complete')ScrollTrigger.refresh();else onWin('load',()=>ScrollTrigger.refresh());


/* ---------- host integration ---------- */
ScrollTrigger.create({trigger:root,start:'top bottom',end:'bottom top',onToggle:s=>root.classList.toggle('live',s.isActive)});
root.classList.add('live');
{const lf=$('#leadForm');
 lf.addEventListener('submit',async e=>{e.preventDefault();
  const fd=Object.fromEntries(new FormData(lf));const btn=lf.querySelector('button');
  btn.disabled=true;btn.textContent='Sending…';
  const payload={...fd,country:state.k||'',source:'study-abroad-world'};
  try{
    if(opts.onLead)await opts.onLead(payload);
    else{const r=await fetch(opts.leadEndpoint||'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error('lead '+r.status)}
    btn.textContent="Thanks — we'll call you!";lf.reset();
  }catch(err){console.error(err);btn.textContent='Failed — try again';btn.disabled=false}
 });}
if(opts.initialCountry)setTimeout(()=>choose(opts.initialCountry),400);

const destroy=function(){
  cancelAnimationFrame(raf);
  cleanups.forEach(f=>{try{f()}catch(e){}});
  try{mm.revert()}catch(e){}
  ScrollTrigger.getAll().forEach(t=>{const e=t.trigger;if(e&&root.contains(e))t.kill(true)});
  try{gsap.killTweensOf(root.querySelectorAll('*'))}catch(e){}
  try{scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;(Array.isArray(m)?m:[m]).forEach(x=>{if(!x)return;for(const k in x){const v=x[k];if(v&&v.isTexture)v.dispose()}x.dispose&&x.dispose()})})}catch(e){}
  try{renderer.dispose();renderer.forceContextLoss()}catch(e){}
  root.innerHTML='';root.classList.remove('tw','live','picked','compact','ready');
};
destroy.changeCountry=()=>$('#change')&&$('#change').click();
return destroy;
}
