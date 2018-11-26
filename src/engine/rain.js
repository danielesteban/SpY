import {
  BufferAttribute,
  BoxGeometry,
  BufferGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
  Object3D,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import RainMaterial from '@/materials/rain';

class Rain extends Object3D {
  constructor() {
    super();
    {
      const position = new Float32Array(Rain.numDrops * 3);
      const geometry = new BufferGeometry();
      geometry.addAttribute('position', (new BufferAttribute(position, 3).setDynamic(true)));
      const ripples = new Points(
        geometry,
        new PointsMaterial({
          color: 0xAAAADD,
          fog: true,
          size: 0.01,
          sizeAttenuation: false,
          transparent: true,
          opacity: 1 / 3,
        })
      );
      ripples.frustumCulled = false;
      ripples.offsets = position;
      this.add(ripples);
      this.ripples = ripples;
    }
    {
      const drop = (new BufferGeometry()).fromGeometry(
        (new BoxGeometry(0.01, 0.5, 0.01)).translate(0, 0.25, 0)
      ).attributes.position.array;
      const offsets = new Float32Array(Rain.numDrops * 3);
      const geometry = new InstancedBufferGeometry();
      geometry.addAttribute('position', new BufferAttribute(drop, 3));
      geometry.addAttribute('offset', (new InstancedBufferAttribute(offsets, 3).setDynamic(true)));
      const drops = new Mesh(
        geometry,
        new RainMaterial({
          color: 0xAAAADD,
        })
      );
      drops.frustumCulled = false;
      drops.drop = new Vector3();
      drops.offsets = offsets;
      this.add(drops);
      this.drops = drops;
      for (let i = 0; i < Rain.numDrops * 3; i += 3) {
        this.resetDrop(i);
        this.ripples.offsets[i] = 0;
        this.ripples.offsets[i + 1] = -999;
        this.ripples.offsets[i + 2] = 0;
      }
    }
  }

  onAnimationTick({ delta }) {
    const { drops, position, ripples } = this;
    const { offsets } = drops;
    const step = delta * 16;
    for (let i = 0; i < Rain.numDrops * 3; i += 3) {
      offsets[i + 1] -= step;
      let height = 0;
      if (this.testHeight) {
        height = this.testHeight(offsets[i] + position.x, offsets[i + 2] + position.z);
      }
      if (offsets[i + 1] <= height) {
        offsets[i + 1] = height;
        this.resetDrop(i);
      }
    }
    drops.geometry.attributes.offset.needsUpdate = true;
    ripples.geometry.attributes.position.needsUpdate = true;
  }

  resetDrop(i) {
    const { drops, position, ripples } = this;
    const { drop, offsets } = drops;
    drop.set(
      (Math.random() * (Rain.radius * 2 + 1)) - Rain.radius,
      0,
      (Math.random() * (Rain.radius * 2 + 1)) - Rain.radius
    );
    let height = Math.random() * Rain.radius * 0.5;
    if (this.testHeight) {
      height = Math.max(height, this.testHeight(drop.x + position.x, drop.z + position.z));
    }
    ripples.offsets[i] = offsets[i];
    ripples.offsets[i + 1] = offsets[i + 1] + 0.01;
    ripples.offsets[i + 2] = offsets[i + 2];
    offsets[i] = drop.x;
    offsets[i + 1] = height;
    offsets[i + 2] = drop.z;
  }

  setHeightTest(func) {
    const { drops, ripples } = this;
    this.testHeight = func;
    for (let i = 0; i < Rain.numDrops * 3; i += 3) {
      this.resetDrop(i);
    }
    drops.geometry.attributes.offset.needsUpdate = true;
    ripples.geometry.attributes.position.needsUpdate = true;
  }
}

Rain.numDrops = 10000;
Rain.radius = 50;

export default Rain;
