const ORIGIN={name:'Mumbai',lat:19.076,lon:72.878};
const FIELDS='Business · Data & AI · Engineering · Health';
const COUNTRIES=[
{k:'uk',n:'United Kingdom',s:'UK',lat:51.5,lon:-0.12,city:'London',url:'/destinations/uk',test:'IELTS · UKVI',u:['University of Oxford','University of Cambridge','University College London','Imperial College London','University of Manchester','University of Edinburgh','King\'s College London']},
{k:'ireland',n:'Ireland',s:'Ireland',lat:53.35,lon:-6.26,city:'Dublin',url:'/destinations/ireland',test:'IELTS · PTE',u:['Trinity College Dublin','University College Dublin','University of Galway','University College Cork','Dublin City University','University of Limerick']},
{k:'france',n:'France',s:'France',lat:48.86,lon:2.35,city:'Paris',url:'/destinations/france',test:'IELTS · TCF / DELF',u:['Sorbonne Université','Université PSL','Institut Polytechnique de Paris','Sciences Po','HEC Paris','Université Paris-Saclay']},
{k:'germany',n:'Germany',s:'Germany',lat:52.52,lon:13.4,city:'Berlin',url:'/destinations/germany',test:'IELTS · TestDaF',u:['Technical University of Munich','LMU Munich','Heidelberg University','TU Berlin','RWTH Aachen','Humboldt University of Berlin']},
{k:'europe',n:'Other Europe',s:'Europe',lat:50.08,lon:14.43,city:'Prague',url:'',test:'IELTS · Local language',u:['University of Amsterdam','TU Delft','KU Leuven','ETH Zurich','Politecnico di Milano','Lund University']},
{k:'usa',n:'USA',s:'USA',lat:40.71,lon:-74.0,city:'New York',url:'/destinations/usa',test:'TOEFL · IELTS · GRE / SAT',u:['Massachusetts Institute of Technology','Stanford University','Harvard University','Columbia University','UC Berkeley','New York University','Carnegie Mellon University']},
{k:'canada',n:'Canada',s:'Canada',lat:43.65,lon:-79.38,city:'Toronto',url:'/destinations/canada',test:'IELTS Academic',u:['University of Toronto','University of British Columbia','McGill University','University of Waterloo','University of Alberta','McMaster University']},
{k:'uae',n:'UAE',s:'UAE',lat:25.2,lon:55.27,city:'Dubai',url:'/destinations/dubai',test:'IELTS · EmSAT',u:['Khalifa University','NYU Abu Dhabi','American University of Sharjah','Heriot-Watt University Dubai','Middlesex University Dubai','BITS Pilani Dubai']},
{k:'korea',n:'South Korea',s:'Korea',lat:37.57,lon:126.98,city:'Seoul',url:'',test:'TOPIK · IELTS',u:['Seoul National University','KAIST','Yonsei University','Korea University','POSTECH','Sungkyunkwan University']},
{k:'japan',n:'Japan',s:'Japan',lat:35.68,lon:139.69,city:'Tokyo',url:'',test:'JLPT · EJU · IELTS',u:['University of Tokyo','Kyoto University','Osaka University','Waseda University','Keio University','Tohoku University']},
{k:'singapore',n:'Singapore',s:'Singapore',lat:1.29,lon:103.85,city:'Singapore',url:'/destinations/singapore',test:'IELTS · TOEFL',u:['National University of Singapore','Nanyang Technological University','Singapore Management University','SUTD','Singapore Institute of Technology']},
{k:'malaysia',n:'Malaysia',s:'Malaysia',lat:3.14,lon:101.69,city:'Kuala Lumpur',url:'',test:'IELTS · MUET',u:['Universiti Malaya','Universiti Teknologi Malaysia','Universiti Kebangsaan Malaysia','Monash University Malaysia','Taylor\'s University','Sunway University']},
{k:'australia',n:'Australia',s:'Australia',lat:-33.87,lon:151.21,city:'Sydney',url:'/destinations/australia',test:'IELTS · PTE',u:['University of Melbourne','University of Sydney','Australian National University','UNSW Sydney','Monash University','University of Queensland']},
{k:'nz',n:'New Zealand',s:'New Zealand',lat:-36.85,lon:174.76,city:'Auckland',url:'/destinations/new-zealand',test:'IELTS Academic',u:['University of Auckland','University of Otago','Victoria University of Wellington','University of Canterbury','Massey University','University of Waikato']}
];
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {toCreasedNormals} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
window.gsap=gsap;window.ScrollTrigger=ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
/* The source page carried its own <nav>; here the site header does that job, so the three
   cosmetic class toggles below land on a detached node rather than being deleted — the
   timeline stays identical to the original. */
