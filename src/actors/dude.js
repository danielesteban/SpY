import {
  CylinderGeometry,
  MeshLambertMaterial,
  SphereGeometry,
  Vector3,
  VertexColors,
} from 'three';
import Actor from '@/engine/actor';

class Dude extends Actor {
  constructor() {
    super({
      geometry: Dude.geometry,
      material: Dude.material,
    });
    const { skeleton: { bones } } = this;
    Object.keys(Dude.bones).forEach((bone) => {
      bones[Actor.Bones[bone]].position.copy(Dude.bones[bone]);
    });
  }
}

Dude.bones = {
  hip: new Vector3(0, 0.5, 0),
  torso: new Vector3(0, 0, 0),
  head: new Vector3(0, 0.5, 0),
  leftArm: new Vector3(-0.1, 0.475, 0),
  rightArm: new Vector3(0.1, 0.475, 0),
  leftLeg: new Vector3(-0.075, 0, 0),
  rightLeg: new Vector3(0.075, 0, 0),
};

Dude.geometry = (() => {
  const torso = new CylinderGeometry(0.125, 0.175, 0.5, 6);
  torso.translate(0, 0.25, 0);
  torso.faces.forEach((face) => {
    face.color.set(0xff0000);
  });
  const head = new SphereGeometry(0.2, 8, 4);
  head.translate(0, 0.2, 0);
  head.faces.forEach((face) => {
    face.color.set(0x666666);
  });
  const leftEye = new SphereGeometry(0.05);
  leftEye.faces.forEach((face) => {
    face.color.set(0x66FF66);
  });
  const rightEye = leftEye.clone();
  leftEye.translate(-0.1, 0.2, 0.15);
  rightEye.translate(0.1, 0.2, 0.15);
  head.merge(leftEye);
  head.merge(rightEye);
  const leftArm = new CylinderGeometry(0.05, 0.03, 0.4, 8);
  leftArm.faces.forEach((face) => {
    face.color.set(0x333333);
  });
  const rightArm = leftArm.clone();
  leftArm.translate(0, -0.2, 0);
  rightArm.translate(0, -0.2, 0);
  const leftLeg = new CylinderGeometry(0.05, 0.05, 0.5, 8);
  leftLeg.faces.forEach((face) => {
    face.color.set(0x222222);
  });
  const rightLeg = leftLeg.clone();
  leftLeg.translate(0, -0.25, 0);
  rightLeg.translate(0, -0.25, 0);
  return Actor.geometryFromLimbs({
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  });
})();

Dude.material = new MeshLambertMaterial({
  skinning: true,
  vertexColors: VertexColors,
});

export default Dude;
