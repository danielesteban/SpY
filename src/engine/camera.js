import {
  Object3D,
  PerspectiveCamera,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor() {
    super(60, 1, 0.01, 2048);
    this.distance = 4;
    this.offset = new Vector3(0, 1.2, 0);
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
      this.pitch += movement.y * sensitivity;
      this.pitch = Math.min(Math.max(this.pitch, 0), Math.PI * 0.5);
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
    this.lookAt(root.position);
    position.add(offset);
  }
}

export default Camera;
