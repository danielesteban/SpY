import {
  AnimationClip,
  AnimationMixer,
  Bone,
  BufferGeometry,
  Euler,
  Geometry,
  QuaternionKeyframeTrack,
  Quaternion,
  SkinnedMesh,
  Skeleton,
  Vector2,
  Vector3,
  Vector4,
} from 'three';

class Actor extends SkinnedMesh {
  static geometryFromLimbs(limbs) {
    const geometry = new Geometry();
    Object.keys(limbs).forEach((limb) => {
      limbs[limb].faces.forEach((face) => {
        face.materialIndex = Actor.Bones[limb];
      });
      geometry.merge(limbs[limb]);
    });
    geometry.faces.forEach((face) => {
      geometry.vertices[face.a].bone = face.materialIndex;
      geometry.vertices[face.b].bone = face.materialIndex;
      geometry.vertices[face.c].bone = face.materialIndex;
      face.materialIndex = 0;
    });
    geometry.vertices.forEach((vertex) => {
      geometry.skinIndices.push(new Vector4(vertex.bone, 0, 0, 0));
      geometry.skinWeights.push(new Vector4(1, 0, 0, 0));
    });
    return (new BufferGeometry()).fromGeometry(geometry);
  }

  constructor({
    geometry,
    material,
  }) {
    super(
      geometry,
      material
    );
    const torso = new Bone();
    const head = new Bone();
    torso.add(head);
    const leftArm = new Bone();
    torso.add(leftArm);
    const rightArm = new Bone();
    torso.add(rightArm);
    const leftLeg = new Bone();
    torso.add(leftLeg);
    const rightLeg = new Bone();
    torso.add(rightLeg);
    this.add(torso);
    this.bind(new Skeleton([
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
    ]));
    this.mixer = new AnimationMixer(this);
    this.actions = Object.keys(Actor.animations).reduce((actions, action) => ({
      ...actions,
      [action]: this.mixer.clipAction(Actor.animations[action]),
    }), {});
    this.animation = 'idle';
    this.actions.idle.play();
    this.rotationAux = new Vector2();
    this.movementAux = new Vector3();
  }

  onAnimationTick({ delta }) {
    const {
      destination,
      mixer,
      movementAux,
      position,
      rotationSpeed,
      targetRotation,
    } = this;
    mixer.update(delta);
    if (targetRotation) {
      const rotationStep = delta * rotationSpeed;
      const rotationDelta = targetRotation - this.rotation.y;
      this.rotation.y += Math.min(
        Math.max(
          rotationDelta,
          -rotationStep
        ),
        rotationStep
      );
      if (Math.abs(rotationDelta) <= rotationStep) {
        this.targetRotation = false;
      }
    }
    if (!destination) return;
    const distance = position.distanceTo(destination);
    const step = delta * 2;
    position.add(
      movementAux
        .copy(destination)
        .sub(position)
        .normalize()
        .multiplyScalar(Math.min(distance, step))
    );
    if (distance <= step) {
      this.setAnimation('idle');
      this.destination = false;
    }
  }

  setAnimation(animation) {
    const { actions } = this;
    if (this.animation === animation) return;
    actions[this.animation].fadeOut(0.2);
    this.animation = animation;
    actions[this.animation]
      .reset()
      .fadeIn(0.2)
      .play();
  }

  walkTo(point) {
    const { position, rotationAux } = this;
    this.setAnimation('walk');
    this.destination = point;
    const angle = rotationAux.set(point.x - position.x, point.z - position.z).angle();
    while (this.rotation.y < -Math.PI) this.rotation.y += Math.PI * 2;
    while (this.rotation.y > Math.PI) this.rotation.y -= Math.PI * 2;
    this.targetRotation = (Math.PI * 0.5) - angle;
    while (this.targetRotation < -Math.PI) this.targetRotation += Math.PI * 2;
    while (this.targetRotation > Math.PI) this.targetRotation -= Math.PI * 2;
    if ((this.targetRotation - this.rotation.y) > Math.PI) {
      this.targetRotation -= Math.PI * 2;
    } else if ((this.targetRotation - this.rotation.y) < -Math.PI) {
      this.targetRotation += Math.PI * 2;
    }
    this.rotationSpeed = Math.abs(this.targetRotation - this.rotation.y) * 2;
  }
}

Actor.Bones = {
  torso: 0,
  head: 1,
  leftArm: 2,
  rightArm: 3,
  leftLeg: 4,
  rightLeg: 5,
};

const eulerToQuat = (x, y, z) => (new Quaternion()).setFromEuler(new Euler(x, y, z)).toArray();

Actor.animations = {
  idle: (
    new AnimationClip('idle', 1, [
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.head}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * -0.05, 0, 0),
          ...eulerToQuat(Math.PI * 0.05, 0, 0),
          ...eulerToQuat(Math.PI * -0.05, 0, 0),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.leftArm}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, 0, 0),
          ...eulerToQuat(0, 0, Math.PI * -0.1),
          ...eulerToQuat(0, 0, 0),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.rightArm}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, 0, 0),
          ...eulerToQuat(0, 0, Math.PI * 0.1),
          ...eulerToQuat(0, 0, 0),
        ])
      ),
    ])
  ),
  walk: (
    new AnimationClip('walk', 1, [
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.head}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, 0, Math.PI * -0.05),
          ...eulerToQuat(0, 0, Math.PI * 0.05),
          ...eulerToQuat(0, 0, Math.PI * -0.05),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.leftArm}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * 0.15, 0, 0),
          ...eulerToQuat(Math.PI * -0.15, 0, Math.PI * -0.15),
          ...eulerToQuat(Math.PI * 0.15, 0, 0),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.rightArm}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * -0.15, 0, Math.PI * 0.15),
          ...eulerToQuat(Math.PI * 0.15, 0, 0),
          ...eulerToQuat(Math.PI * -0.15, 0, Math.PI * 0.15),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.leftLeg}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * -0.15, 0, 0),
          ...eulerToQuat(Math.PI * 0.15, 0, 0),
          ...eulerToQuat(Math.PI * -0.15, 0, 0),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.rightLeg}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * 0.15, 0, 0),
          ...eulerToQuat(Math.PI * -0.15, 0, 0),
          ...eulerToQuat(Math.PI * 0.15, 0, 0),
        ])
      ),
    ])
  ),
};

export default Actor;