const NAV=document.getElementById('nav')||document.createElement('div');
let rafId=0;
const done=()=>$('#loading')?.classList.add('done');
const IMG={"uk":"/assets/img/home-v4/uk.jpg","ireland":"/assets/img/home-v4/ireland.jpg","france":"/assets/img/home-v4/france.jpg","germany":"/assets/img/home-v4/germany.jpg","europe":"/assets/img/home-v4/europe.jpg","usa":"/assets/img/home-v4/usa.jpg","canada":"/assets/img/home-v4/canada.jpg","uae":"/assets/img/home-v4/uae.jpg","korea":"/assets/img/home-v4/korea.jpg","japan":"/assets/img/home-v4/japan.jpg","singapore":"/assets/img/home-v4/singapore.jpg","malaysia":"/assets/img/home-v4/malaysia.jpg","australia":"/assets/img/home-v4/australia.jpg","nz":"/assets/img/home-v4/nz.jpg"};

/* ---------- smooth scroll (locked until a country is chosen) ---------- */
const lenis=new Lenis({lerp:.075,wheelMultiplier:.9,touchMultiplier:1.4,smoothWheel:true});
window.lenis=lenis;lenis.on('scroll',ScrollTrigger.update);
const tick=t=>lenis.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
lenis.stop();
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const h=a.getAttribute('href');if(!h||h.charAt(0)!=='#'||h.length<2)return;const t=document.getElementById(h.slice(1));if(t&&t.id){e.preventDefault();if(!state.k){shake();return}lenis.scrollTo(t,{duration:2.4,easing:x=>1-Math.pow(1-x,4)})}}));
const logoImg=$('#logoimg');
if(logoImg){
logoImg.addEventListener('load',()=>{logoImg.style.display='block';$('.logo .mark').style.display='none'});
if(logoImg.complete&&logoImg.naturalWidth)logoImg.dispatchEvent(new Event('load'));
}

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
/* The drawing box is the canvas, not the window: the site header takes the top of the
   screen, so window height would stretch the globe and misplace every pin. */
const VW=()=>canvas.clientWidth||innerWidth,VH=()=>canvas.clientHeight||innerHeight;
const asp=()=>VW()/VH();const mobile=()=>innerWidth<760||asp()<1.25;
function resize(){renderer.setSize(VW(),VH(),false);camera.aspect=VW()/VH();camera.updateProjectionMatrix()}
addEventListener('resize',resize);
/* The canvas can change height without the window doing so — the header is shorter on a
   phone, and its height is published as --v4-top after mount. */
