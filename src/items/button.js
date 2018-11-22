import {
  BoxBufferGeometry,
  Mesh,
  MeshPhongMaterial,
} from 'three';

class Button extends Mesh {
  constructor({ onTap }) {
    const geometry = new BoxBufferGeometry(0.2, 0.1, 0.1);
    geometry.translate(0, 0, 0.1);
    super(
      geometry,
      new MeshPhongMaterial({
        color: 0x330000,
      })
    );
    this.onTap = onTap;
  }
}

export default Button;
