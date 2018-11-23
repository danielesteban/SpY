import {
  BufferAttribute,
  BoxGeometry,
  BufferGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
  Vector3,
} from 'three';
import RainMaterial from '@/materials/rain';

class Rain extends Mesh {
  constructor() {
    const drop = (new BufferGeometry()).fromGeometry(
      new BoxGeometry(0.01, 0.5, 0.01)
    ).attributes.position.array;
    const offsets = new Float32Array(Rain.numDrops * 3);
    const geometry = new InstancedBufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(drop, 3));
    geometry.addAttribute('offset', (new InstancedBufferAttribute(offsets, 3).setDynamic(true)));
    super(
      geometry,
      new RainMaterial({
        color: 0xBBBBEE,
      })
    );
    this.frustumCulled = false;
    this.drop = new Vector3();
    this.offsets = offsets;
    for (let i = 0; i < Rain.numDrops * 3; i += 3) {
      this.resetDrop(i);
    }
  }

  onAnimationTick({ delta }) {
    const { geometry, offsets } = this;
    const step = delta * 10;
    for (let i = 0; i < Rain.numDrops * 3; i += 3) {
      offsets[i + 1] -= step;
      if (offsets[i + 1] <= 0) {
        this.resetDrop(i);
      }
    }
    geometry.attributes.offset.needsUpdate = true;
  }

  resetDrop(i) {
    const { drop, offsets } = this;
    drop.set(
      Math.floor(Math.random() * 1025) - 512,
      0,
      Math.floor(Math.random() * 1025) - 512
    )
      .normalize()
      .multiplyScalar(10 + (Math.random() * Rain.radius));
    offsets[i] = drop.x;
    offsets[i + 1] = (Rain.radius * 0.25) + (Math.random() * Rain.radius * 0.25);
    offsets[i + 2] = drop.z;
  }
}

Rain.numDrops = 5000;
Rain.radius = 50;

export default Rain;