new ResizeObserver(resize).observe(canvas);
resize();
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
const B='https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/';
const W='https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/';
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
new GLTFLoader().load('/assets/models/a350.glb',g=>{
  g.scene.traverse(o=>{if(o.isMesh){try{o.geometry=toCreasedNormals(o.geometry,Math.PI/3.2)}catch(e){}o.material.envMapIntensity=1;if(o.material.map){o.material.map.anisotropy=maxA;o.material.map.needsUpdate=true}o.material.roughness=Math.min(o.material.roughness??.5,.5);o.material.metalness=Math.max(o.material.metalness??0,.15)}});
  planeG.add(g.scene);
  try{crispWindows(g.scene)}catch(err){console.error('windows',err)}
  done();ScrollTrigger.refresh();
},undefined,e=>{console.error('[home-v4] aircraft model failed',e);done()});
/* Whatever happens to the model, the page must become usable. */
setTimeout(done,8000);


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
    o.b.style.transform=`translate(${(W1.x*.5+.5)*VW()}px,${(-W1.y*.5+.5)*VH()}px)`;
    o.b.classList.toggle('on',o.c.k===state.k);
  });
}
function frame(){
  rafId=requestAnimationFrame(frame);
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
  atmo.visible=t<.5;
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
const GEN=['photo-1519452575417-564c1401ecc0','photo-1541339907198-e08756dedf3f','photo-1434030216411-0b793f4b4173','photo-1488190211105-8b0e65b80b4e','photo-1454165804606-c3d57bc86b40','photo-1503676260728-1c00da094a0b'].map(i=>`https://images.unsplash.com/${i}?w=900&q=70&auto=format&fit=crop`);
function render(c){
  $('#pickedName').textContent=c.n;$('#cname').textContent=c.n;
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
  const ex=$('#explore');ex.textContent='Explore '+c.n;ex.href=c.url||'#unis';ex.removeAttribute('target');ex.removeAttribute('rel');
  $('#uni-eyebrow').textContent='Destination '+c.s;
  $('#uni-lead').textContent=c.u.length+' universities in '+c.n+' we place students in. Keep scrolling →';
  const track=$('#track');track.querySelectorAll('.ucard:not(.intro)').forEach(n=>n.remove());
  const outro=track.querySelector('.outro');
  c.u.forEach((u,i)=>{
    const a=document.createElement('article');a.className='ucard';
    a.innerHTML=`<span class="no">0${i+1}</span><img loading="lazy" alt="" src="${i===0?IMG[c.k]:GEN[(i-1)%GEN.length]}"><div class="in"><h3></h3><small></small><div class="chips"><span></span><span>Shortlist with us</span><span>Intake: check</span></div></div>`;
    a.querySelector('h3').textContent=u;a.querySelector('small').textContent=c.city+' · '+c.n;a.querySelector('.chips span').textContent=c.city;
    track.insertBefore(a,outro);
  });
  $('#out-t').textContent='Not on the list?';
  $('#out-p').textContent='We shortlist universities in '+c.n+' by your profile, budget and goals.';
  $('#ie-also').textContent='Tests for '+c.n+': '+c.test;
  $$('.chip').forEach(ch=>ch.classList.toggle('on',ch.dataset.k===c.k));
  $$('.cdest').forEach(e=>e.textContent=c.n);
  ScrollTrigger.refresh();
}
function choose(k){
  const c=COUNTRIES.find(x=>x.k===k);if(!c)return;
  const first=!state.k;state.k=k;state.c=c;
  render(c);buildArc();
  // destination ring
  ring.visible=true;ring.position.copy(ll(c.lat,c.lon,R*1.006));ring.lookAt(ring.position.clone().multiplyScalar(2));
  gsap.fromTo('#pickedBox',{opacity:0,y:20},{opacity:1,y:0,duration:.8,delay:.5});
  gsap.fromTo('#cname',{opacity:0,y:40,letterSpacing:'.5em'},{opacity:1,y:0,letterSpacing:'.12em',duration:1.4,ease:'power3.out',delay:.3});
  document.documentElement.classList.add('picked');$('#hint').firstChild.textContent='Scroll to take off';
  lenis.start();
}
$('#change').addEventListener('click',()=>{lenis.start();lenis.scrollTo(0,{duration:2.6,easing:x=>1-Math.pow(1-x,4),onComplete:()=>input.focus()})});
if(location.hash.startsWith('#c=')){setTimeout(()=>choose(location.hash.slice(3)),400)}

/* ---------------- FLIGHT TIMELINE ---------------- */
const altEl=$('#alt');
const fl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'#flight',start:'top top',end:'bottom bottom',scrub:1.1,
  onUpdate:s=>{
    const u=fl.time();
    st.speed=0;
    st.show=u<6.9;canvas.style.visibility=u<6.9?'visible':'hidden';
    const dk=u>4.3&&u<12.9;NAV.classList.toggle('ondark',dk);$('.meter').classList.toggle('dk',dk);const ui=u<.9;$('#panel').style.pointerEvents=ui?'auto':'none';$('#pins').style.pointerEvents=ui?'auto':'none';
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
ScrollTrigger.create({trigger:'#flight',start:'top top-=60',onToggle:s=>NAV.classList.toggle('solid',false)});
ScrollTrigger.create({trigger:'#unis',start:'top 80%',onEnter:()=>NAV.classList.add('solid'),onLeaveBack:()=>NAV.classList.remove('solid')});

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
addEventListener('load',()=>ScrollTrigger.refresh());


/* Added by the port. The source page never navigated away from itself; this one can, and
   everything below keeps running against a detached DOM if it is not stopped. Lenis matters
   most: created stopped, it swallows every wheel and touch event site-wide. */
window.__v4teardown = () => {
  try { ScrollTrigger.getAll().forEach(t => t.kill()); } catch {}
  try { mm.revert(); } catch {}
  try { gsap.ticker.remove(tick); } catch {}
  try { lenis.destroy(); } catch {}
  try { removeEventListener('resize', resize); } catch {}
  try { renderer.dispose(); renderer.forceContextLoss(); } catch {}
  try { cancelAnimationFrame(rafId); } catch {}
  document.documentElement.classList.remove('picked');
  delete window.lenis; delete window.gsap; delete window.ScrollTrigger; delete window.__v4ready;
  delete window.__v4teardown;
};

/* Added by the port: a module that half-runs is otherwise indistinguishable from one
   that ran and did nothing. */
window.__v4ready = true;
