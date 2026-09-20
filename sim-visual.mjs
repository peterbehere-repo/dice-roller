// Runs one throw per type and dumps final dice transforms + wall boxes as JSON
import * as CANNON from 'cannon-es';
import fs from 'fs';
const src = fs.readFileSync('/tmp/dr-repo/index.html','utf8');
const grab = n => { const m = src.match(new RegExp(`function ${n}\\b[\\s\\S]*?\\n}\\n`)); if(!m) throw new Error('missing '+n); return m[0]; };
class V3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  sub(v){return new V3(this.x-v.x,this.y-v.y,this.z-v.z);}
  subVectors(a,b){return this.copy(a).sub(b);}
  cross(v){return new V3(this.y*v.z-this.z*v.y,this.z*v.x-this.x*v.z,this.x*v.y-this.y*v.x);}
  crossVectors(a,b){return this.copy(a).cross(b);}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;}
  length(){return Math.hypot(this.x,this.y,this.z);}
  lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
  normalize(){const l=this.length();return l>1e-9?this.set(this.x/l,this.y/l,this.z/l):this;}
  negate(){this.x=-this.x;this.y=-this.y;this.z=-this.z;return this;}
  clone(){return new V3(this.x,this.y,this.z);}
  getComponent(i){return i===0?this.x:i===1?this.y:this.z;}
  applyMatrix4(m){const e=m.elements;const x=this.x,y=this.y,z=this.z;
    this.x=e[0]*x+e[4]*y+e[8]*z;this.y=e[1]*x+e[5]*y+e[9]*z;this.z=e[2]*x+e[6]*y+e[10]*z;return this;}
  applyQuaternion(q){const x=this.x,y=this.y,z=this.z;const qx=q.x,qy=q.y,qz=q.z,qw=q.w;
    const ix=qw*x+qy*z-qz*y, iy=qw*y+qz*x-qx*z, iz=qw*z+qx*y-qy*x, iw=-qx*x-qy*y-qz*z;
    this.x=ix*qw+iw*-qx+iy*-qz-iz*-qy; this.y=iy*qw+iw*-qy+iz*-qx+ix*-qz; this.z=iz*qw+iw*-qz+ix*-qy+iy*-qx; return this;}
}
class QuatS { constructor(x=0,y=0,z=0,w=1){this.x=x;this.y=y;this.z=z;this.w=w;}
  copy(q){this.x=q.x;this.y=q.y;this.z=q.z;this.w=q.w;return this;}
  setFromEuler(x,y,z){const c1=Math.cos(x/2),c2=Math.cos(y/2),c3=Math.cos(z/2),s1=Math.sin(x/2),s2=Math.sin(y/2),s3=Math.sin(z/2);
    this.x=s1*c2*c3-c1*s2*s3;this.y=c1*s2*c3+s1*c2*s3;this.z=c1*c2*s3+s1*s2*c3;this.w=c1*c2*c3-s1*s2*s3;return this;}
}
class M4S { constructor(){this.elements=new Float32Array(16);}
  makeRotationFromQuaternion(q){const{x,y,z,w}=q;const x2=x+x,y2=y+y,z2=z+z;
    const xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
    this.elements.set([1-(yy+zz),xy+wz,xz-wy,0, xy-wz,1-(xx+zz),yz+wx,0, xz+wy,yz-wx,1-(xx+yy),0, 0,0,0,1]);
    return this;}
}
const THREE = { Vector3: V3, Quaternion: QuatS, Matrix4: M4S };
const geomSrc = '\nclass V3 {\n  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}\n  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}\n  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}\n  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}\n  sub(v){return new V3(this.x-v.x,this.y-v.y,this.z-v.z);}\n  subVectors(a,b){return this.copy(a).sub(b);}\n  cross(v){return new V3(this.y*v.z-this.z*v.y,this.z*v.x-this.x*v.z,this.x*v.y-this.y*v.x);}\n  crossVectors(a,b){return this.copy(a).cross(b);}\n  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;}\n  length(){return Math.hypot(this.x,this.y,this.z);}\n  lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}\n  normalize(){const l=this.length();return l>1e-9?this.set(this.x/l,this.y/l,this.z/l):this;}\n  negate(){this.x=-this.x;this.y=-this.y;this.z=-this.z;return this;}\n  clone(){return new V3(this.x,this.y,this.z);}\n  getComponent(i){return i===0?this.x:i===1?this.y:this.z;}\n  applyMatrix4(m){const e=m.elements;const x=this.x,y=this.y,z=this.z;\n    this.x=e[0]*x+e[4]*y+e[8]*z;this.y=e[1]*x+e[5]*y+e[9]*z;this.z=e[2]*x+e[6]*y+e[10]*z;return this;}\n}\n\nconst THREE = { Vector3: V3 };\nconst PHI=(1+Math.sqrt(5))/2;\n' + grab('icosaDirs') + '\n' + grab('dodecaDirs') + '\n'
  + grab('facesFromCenters') + '\n' + grab('lexCompareNormals') + '\n'
  + ['d4Data','d8Data','d10Data','d12Data','d20Data'].map(grab).join('\n') + '\n'
  + grab('satOverlap') + '\n'
  + 'function faceNormals(verts,faces){return faces.map(f=>{const A=new V3(...verts[f[0]]),B=new V3(...verts[f[1]]),C=new V3(...verts[f[2]]);return B.sub(A).cross(C.sub(A)).normalize();});}\n'
  + 'function buildTypeStub(sides){\n  const scale={4:1,6:1,8:1.02,10:1,12:1,20:1.04}[sides];\n'
  + '  const data={4:d4Data,8:d8Data,10:d10Data,12:d12Data,20:d20Data}[sides](scale);\n'
  + '  return { values:data.values, verts:data.verts, faces:data.faces };\n}\n'
  + 'export { satOverlap, buildTypeStub };\n';
