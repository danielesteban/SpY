import {
  CircleBufferGeometry,
  Mesh,
  MeshPhongMaterial,
} from 'three';

class Marker extends Mesh {
  constructor() {
    const geometry = new CircleBufferGeometry(0.25, 16);
    geometry.rotateX(Math.PI * -0.5);
    geometry.translate(0, 0.002, 0);
    super(
      geometry,
      new MeshPhongMaterial({
        color: 0xFF0000,
        opacity: 0.25,
        transparent: true,
      })
    );
    this.visible = false;
  }

  onAnimationTick({ time }) {
    const { scale, visible } = this;
    if (!visible) return;
    const s = 0.75 + ((1 + Math.sin(time * 4)) * 0.125);
    scale.set(s, 1, s);
  }
}

export default Marker;
