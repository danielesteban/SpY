import {
  CylinderGeometry,
  MeshLambertMaterial,
  SphereGeometry,
} from 'three';
import Actor from '@/engine/actor';

class Dude extends Actor {
  constructor() {
    super({
      geometry: Dude.geometry,
      material: Dude.material,
    });
    const { skeleton: { bones } } = this;
    bones[Actor.Bones.torso].position.y = 0.5;
    bones[Actor.Bones.head].position.y = 0.5;
    bones[Actor.Bones.leftArm].position.set(-0.18, 0.5, 0);
    bones[Actor.Bones.rightArm].position.set(0.18, 0.5, 0);
    bones[Actor.Bones.leftLeg].position.set(-0.075, 0, 0);
    bones[Actor.Bones.rightLeg].position.set(0.075, 0, 0);

    this.actions.idle.play();
  }
}

Dude.geometry = (() => {
  const torso = new CylinderGeometry(0.175, 0.15, 0.5, 6);
  torso.translate(0, 0.25, 0);
  const head = new SphereGeometry(0.2, 8, 4);
  head.translate(0, 0.2, 0);
  const leftArm = new CylinderGeometry(0.05, 0.05, 0.5, 8);
  leftArm.translate(0, -0.25, 0);
  const rightArm = new CylinderGeometry(0.05, 0.05, 0.5, 8);
  rightArm.translate(0, -0.25, 0);
  const leftLeg = new CylinderGeometry(0.05, 0.05, 0.5, 8);
  leftLeg.translate(0, -0.25, 0);
  const rightLeg = new CylinderGeometry(0.05, 0.05, 0.5, 8);
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
  color: 0x666699,
  skinning: true,
});

export default Dude;