fs.writeFileSync('/tmp/geom2.mjs', geomSrc);
const { buildTypeStub } = await import('/tmp/geom2.mjs');

let rngState = 777;
const rand = () => { rngState |= 0; rngState = rngState + 0x6D2B79F5 | 0; let t = Math.imul(rngState ^ rngState >>> 15, 1 | rngState);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

const TYPES = {};
for (const s of [4,6,8,10,12,20]) TYPES[s] = s===6 ? {} : buildTypeStub(s);
function shapeFor(sides){
  if(sides===6) return new CANNON.Box(new CANNON.Vec3(.5,.5,.5));
  return new CANNON.ConvexPolyhedron({ vertices:TYPES[sides].verts.map(v=>new CANNON.Vec3(...v)), faces:TYPES[sides].faces });
}
const world = new CANNON.World({ gravity:new CANNON.Vec3(0,-24,0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 30;
world.defaultContactMaterial.friction = 0.35;
world.defaultContactMaterial.restitution = 0.4;
const dieMat = new CANNON.Material('die'), groundMat = new CANNON.Material('ground'), wallPhysMat = new CANNON.Material('wall');
world.addContactMaterial(new CANNON.ContactMaterial(dieMat, groundMat, { friction:0.7, restitution:0.2 }));
world.addContactMaterial(new CANNON.ContactMaterial(dieMat, wallPhysMat, { friction:0.12, restitution:0.5 }));
world.addContactMaterial(new CANNON.ContactMaterial(dieMat, dieMat, { friction:0.08, restitution:0.45, contactEquationStiffness:5e8, contactEquationRelaxation:2 }));
const floor = new CANNON.Body({ mass:0, shape:new CANNON.Plane(), material:groundMat });
floor.quaternion.setFromEuler(-Math.PI/2,0,0); world.addBody(floor);
for (const [w,h,d,x,y,z] of [
  [24,1.6,0.5,0,0.8,-13.25],[0.5,1.6,27.5,-11.75,0.8,0],[0.5,1.6,27.5,11.75,0.8,0],[24,1.6,0.5,0,0.8,13.75]
]) { const b = new CANNON.Body({ mass:0, shape:new CANNON.Box(new CANNON.Vec3(w/2,h/2,d/2)), material:wallPhysMat });
  b.position.set(x,y,z); world.addBody(b); }

const out = { walls:[], dice:[] };
for (const sides of [4,6,8,10,12,20]) {
  const dice=[];
  for(let i=0;i<10;i++){
    const body = new CANNON.Body({ mass:0.3, shape:shapeFor(sides), linearDamping:0.28, angularDamping:0.4,
      sleepSpeedLimit:0.4, sleepTimeLimit:0.35, allowSleep:true });
    const spread = Math.min(5.6,(i-(10-1)/2)*1.25);
    body.position.set(spread+(rand()-0.5)*0.25, 7.4+rand()*0.8, 4.7+(i%2)*1.6);
    body.velocity.set((rand()-0.5)*7, -2-rand(), -(11+rand()*4));
    body.angularVelocity.set((rand()-0.5)*26,(rand()-0.5)*26,(rand()-0.5)*26);
    body.quaternion.setFromEuler(rand()*Math.PI*2, rand()*Math.PI*2, rand()*Math.PI*2);
    world.addBody(body); dice.push({ body, sides, done:false, restFrames:0 });
  }
  let t=0, allDone=false;
  while(t<12 && !allDone){
    world.step(1/60,1/60,4); t+=1/60;
    allDone=true;
    for(const d of dice){ if(d.done) continue; allDone=false;
      const sp=d.body.velocity.length(), spin=d.body.angularVelocity.length();
      if(sp<0.35&&spin<0.35) d.restFrames++; else d.restFrames=0;
      if(d.restFrames>=6||d.body.sleepState===2||t*1000>5500) d.done=true; }
  }
  for(const d of dice) out.dice.push({ sides, pos:[d.body.position.x,d.body.position.y,d.body.position.z], quat:[d.body.quaternion.x,d.body.quaternion.y,d.body.quaternion.z,d.body.quaternion.w] });
}
fs.writeFileSync('/tmp/sim-frames.json', JSON.stringify(out));
console.log('dumped', out.dice.length, 'dice');
