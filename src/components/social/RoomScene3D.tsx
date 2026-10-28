import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type RoomPerson = {
  id: string; room_id: string; user_uid: string; user_name: string;
  avatar_config?: any; pet_config?: any; reading_item?: string;
  study_status?: string; seat_index: number; session_started_at: string;
};
type Props = {
  roomType: 'cafe'|'classroom'|'nature'|'fireplace';
  roomId: string; people: RoomPerson[]; uid: string; entering: boolean;
  elapsed: (date: string) => string;
};
type OverlayPerson = { uid: string; name: string; x: number; y: number; timer: string; mine: boolean; breakMode: boolean };

const colors = {
  cafe: { floor: '#bd9874', wall: '#f1e3d0', trim: '#95694b', desk: '#a86f46', chair: '#80543d', accent: '#d7a55b' },
  classroom: { floor: '#c4b9a3', wall: '#e9eee8', trim: '#7b8c83', desk: '#b18c62', chair: '#58766d', accent: '#4c7777' },
  nature: { floor: '#8fb47a', wall: '#b8d8a8', trim: '#5f8b55', desk: '#a98054', chair: '#648d57', accent: '#e2c36f' },
  fireplace: { floor: '#806b61', wall: '#6d5960', trim: '#ad7f67', desk: '#875a43', chair: '#68453d', accent: '#f1a34d' },
};

