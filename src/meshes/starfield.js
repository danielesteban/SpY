import {
  BufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import Moon from './moon';

class Starfield extends Points {
  constructor() {
    const count = 10000;
    const radius = 1024;
    const geometry = new BufferGeometry();
    const position = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const aux = new Vector3();
    for (let i = 0; i < count; i += 1) {
      aux.set(
        Math.floor(Math.random() * ((radius * 2) + 1)) - radius,
        Math.floor(Math.random() * (radius + 1)),
        Math.floor(Math.random() * ((radius * 2) + 1)) - radius
      ).normalize().multiplyScalar(radius);
      const o = i * 3;
      position[o] = aux.x;
      position[o + 1] = aux.y;
      position[o + 2] = aux.z;
      size[i] = 10 + Math.floor(Math.random() * 100);
    }
    geometry.addAttribute('position', new BufferAttribute(position, 3));
    geometry.addAttribute('size', new BufferAttribute(size, 1));
    super(
      geometry,
      new PointsMaterial({
        color: 0x999999,
        fog: false,
        sizeAttenuation: false,
      })
    );
    this.moon = new Moon();
    this.moon.position.set(radius, radius * 0.5, radius);
    this.add(this.moon);
  }
}

export default Starfield;
