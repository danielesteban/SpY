import {
  PerspectiveCamera,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor() {
    super(60, 1, 0.01, 1024);
    this.targetOffset = new Vector3();
    this.speed = 1;
    this.step = new Vector3();
  }

  onAnimationTick({ delta }) {
    const {
      position,
      speed,
      step,
      target,
      targetOffset,
    } = this;
    if (!this.target) return;
    targetOffset.copy(target.position).add(target.offset);
    if (position.distanceTo(targetOffset) <= 0.1) return;
    step
      .copy(targetOffset)
      .sub(position)
      .normalize()
      .multiplyScalar(delta * speed);
    position.add(step);
  }
}

export default Camera;
