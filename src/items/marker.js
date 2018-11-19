import {
  CircleBufferGeometry,
  Mesh,
  MeshPhongMaterial,
} from 'three';

class Marker extends Mesh {
  constructor() {
    const geometry = new CircleBufferGeometry(0.25, 16);
    geometry.rotateX(Math.PI * -0.5);
    geometry.translate(0, 0.001, 0);
    super(
      geometry,
      new MeshPhongMaterial({
        color: 0x222222,
        transparent: true,
      })
    );
    this.visible = false;
  }

  onAnimationTick({ time }) {
    const { material, scale, visible } = this;
    if (!visible) return;
    const inc = ((1 + Math.sin(time * 4)) * 0.125);
    const s = 0.75 + inc;
    scale.set(s, 1, s);
    material.opacity = 0.25 + inc;
  }
}

export default Marker;
