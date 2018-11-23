import {
  Object3D,
  PerspectiveCamera,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor() {
    super(60, 1, 0.001, 2048);
    this.distance = 4;
    this.maxHeight = Infinity;
    this.offset = 1.2;
    this.tilt = Math.PI * -0.65;
    this.pitch = Math.PI * 0.1;
    this.speed = 1.25;
    this.step = new Vector3();
    this.root = new Object3D();
    this.root.add(this);
    this.updateOrbit();
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
      this.tilt = Math.min(Math.max(this.tilt, Math.PI * -1.25), Math.PI * 0.25);
      this.pitch += movement.y * sensitivity;
      this.pitch = Math.min(Math.max(this.pitch, Math.PI * -0.45), Math.PI * 0.45);
      hasUpdated = true;
    }
    if (wheel) {
      const sensitivity = 0.006;
      this.distance = Math.min(Math.max(this.distance + (wheel * sensitivity), 1), 8);
      hasUpdated = true;
    }
    if (hasUpdated) this.updateOrbit();
    return hasUpdated;
  }

  updateOrbit() {
    const {
      distance,
      maxHeight,
      offset,
      pitch,
      position,
      root,
      tilt,
    } = this;
    position.set(
      Math.cos(tilt) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(-tilt) * Math.cos(pitch)
    )
      .normalize()
      .multiplyScalar(distance);
    position.y = Math.min(Math.max(position.y, 0.1 - offset), maxHeight - offset);
    this.lookAt(root.position);
    position.y += offset;
  }
}

export default Camera;
