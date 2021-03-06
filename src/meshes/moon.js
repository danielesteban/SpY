import {
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
} from 'three';

class Moon extends Mesh {
  constructor() {
    super(
      new SphereBufferGeometry(100, 32, 32),
      new MeshBasicMaterial({
        color: 0xBEBEBE,
        fog: false,
      })
    );
  }
}

export default Moon;
