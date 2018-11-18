import {
  Object3D,
  PerspectiveCamera,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor() {
    super(60, 1, 0.01, 2048);
    this.distance = 6;
    this.offset = new Vector3(0, 1.5, 0);
    this.tilt = Math.PI * -0.5;
    this.pitch = Math.PI * 0.125;
    this.speed = 1.5;
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

  updateOrbit() {
    const {
      distance,
      offset,
      pitch,
      root,
      tilt,
    } = this;
    this.position.set(
      Math.cos(tilt) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(-tilt) * Math.cos(pitch)
    )
      .normalize()
      .multiplyScalar(distance)
      .add(offset);
    this.lookAt(root.position);
  }
}

export default Camera;
