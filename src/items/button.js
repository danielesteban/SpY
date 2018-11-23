import {
  BoxBufferGeometry,
  Math as ThreeMath,
  Mesh,
  MeshPhongMaterial,
  Vector3,
} from 'three';

class Button extends Mesh {
  constructor({ onTap, position }) {
    const geometry = new BoxBufferGeometry(0.2, 0.1, 0.1);
    geometry.translate(0, 0, 0.05);
    super(
      geometry,
      new MeshPhongMaterial({
        color: 0x440000,
      })
    );
    this.animation = 0;
    this.animationVector = new Vector3(0, 0, -0.05);
    this.onTap = onTap;
    this.position.copy(position);
    this.origin = position.clone();
  }

  tap() {
    const { onTap, tapping } = this;
    if (tapping) return false;
    let ret;
    if (onTap) {
      ret = onTap();
    }
    this.animation = 0;
    this.tapping = true;
    return ret;
  }

  onAnimationTick({ delta }) {
    const { animationVector, origin, tapping } = this;
    if (!tapping) return;
    this.animation = Math.min(this.animation + (delta * 0.75), 1);
    if (this.animation === 1) {
      delete this.tapping;
    }
    const step = ThreeMath.smoothstep(
      (this.animation > 0.5 ? 1 - this.animation : this.animation) * 2,
      0,
      1
    );
    this.position
      .copy(origin)
      .addScaledVector(animationVector, step);
  }
}

export default Button;
