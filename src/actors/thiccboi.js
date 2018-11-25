import {
  CylinderGeometry,
  CylinderBufferGeometry,
  MeshPhongMaterial,
  SphereGeometry,
  Vector3,
  VertexColors,
} from 'three';
import Actor from '@/engine/actor';

class ThiccBoi extends Actor {
  constructor(palette) {
    super({
      bonesOrigin: ThiccBoi.bones,
      collisionGeometry: (
        (new CylinderBufferGeometry(0.25, 0.25, 1.4))
          .translate(0, 0.7, 0)
      ),
      geometry: ThiccBoi.geometry(palette),
      material: ThiccBoi.material,
    });
  }
}

ThiccBoi.bones = {
  hip: new Vector3(0, 0.4, 0),
  torso: new Vector3(0, 0, 0),
  head: new Vector3(0, 0.5, 0),
  leftArm: new Vector3(-0.325, 0.45, 0),
  rightArm: new Vector3(0.325, 0.45, 0),
  leftLeg: new Vector3(-0.08, 0.1, 0),
  rightLeg: new Vector3(0.08, 0.1, 0),
};

ThiccBoi.geometry = (palette) => {
  // const torso = new CylinderGeometry(0.175, 0.15, 0.5, 6);
  const torso = new SphereGeometry(0.26, 8, 8);
  torso.translate(0, 0.25, 0);
  torso.scale(1.5, 1, 1.5);
  torso.faces.forEach((face) => {
    face.color.set(palette.torso || 0x990000);
  });
  const head = new CylinderGeometry(0.175, 0.15, 0.4, 6);
  // const head = new SphereGeometry(0.2, 8, 4);
  head.translate(0, 0.2, 0);
  head.faces.forEach((face) => {
    face.color.set(palette.head);
  });
  if (palette.hat) {
    const hat = new CylinderGeometry(0.3, 0.3, 0.05);
    const top = new CylinderGeometry(0.2, 0.2, 0.3);
    top.translate(0, 0.15, 0);
    hat.merge(top);
    hat.translate(0, 0.3, 0);
    hat.faces.forEach((face) => {
      face.color.set(palette.hat);
    });
    head.merge(hat);
  }
  const leftEye = new SphereGeometry(0.05);
  leftEye.faces.forEach((face) => {
    face.color.set(palette.eyes);
  });
  const rightEye = leftEye.clone();
  leftEye.translate(-0.1, 0.2, 0.15);
  rightEye.translate(0.1, 0.2, 0.15);
  head.merge(leftEye);
  head.merge(rightEye);
  const leftArm = new CylinderGeometry(0.03, 0.075, 0.3, 6);
  leftArm.faces.forEach((face) => {
    face.color.set(palette.arms);
  });
  const rightArm = leftArm.clone();
  leftArm.translate(0, -0.15, 0);
  rightArm.translate(0, -0.15, 0);
  const leftLeg = new CylinderGeometry(0.05, 0.1, 0.4, 4);
  leftLeg.faces.forEach((face) => {
    face.color.set(palette.legs);
  });
  const rightLeg = leftLeg.clone();
  leftLeg.translate(0, -0.2, 0);
  rightLeg.translate(0, -0.2, 0);
  const geometry = Actor.geometryFromLimbs({
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  });
  geometry.boundingSphere.center.set(0, 0.7, 0);
  geometry.boundingSphere.radius = 0.7;
  return geometry;
};

ThiccBoi.material = new MeshPhongMaterial({
  skinning: true,
  vertexColors: VertexColors,
});

export default ThiccBoi;
