import {
  AnimationClip,
  AnimationMixer,
  Bone,
  BufferGeometry,
  Euler,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  QuaternionKeyframeTrack,
  Quaternion,
  SkinnedMesh,
  Skeleton,
  Vector2,
  Vector3,
  Vector4,
} from 'three';
import Bubble from '@/items/bubble';

class Actor extends SkinnedMesh {
  static geometryFromLimbs(limbs) {
    const merged = new Geometry();
    Object.keys(limbs).forEach((limb) => {
      limbs[limb].faces.forEach((face) => {
        face.materialIndex = Actor.Bones[limb];
      });
      merged.merge(limbs[limb]);
    });
    merged.faces.forEach((face) => {
      merged.vertices[face.a].bone = face.materialIndex;
      merged.vertices[face.b].bone = face.materialIndex;
      merged.vertices[face.c].bone = face.materialIndex;
      face.materialIndex = 0;
    });
    merged.vertices.forEach((vertex) => {
      merged.skinIndices.push(new Vector4(vertex.bone, 0, 0, 0));
      merged.skinWeights.push(new Vector4(1, 0, 0, 0));
    });
    const geometry = (new BufferGeometry()).fromGeometry(merged);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }

  constructor({
    collisionGeometry,
    geometry,
    material,
  }) {
    super(
      geometry,
      material
    );
    const hip = new Bone();
    this.add(hip);
    const torso = new Bone();
    hip.add(torso);
    const head = new Bone();
    torso.add(head);
    const leftArm = new Bone();
    torso.add(leftArm);
    const rightArm = new Bone();
    torso.add(rightArm);
    const leftLeg = new Bone();
    hip.add(leftLeg);
    const rightLeg = new Bone();
    hip.add(rightLeg);
    this.bind(new Skeleton([
      hip,
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
    this.actions.idle.timeScale = 0.5;
    this.actions.idle.play();
    this.rotationAux = new Vector2();
    this.movementAux = new Vector3();
    this.collisionMesh = new Mesh(
      collisionGeometry,
      new MeshBasicMaterial({
        opacity: 0.1,
        transparent: true,
        visible: false,
        wireframe: true,
      })
    );
    this.add(this.collisionMesh);
  }

  onAnimationTick({ delta }) {
    const {
      actions: { walk: { timeScale: walkingSpeed } },
      destinationMarker,
      mixer,
      movementAux,
      position,
      rotationSpeed,
      route,
      targetRotation,
    } = this;
    mixer.update(delta);
    if (targetRotation !== undefined) {
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
        delete this.targetRotation;
      }
    }
    if (!route) return;
    const waypoint = route.path[route.current];
    const distance = position.distanceTo(waypoint);
    const step = delta * 1.5 * walkingSpeed;
    position.add(
      movementAux
        .copy(waypoint)
        .sub(position)
        .normalize()
        .multiplyScalar(Math.min(distance, step))
    );
    if (distance > step) {
      return;
    }
    if (route.current < route.path.length - 1) {
      route.current += 1;
      this.faceTo(route.path[route.current]);
      return;
    }
    this.setAnimation('idle');
    delete this.route;
    if (destinationMarker) {
      destinationMarker.visible = false;
    }
    if (this.onDestinationCallback) {
      this.onDestinationCallback();
      delete this.onDestinationCallback;
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

  walk(path, callback) {
    const { destinationMarker, position } = this;
    const distance = position.distanceTo(path[path.length - 1]);
    delete this.onDestinationCallback;
    if (distance === 0) {
      if (callback) callback();
      return;
    }
    this.setAnimation('walk');
    this.route = {
      current: 0,
      path,
    };
    if (destinationMarker) {
      destinationMarker.position.copy(path[path.length - 1]);
      destinationMarker.visible = true;
    }
    if (callback) {
      this.onDestinationCallback = callback;
    }
    this.faceTo(path[0]);
  }

  faceTo(point) {
    const { position, rotationAux } = this;
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
    this.rotationSpeed = Math.abs(this.targetRotation - this.rotation.y) * 1.5;
  }

  say(lines, delay) {
    if (!this.bubble) {
      this.bubble = new Bubble();
      this.bubble.position.set(0, this.geometry.boundingSphere.radius * 2.25, 0);
      this.add(this.bubble);
    }
    const { bubble } = this;
    bubble.display(lines, delay);
  }
}

Actor.Bones = {
  hip: 0,
  torso: 1,
  head: 2,
  leftArm: 3,
  rightArm: 4,
  leftLeg: 5,
  rightLeg: 6,
};

const eulerToQuat = (x, y, z) => (new Quaternion()).setFromEuler(new Euler(x, y, z)).toArray();

Actor.animations = {
  idle: (
    new AnimationClip('idle', 1, [
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.torso}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, Math.PI * -0.05, 0),
          ...eulerToQuat(0, Math.PI * 0.05, 0),
          ...eulerToQuat(0, Math.PI * -0.05, 0),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.head}].quaternion`,
        new Float32Array([
          0,
          0.75,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * -0.075, 0, Math.PI * -0.025),
          ...eulerToQuat(Math.PI * -0.075, 0, Math.PI * 0.025),
          ...eulerToQuat(Math.PI * -0.075, 0, Math.PI * -0.025),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.leftArm}].quaternion`,
        new Float32Array([
          0,
          0.75,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, 0, Math.PI * -0.05),
          ...eulerToQuat(0, 0, Math.PI * -0.1),
          ...eulerToQuat(0, 0, Math.PI * -0.05),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.rightArm}].quaternion`,
        new Float32Array([
          0,
          0.25,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, 0, Math.PI * 0.05),
          ...eulerToQuat(0, 0, Math.PI * 0.1),
          ...eulerToQuat(0, 0, Math.PI * 0.05),
        ])
      ),
    ])
  ),
  walk: (
    new AnimationClip('walk', 1, [
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.torso}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(Math.PI * -0.02, 0, Math.PI * 0.01),
          ...eulerToQuat(Math.PI * 0.02, 0, Math.PI * -0.01),
          ...eulerToQuat(Math.PI * -0.02, 0, Math.PI * 0.01),
        ])
      ),
      new QuaternionKeyframeTrack(
        `.bones[${Actor.Bones.head}].quaternion`,
        new Float32Array([
          0,
          0.5,
          1,
        ]),
        new Float32Array([
          ...eulerToQuat(0, 0, Math.PI * -0.025),
          ...eulerToQuat(0, 0, Math.PI * 0.025),
          ...eulerToQuat(0, 0, Math.PI * -0.025),
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
          ...eulerToQuat(Math.PI * 0.1, 0, 0),
          ...eulerToQuat(Math.PI * -0.1, 0, Math.PI * -0.1),
          ...eulerToQuat(Math.PI * 0.1, 0, 0),
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
          ...eulerToQuat(Math.PI * -0.1, 0, Math.PI * 0.1),
          ...eulerToQuat(Math.PI * 0.1, 0, 0),
          ...eulerToQuat(Math.PI * -0.1, 0, Math.PI * 0.1),
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
          ...eulerToQuat(Math.PI * -0.15, 0, Math.PI * 0.01),
          ...eulerToQuat(Math.PI * 0.15, 0, Math.PI * -0.01),
          ...eulerToQuat(Math.PI * -0.15, 0, Math.PI * 0.01),
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
          ...eulerToQuat(Math.PI * 0.15, 0, Math.PI * -0.01),
          ...eulerToQuat(Math.PI * -0.15, 0, Math.PI * 0.01),
          ...eulerToQuat(Math.PI * 0.15, 0, Math.PI * -0.01),
        ])
      ),
    ])
  ),
};

export default Actor;