function mat(color: string, roughness = 0.84) { return new THREE.MeshStandardMaterial({ color, roughness }); }
function box(parent: THREE.Object3D, size: [number,number,number], color: string, pos: [number,number,number], radius = 0) {
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, mat(color));
  mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function sphere(parent: THREE.Object3D, radius: number, color: string, pos: [number,number,number], scale?: [number,number,number]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), mat(color));
  mesh.position.set(...pos); if (scale) mesh.scale.set(...scale); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, color: string, pos: [number,number,number], rotation?: [number,number,number]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,10), mat(color));
  mesh.position.set(...pos); if (rotation) mesh.rotation.set(...rotation); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function addPlant(scene: THREE.Scene, x: number, z: number, leafy: boolean) {
  cylinder(scene, .14, .2, .45, '#9d6849', [x,.23,z]);
  for (let i=0;i<5;i++) sphere(scene, leafy ? .52 : .34, ['#477d53','#5b925e','#6ca66a'][i%3], [x+Math.sin(i*1.3)*.28, .8+(i%2)*.24, z+Math.cos(i*1.3)*.25], [1,.9,1]);
}
function addSeat(scene: THREE.Scene, x: number, z: number, c: typeof colors.cafe, kind: string) {
  if (kind === 'cafe') {
    // Compact round café table, with a proper chair pulled up to the near edge.
    cylinder(scene,.67,.67,.13,c.desk,[x,.86,z]);
    cylinder(scene,.12,.16,.72,c.trim,[x,.46,z]);
    cylinder(scene,.32,.32,.09,c.chair,[x,.52,z+.92]);
    cylinder(scene,.34,.34,.09,c.chair,[x,.9,z+1.12],[Math.PI/2,0,0]);
    for (const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]) cylinder(scene,.035,.045,.43,c.trim,[x+Math.cos(a)*.2,.25,z+.92+Math.sin(a)*.2]);
    // Coffee cup and saucer give the café its own visual language.
    cylinder(scene,.11,.13,.12,'#f7efe0',[x-.26,.98,z-.12]);
    cylinder(scene,.15,.15,.025,'#d7b78c',[x-.26,.91,z-.12]);
    return;
  }
  if (kind === 'fireplace') {
    // A low timber log bench and cushion, rather than classroom desks.
    cylinder(scene,.31,.34,1.35,'#8c573b',[x,.48,z+.92],[Math.PI/2,0,0]);
    box(scene,[.72,.13,.62],'#b7835b',[x,.62,z+.92]);
    box(scene,[.72,.54,.10],'#8d5c43',[x,.84,z+1.22]);
    box(scene,[.54,.06,.43,'#e3b18a',[x,.72,z+.88]);
    return;
  }
  // Classroom desks face the teaching wall; nature uses a small picnic table.
  const tableW = kind === 'nature' ? 1.05 : 1.3;
  box(scene,[tableW,.12,kind==='nature'?.78:1.05],c.desk,[x,.86,z]);
  for (const dx of [-tableW*.36,tableW*.36]) for (const dz of [-.28,.28]) box(scene,[.08,.82,.08],c.trim,[x+dx,.42,z+dz]);
  box(scene,[.62,.12,.62],c.chair,[x,.54,z+.9]);
  box(scene,[.62,.66,.10],c.chair,[x,.85,z+1.16]);
  for (const dx of [-.24,.24]) for (const dz of [.68,1.1]) box(scene,[.07,.5,.07],c.trim,[x+dx,.27,z+dz]);
}
function makeAvatar(person: RoomPerson, scene: THREE.Scene, target: THREE.Vector3, mine: boolean) {
  const cfg = person.avatar_config || {};
  const skin = typeof cfg.skin === 'string' ? cfg.skin : '#b87550';
  const hair = typeof cfg.hair === 'string' ? cfg.hair : '#29231f';
  const outfit = typeof cfg.outfit === 'string' ? cfg.outfit : '#416b82';
  const group = new THREE.Group(); scene.add(group);
  // Rounded, friendly cartoon proportions: head, torso, articulated arms and legs.
  sphere(group,.27,skin,[0,1.48,0],[.92,1.02,.88]);
  sphere(group,.245,hair,[0,1.66,-.035],[1.03,.58,.98]);
  const style = cfg.hairStyle || 'short';
  if (style === 'curly' || style === 'afro') for (let i=0;i<7;i++) sphere(group,.105,hair,[(i-3)*.105,1.77+(i%2)*.025,.02]);
  if (style === 'long') { sphere(group,.12,hair,[-.22,1.49,-.02],[.75,1.45,.72]); sphere(group,.12,hair,[.22,1.49,-.02],[.75,1.45,.72]); }
  if (style === 'bun') sphere(group,.12,hair,[0,1.89,-.04]);
  sphere(group,.034,'#30231f',[-.09,1.49,.232]); sphere(group,.034,'#30231f',[.09,1.49,.232]);
  sphere(group,.027,'#f7f1e9',[-.09,1.50,.253]); sphere(group,.027,'#f7f1e9',[.09,1.50,.253]);
  sphere(group,.028,'#9b5f4b',[0,1.42,.25]);
  // smile
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.065,.009,5,14,Math.PI),mat('#74453a'));
  smile.position.set(0,1.375,.244); smile.rotation.z=Math.PI; group.add(smile);
  if (cfg.glasses) {
    for (const x of [-.09,.09]) { const g = new THREE.Mesh(new THREE.TorusGeometry(.075,.012,5,16),mat('#342c2a')); g.position.set(x,1.49,.26); group.add(g); }
    box(group,[.07,.018,.018],'#342c2a',[0,1.49,.265]);
  }
  // neck and cosy top
  cylinder(group,.09,.11,.18,skin,[0,1.18,0]);
  const outfitStyle = cfg.outfitStyle || 'jumper';
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.22,.43,4,8),mat(outfit));
  torso.position.set(0,.91,0); torso.castShadow=true; group.add(torso);
  if (outfitStyle === 'hoodie') {
    sphere(group,.17,outfit,[0,1.2,-.15],[1,.92,.62]);
    box(group,[.025,.23,.018],'#d7d3c9',[0,.91,.22]);
    sphere(group,.025,'#e7dfd1',[-.07,1.02,.21]); sphere(group,.025,'#e7dfd1',[.07,1.02,.21]);
  } else if (outfitStyle === 'jacket') {
    box(group,[.095,.42,.035],'#f0e8db',[-.105,.94,.207]); box(group,[.095,.42,.035],'#f0e8db',[.105,.94,.207]);
    for(let i=0;i<3;i++) sphere(group,.018,'#d6b56d',[.015,.82+i*.11,.235]);
  } else if (outfitStyle === 'jumper') {
    cylinder(group,.145,.15,.075,outfit,[0,1.15,.02]);
    for(const side of [-1,1]) cylinder(group,.078,.08,.075,outfit,[side*.25,.76,.02],[0,0,side*.15]);
  }
  if (cfg.accessory === 'scarf') box(group,[.12,.31,.07],'#d8ad62',[.02,1.1,.19]);
  if (cfg.accessory === 'headphones') { const band=new THREE.Mesh(new THREE.TorusGeometry(.255,.035,7,20,Math.PI),mat('#252b31')); band.position.set(0,1.56,0); band.rotation.z=Math.PI; group.add(band); sphere(group,.055,'#252b31',[-.25,1.52,0]); sphere(group,.055,'#252b31',[.25,1.52,0]); }
  if (cfg.accessory === 'watch') { box(group,[.13,.045,.065],'#caa75d',[-.31,.83,.12]); box(group,[.075,.035,.055],'#26333b',[-.31,.86,.155]); }
  const pants = '#33414c', shoe = cfg.shoeColor || '#f0e8db';
  // Articulated limb parts switch between a relaxed seated pose and a standing walk cycle.
  const legParts: {side:number;thigh:THREE.Mesh;shin:THREE.Mesh;foot:THREE.Mesh}[]=[];
  const armParts: {side:number;upper:THREE.Mesh;forearm:THREE.Mesh;hand:THREE.Mesh}[]=[];
  for (const side of [-1,1]) {
    const hipX=side*.105;
    const thigh=cylinder(group,.085,.095,.31,pants,[hipX,.48,.03],[Math.PI/2,0,side*.08]);
    const shin=cylinder(group,.065,.08,.32,pants,[hipX,.28,.16],[.15,0,0]);
    const foot=sphere(group,.075,shoe,[hipX,.12,.18],[1,.55,1.35]);
    const upper=cylinder(group,.075,.065,.36,skin,[side*.25,1.0,.02],[0,0,side*.22]);
    const hand=sphere(group,.07,skin,[side*.31,.83,.05]);
    const forearm=cylinder(group,.065,.055,.18,skin,[side*.28,.78,-.01],[0,0,-side*.16]);
    legParts.push({side,thigh,shin,foot}); armParts.push({side,upper,forearm,hand});
  }
  // Reader item on the desktop.
  if (person.reading_item === 'laptop') {
    box(group,[.43,.025,.28],'#39434a',[0,.94,-.38]);
    box(group,[.41,.23,.025],'#26323a',[0,1.06,-.5]);
    box(group,[.34,.17,.008],'#8eb9c7',[0,1.06,-.482]);
  } else if (person.reading_item === 'book' || person.reading_item === 'notebook') {
    box(group,[.34,.045,.25],person.reading_item==='book'?'#b75c4f':'#e4d8bd',[0,.94,-.37]);
    box(group,[.012,.047,.25],'#f3e9d5',[0,.94,-.37]);
  } else {
    box(group,[.32,.025,.23],'#343b45',[0,.94,-.37]); box(group,[.29,.18,.01],'#9fc4ce',[0,1.03,-.37]);
  }
  const pet = person.pet_config;
  if (pet && pet.species) {
    const pc = pet.color || '#c69a72';
    sphere(group,.13,pc,[.48,.2,.4],[1.2,.8,1.4]); sphere(group,.085,pc,[.48,.32,.48]);
    if (pet.species==='cat' || pet.species==='owl') { sphere(group,.045,pc,[.42,.4,.47]); sphere(group,.045,pc,[.54,.4,.47]); }
    sphere(group,.018,'#30251f',[.45,.33,.55]); sphere(group,.018,'#30251f',[.51,.33,.55]);
  }
  group.position.copy(target); group.rotation.y = Math.PI; group.userData = { uid: person.user_uid, target: target.clone(), walking: false, seated: true, legs: legParts, arms: armParts, started: performance.now(), targetYaw: Math.PI, mine };
  return group;
}
function poseAvatar(group: THREE.Group, seated: boolean) {
  const data=group.userData;
  data.seated=seated;
  for(const l of (data.legs||[]) as {side:number;thigh:THREE.Mesh;shin:THREE.Mesh;foot:THREE.Mesh}[]) {
    const x=l.side*.105;
    if(seated){l.thigh.position.set(x,.48,.03);l.thigh.rotation.set(Math.PI/2,0,l.side*.08);l.shin.position.set(x,.28,.16);l.shin.rotation.set(.15,0,0);l.foot.position.set(x,.12,.18);l.foot.rotation.set(0,0,0);}
    else {l.thigh.position.set(x,.38,.02);l.thigh.rotation.set(0,0,0);l.shin.position.set(x,.17,.02);l.shin.rotation.set(0,0,0);l.foot.position.set(x,.045,.07);l.foot.rotation.set(0,0,0);}
  }
  for(const a of (data.arms||[]) as {side:number;upper:THREE.Mesh;forearm:THREE.Mesh;hand:THREE.Mesh}[]) {
    if(seated){a.upper.position.set(a.side*.25,.98,-.04);a.upper.rotation.set(.45,0,a.side*.18);a.forearm.position.set(a.side*.28,.82,-.2);a.forearm.rotation.set(.18,0,-a.side*.08);a.hand.position.set(a.side*.28,.78,-.32);}
    else {a.upper.position.set(a.side*.25,.98,.02);a.upper.rotation.set(0,0,a.side*.2);a.forearm.position.set(a.side*.28,.78,.02);a.forearm.rotation.set(0,0,-a.side*.16);a.hand.position.set(a.side*.29,.68,.04);}
  }
}

