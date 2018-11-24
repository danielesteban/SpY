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
      (new BoxGeometry(0.01, 0.5, 0.01)).translate(0, 0.25, 0)
    ).attributes.position.array;
    const offsets = new Float32Array(Rain.numDrops * 3);
    const geometry = new InstancedBufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(drop, 3));
    geometry.addAttribute('offset', (new InstancedBufferAttribute(offsets, 3).setDynamic(true)));
    super(
      geometry,
      new RainMaterial({
        color: 0xAAAADD,
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
    const { geometry, offsets, position } = this;
    const step = delta * 16;
    for (let i = 0; i < Rain.numDrops * 3; i += 3) {
      offsets[i + 1] -= step;
      let height = 0;
      if (this.testHeight) {
        height = this.testHeight(offsets[i] + position.x, offsets[i + 2] + position.z);
      }
      if (offsets[i + 1] <= height) {
        this.resetDrop(i);
      }
    }
    geometry.attributes.offset.needsUpdate = true;
  }

  resetDrop(i) {
    const { drop, offsets, position } = this;
    drop.set(
      (Math.random() * (Rain.radius * 2 + 1)) - Rain.radius,
      0,
      (Math.random() * (Rain.radius * 2 + 1)) - Rain.radius
    );
    let height = Math.random() * Rain.radius * 0.5;
    if (this.testHeight) {
      height = Math.max(height, this.testHeight(drop.x + position.x, drop.z + position.z));
    }
    offsets[i] = drop.x;
    offsets[i + 1] = height;
    offsets[i + 2] = drop.z;
  }

  setHeightTest(func) {
    const { geometry } = this;
    this.testHeight = func;
    for (let i = 0; i < Rain.numDrops * 3; i += 3) {
      this.resetDrop(i);
    }
    geometry.attributes.offset.needsUpdate = true;
  }
}

Rain.numDrops = 10000;
Rain.radius = 50;

export default Rain;
