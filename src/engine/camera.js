import {
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor() {
    super(60, 1, 0.1, 2048);
    this.distance = 5;
    this.maxHeight = Infinity;
    this.offset = new Vector3(0, 1.2, 0);
    this.tilt = Math.PI * -0.45;
    this.pitch = Math.PI * 0.1;
    this.speed = 1.25;
    this.step = new Vector3();
    this.raycaster = new Raycaster();
    this.root = new Object3D();
    this.root.add(this);
    this.updateOrbit();
  }

  getRaycaster(pointer) {
    const { raycaster } = this;
    raycaster.setFromCamera(pointer, this);
    raycaster.far = Infinity;
    return raycaster;
  }

  onAnimationTick({ delta }) {
    const {
      root: { position },
      speed,
      step,
      target,
    } = this;
    if (!target || position.distanceTo(target) <= 0.1) return;
    step
      .copy(target)
      .sub(position)
      .normalize()
      .multiplyScalar(delta * speed);
    position.add(step);
  }

  processInput({
    movement,
    secondary,
    wheel,
  }) {
    let hasUpdated = false;
    if (secondary) {
      const sensitivity = 0.003;
      this.tilt -= movement.x * sensitivity;
      this.pitch += movement.y * sensitivity;
      this.pitch = Math.min(Math.max(this.pitch, Math.PI * -0.45), Math.PI * 0.45);
      hasUpdated = true;
    }
    if (wheel) {
      const sensitivity = 0.006;
      this.distance = Math.min(Math.max(this.distance + (wheel * sensitivity), 1), 16);
      hasUpdated = true;
    }
    if (hasUpdated) this.updateOrbit();
    return hasUpdated;
  }

  updateOrbit() {
    const {
      maxHeight,
      offset,
      pitch,
      position,
      raycaster,
      root,
      testMeshes,
      tilt,
    } = this;
    let { distance } = this;
    position.set(
      Math.cos(tilt) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(-tilt) * Math.cos(pitch)
    ).normalize();
    raycaster.ray.origin
      .copy(root.position)
      .add(offset);
    if (testMeshes) {
      raycaster.ray.direction
        .copy(position);
      raycaster.far = distance;
      const hit = raycaster.intersectObjects(testMeshes)[0];
      if (hit) {
        distance = hit.distance - 0.25;
      }
    }
    position
      .multiplyScalar(distance)
      .add(offset);
    position.y = Math.min(Math.max(position.y, 0.1), maxHeight);
    this.lookAt(raycaster.ray.origin);
  }
}

export default Camera;