export function RoomScene3D({ roomType, roomId, people, uid, entering, elapsed }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer|null>(null);
  const sceneRef = useRef<THREE.Scene|null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera|null>(null);
  const doorRef = useRef<THREE.Group|null>(null);
  const modelsRef = useRef<Map<string,THREE.Group>>(new Map());
  const [labels,setLabels] = useState<OverlayPerson[]>([]);
  const [webglError,setWebglError] = useState(false);

  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { setWebglError(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    host.prepend(renderer.domElement);
    renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none';
    const scene = new THREE.Scene();
    const c = colors[roomType];
    scene.background = new THREE.Color(roomType==='nature'?'#d5e7d2':roomType==='fireplace'?'#d9c2b7':'#eee7dc');
    scene.fog = new THREE.Fog(scene.background, 32, 58);
    const camera = new THREE.PerspectiveCamera(42,1,.1,100);
    let azimuth = .15, elevation = .83, distance = 29;
    camera.userData.targetDistance = 29;
    const aim = new THREE.Vector3(0,0,0);
    const updateCamera = () => { camera.position.set(aim.x+Math.sin(azimuth)*Math.cos(elevation)*distance, aim.y+Math.sin(elevation)*distance, aim.z+Math.cos(azimuth)*Math.cos(elevation)*distance); camera.lookAt(aim); };
    updateCamera();
    scene.add(new THREE.HemisphereLight(0xfff7e8,0x66725e,2.1));
    const sun = new THREE.DirectionalLight(roomType==='fireplace'?0xffc18b:0xffedcf,2.8); sun.position.set(-8,18,12); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-18; sun.shadow.camera.right=18; sun.shadow.camera.top=18; sun.shadow.camera.bottom=-18; scene.add(sun);
    const fill = new THREE.DirectionalLight(roomType==='nature'?0xb9e4a8:0xc4dced,.8); fill.position.set(12,8,-8); scene.add(fill);
    // Room shell: a warm floor and two open-cut walls so the room reads like a dollhouse.
    box(scene,[23,.34,16],c.floor,[0,-.18,0]);
    for (let x=-11;x<11;x+=1) box(scene,[.018,.008,16],roomType==='nature'?'#a5c88c':roomType==='classroom'?'#c7d2c9':'#d6bda1',[x,.005,0]);
    if (roomType!=='nature') {
      box(scene,[23,5,.3],c.wall,[0,2.35,-7.9]); box(scene,[.3,5,16],c.wall,[-11.4,2.35,0]);
      box(scene,[23,.18,.35],c.trim,[0,4.9,-7.75]); box(scene,[.35,.18,16],c.trim,[-11.2,4.9,0]);
      // Big picture windows with crossbars and a deep sill.
      for (const x of [-7.6,-3.2,1.2,5.6]) {
        box(scene,[3.2,2.05,.12],roomType==='fireplace'?'#9fb6c3':'#a6d0df',[x,3.25,-7.69]);
        box(scene,[3.4,.12,.22],'#f5e9d6',[x,2.2,-7.58]); box(scene,[.12,2.15,.22],'#f5e9d6',[x,3.25,-7.58]);
        box(scene,[.09,2.05,.16],'#f5e9d6',[x,3.25,-7.57]); box(scene,[3.2,.09,.16],'#f5e9d6',[x,3.25,-7.57]);
      }
    }
    // Entrance on the open side: a framed, hinged door swings as the student walks in.
    const doorFrame = new THREE.Group(); doorFrame.position.set(10.15,0,6.35); scene.add(doorFrame);
    box(doorFrame,[.16,2.8,.16],c.trim,[-.55,1.4,0]); box(doorFrame,[.16,2.8,.16],c.trim,[.55,1.4,0]); box(doorFrame,[1.25,.16,.16],c.trim,[0,2.8,0]);
    const doorLeaf = new THREE.Group(); doorLeaf.position.set(-.48,0,.04); doorFrame.add(doorLeaf);
    box(doorLeaf,[.92,2.55,.09],roomType==='fireplace'?'#805542':roomType==='classroom'?'#8c6749':'#9a6b48',[.46,1.3,0]);
    box(doorLeaf,[.68,1.7,.035],roomType==='cafe'?'#d5b58b':'#b9a07f',[.46,1.48,.06]); sphere(doorLeaf,.055,'#d8b56f',[.79,1.2,.1]);
    doorRef.current=doorLeaf;
    // Theme landmarks.
    if (roomType==='classroom') {
      box(scene,[5.2,1.8,.2],'#294d4d',[-3.5,3.05,-7.55]); box(scene,[5.35,.13,.3],'#7e6044',[-3.5,2.1,-7.45]);
      for (let i=0;i<5;i++) sphere(scene,.1,'#f1e4bb',[6.8+Math.sin(i)*.2,4.5,-7.2]);
    } else if (roomType==='fireplace') {
      // A central stone hearth, surrounded by low log seating and warm ambient light.
      cylinder(scene,1.35,1.55,.34,'#a77a61',[0,.18,0]);
      cylinder(scene,1.08,1.08,.18,'#493432',[0,.43,0]);
      for (const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]) {
        const x=Math.cos(angle)*1.2,z=Math.sin(angle)*1.2;
        box(scene,[.95,.2,.3],'#89583f',[x,.38,z],[0,angle,0]);
      }
      const fireLight = new THREE.PointLight(0xff7c32,6,12); fireLight.position.set(0,1.25,0); scene.add(fireLight);
      for (let i=0;i<12;i++) { const angle=i*2.399, radius=.18+(i%3)*.12; const flame=sphere(scene,.13,['#ffb044','#f47a32','#ffe08a'][i%3],[Math.cos(angle)*radius,.72+(i%4)*.19,Math.sin(angle)*radius],[.75,1.7,.6]); flame.userData.flicker=Math.random()*4; }
      // Tree-stump stools and a few floor cushions create a campfire circle.
      for (let i=0;i<8;i++) { const a=i*Math.PI/4, x=Math.cos(a)*3.4,z=Math.sin(a)*3.1; cylinder(scene,.34,.38,.42,'#80513a',[x,.21,z]); cylinder(scene,.32,.32,.08,i%2?'#d2a078':'#bd8762',[x,.46,z]); }
    } else if (roomType==='nature') {
      for (const [x,z] of [[-10,-6],[-8,-4],[9,-6],[10,-2],[-10,4],[10,5]] as number[][]) addPlant(scene,x,z,true);
      // Park swings: timber A-frames, crossbar, hanging chains and wooden seats.
      for (const sx of [-5.5,5.5]) {
        for (const side of [-1,1]) cylinder(scene,.07,.1,3.2,'#806147',[sx+side*.72,1.58,-2.6],[0,0,side*.42]);
        cylinder(scene,.07,.07,1.7,'#806147',[sx,3.12,-2.6],[0,0,Math.PI/2]);
        for (const side of [-1,1]) cylinder(scene,.018,.018,1.7,'#9aa5a1',[sx+side*.28,2.12,-2.6]);
        box(scene,[.72,.12,.32],'#c49a68',[sx,.98,-2.6]);
      }
      // Picnic blankets, soft cushions and stepping stones on the grass.
      box(scene,[3.2,.045,2.2],'#e9d7bd',[-5,.045,3.4]);
      box(scene,[3.2,.05,2.2],'#b8c6a0',[-5,.07,3.4]);
      for (let i=0;i<4;i++) cylinder(scene,.18,.18,.12,['#d9a7a1','#e6d4b2','#a7c6b0','#d2bd8d'][i],[ -6.1+(i%2)*2.2,.16,2.7+Math.floor(i/2)*1.3 ]);
      for (let i=0;i<16;i++) sphere(scene,.06,['#e5d89d','#f3d5bc','#c8d8a4'][i%3],[-9+(i%8)*2.5,.06,4+Math.floor(i/8)*2],[1,.35,1]);
    } else {
      addPlant(scene,-9,-6,true); addPlant(scene,9,-6,true);
      box(scene,[2.1,.1,.7],'#e7d5b7',[-8,1.25,-6.8]);
      const bookColors = ['#bb6a50','#d6ad68','#6d968b','#6683a3'];
      for (let i=0;i<4;i++) box(scene,[.3,.8,.4],bookColors[i],[-8.65+i*.43,1.7,-6.8]);
    }
    // Fifty individually modelled desks, chairs, and reading spaces.
    for (let seat=1;seat<=50;seat++) {
      const col=(seat-1)%10, row=Math.floor((seat-1)/10);
      const x=(col-4.5)*2.05, z=(row-2)*2.1-.15;
      addSeat(scene,x,z,c,roomType);
      if (roomType==='cafe') { cylinder(scene,.045,.045,.05,'#f4ead7',[x-.38,.96,z-.1]); cylinder(scene,.045,.045,.05,'#d3a36a',[x-.38,.99,z-.1]); }
      if (roomType==='nature' && seat%4===0) sphere(scene,.1,'#79a66c',[x-.65,.18,z-.5],[1,.4,1]);
    }
    const floorMat = new THREE.Mesh(new THREE.PlaneGeometry(23,16),mat(c.floor)); floorMat.rotation.x=-Math.PI/2; floorMat.position.y=.012; floorMat.receiveShadow=true; scene.add(floorMat);
    const resize = () => { const w=Math.max(1,host.clientWidth), h=Math.max(1,host.clientHeight); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();
    let drag: {x:number;y:number}|null=null;
    const down=(e:PointerEvent)=>{drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture?.(e.pointerId)};
    const move=(e:PointerEvent)=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};azimuth-=dx*.006;elevation=Math.max(.35,Math.min(1.18,elevation+dy*.004));updateCamera()};
    const up=()=>{drag=null};
    const wheel=(e:WheelEvent)=>{distance=Math.max(20,Math.min(38,distance+e.deltaY*.025));camera.userData.targetDistance=distance;updateCamera();e.preventDefault()};
    renderer.domElement.addEventListener('pointerdown',down); renderer.domElement.addEventListener('pointermove',move); renderer.domElement.addEventListener('pointerup',up); renderer.domElement.addEventListener('pointercancel',up); renderer.domElement.addEventListener('wheel',wheel,{passive:false});
    rendererRef.current=renderer; sceneRef.current=scene; cameraRef.current=camera;
    let frame=0, alive=true;
    const animate=(time:number)=>{if(!alive)return;frame++;const targetDistance=Number(camera.userData.targetDistance||29);if(!drag){distance+=(targetDistance-distance)*.035;updateCamera();}modelsRef.current.forEach(g=>{const d=g.userData;if(d.walking){const p=Math.min(1,(time-d.started)/2600);const phase=(time-d.started)/115;for(const l of d.legs||[]){const swing=Math.sin(phase+(l.side<0?0:Math.PI))*.28;l.thigh.rotation.z=swing;l.shin.rotation.z=-swing*.72;l.foot.rotation.z=swing*.38;}for(const a of d.arms||[]){const swing=Math.sin(phase+(a.side<0?Math.PI:0))*.18;a.upper.rotation.z=a.side*.18+swing;a.forearm.rotation.z=-a.side*.16-swing*.5;}g.position.lerpVectors(d.start||d.target,d.target,p);g.rotation.y=d.targetYaw*(.15+.85*p);if(p>=1){d.walking=false;poseAvatar(g,true);}}g.position.y=.02+Math.sin(time*.002+(d.phase||0))*.008;});scene.traverse(o=>{if(o.userData.flicker!==undefined){const s=1+Math.sin(time*.009+o.userData.flicker)*.18;o.scale.y=s*1.7;}});if(doorRef.current){const d=doorRef.current;const target=d.userData.open?-1.15:0;d.rotation.y+=(target-d.rotation.y)*.1;}renderer.render(scene,camera);
      if(frame%8===0){const next:OverlayPerson[]=[];for(const p of peopleRef.current){if(p.room_id!==roomId)continue;const model=modelsRef.current.get(p.user_uid);if(!model)continue;const v=model.position.clone().add(new THREE.Vector3(0,2.05,0)).project(camera);next.push({uid:p.user_uid,name:p.user_name,x:(v.x*.5+.5)*host.clientWidth,y:(-.5*v.y+.5)*host.clientHeight,timer:elapsed(p.session_started_at),mine:p.user_uid===uid,breakMode:p.study_status==='break'});}setLabels(next);}
      requestAnimationFrame(animate);
    };
    const raf=requestAnimationFrame(animate);
    return()=>{alive=false;cancelAnimationFrame(raf);ro.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);renderer.domElement.removeEventListener('wheel',wheel);renderer.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();}});modelsRef.current.clear();rendererRef.current=null;sceneRef.current=null;cameraRef.current=null;doorRef.current=null;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomType, roomId]);

  useEffect(() => { if (doorRef.current) doorRef.current.userData.open = entering; if (cameraRef.current) cameraRef.current.userData.targetDistance = entering ? 23 : 29; }, [entering]);

  const peopleRef = useRef(people); peopleRef.current = people;
  const hasSeenRoomRosterRef = useRef(false);
  useEffect(() => {
    const scene=sceneRef.current;if(!scene)return;
    const map=modelsRef.current;const active=people.filter(p=>p.room_id===roomId);
    const ids=new Set(active.map(p=>p.user_uid));
    for(const [id,model] of map)if(!ids.has(id)){scene.remove(model);map.delete(id);}
    for(const p of active){const targetSeat=(p.seat_index-1),col=targetSeat%10,row=Math.floor(targetSeat/10);const target=new THREE.Vector3((col-4.5)*2.05,.03,(row-2)*2.1+.72);let model=map.get(p.user_uid);
      if(!model){
        model=makeAvatar(p,scene,target,p.user_uid===uid); map.set(p.user_uid,model);
        // First snapshot is the existing room roster; animate only genuine arrivals after it.
        const firstSnapshot = !hasSeenRoomRosterRef.current;
        if (!firstSnapshot && (p.user_uid===uid ? entering : true)) {
          model.userData.start=new THREE.Vector3(9,.03,6.5); model.position.copy(model.userData.start); model.rotation.y=0;
          model.userData.walking=true; poseAvatar(model,false); model.userData.started=performance.now();
          model.userData.target=target.clone(); model.userData.targetYaw=Math.PI;
          if (doorRef.current) doorRef.current.userData.open=true;
        }
      }
      else if(!model.userData.walking) {model.userData.target.copy(target);}
    }
    hasSeenRoomRosterRef.current = true;
  },[people,roomId,uid,entering]);

  return <div className="room3d-root" style={{position:'relative',width:'100%',height:'clamp(360px,58vh,680px)',minHeight:360,borderRadius:24,overflow:'hidden',background:'linear-gradient(135deg,#e9e2d8,#b4c4bb)',boxShadow:'inset 0 0 0 1px #ffffff80'}}>
    <style>{`.room3d-label{position:absolute;z-index:4;transform:translate(-50%,-100%);min-width:48px;max-width:74px;text-align:center;padding:4px 4px;border-radius:9px;background:#fffdf2e8;border:1px solid #fff;box-shadow:0 4px 12px #2e342a20;color:#25333a;font-size:9px;line-height:1.2;pointer-events:none;white-space:nowrap;overflow:hidden}.room3d-label strong{display:block;font-size:10px;overflow:hidden;text-overflow:ellipsis}.room3d-label span{display:block;color:#64736f;font-variant-numeric:tabular-nums}.room3d-label.mine{background:#253c47ed;color:#fff;border-color:#b4d9cf}.room3d-label.mine span{color:#d9eee8}.room3d-label span{font-size:8px}.room3d-hint{position:absolute;bottom:12px;left:12px;z-index:5;border-radius:999px;background:#172d36d9;color:#f6f4e9;padding:7px 11px;font-size:10px;letter-spacing:.02em;pointer-events:none}.room3d-error{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;background:#f0e8db;color:#34434a}.room3d-fallback{position:absolute;inset:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(10,minmax(0,1fr));gap:4px;padding:12px;background:linear-gradient(145deg,#e9d9c2,#b7c8b1);overflow:auto}.room3d-fallback-person{display:flex;align-items:center;justify-content:center;flex-direction:column;border-radius:9px;background:#fff9;border:1px solid #fff8;font-size:9px;min-height:24px;color:#34434a}.room3d-fallback-person b{font-size:10px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.room3d-fallback-person span{font-variant-numeric:tabular-nums;font-size:8px}`}</style>
    <div ref={hostRef} style={{position:'absolute',inset:0}} />
    {webglError&&<><div className="room3d-error">3D view is unavailable here. Showing a lightweight room roster instead.</div><div className="room3d-fallback">{people.filter(p=>p.room_id===roomId).map(p=><div key={p.user_uid} className="room3d-fallback-person"><b>{p.user_uid===uid?'You':p.user_name.split(' ')[0]}</b><span>{elapsed(p.session_started_at)}</span></div>)}</div></>}
    {!webglError&&labels.map(p=><div key={p.uid} className={'room3d-label'+(p.mine?' mine':'')} style={{left:p.x,top:Math.max(56,p.y)}}><strong>{p.mine?'You':p.name.split(' ')[0]}</strong><span>{p.breakMode?'On break · ':''}{p.timer}</span></div>)}
    <div className="room3d-hint">3D room · drag to look around · scroll to zoom</div>
  </div>;
}
