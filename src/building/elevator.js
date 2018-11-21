import {
  BoxGeometry,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  Vector3,
} from 'three';

class Elevator extends Mesh {
  constructor({
    floors,
    origin,
  }) {
    const geometry = new BoxGeometry(0.99, 0.99, 0.99);
    geometry.translate(0, 0.5, 0);
    geometry.faces.splice(8, 1);
    geometry.faces.splice(8, 1);
    geometry.scale(Elevator.scale.x, Elevator.scale.y, Elevator.scale.z);
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshPhongMaterial({
        color: Elevator.color,
        side: DoubleSide,
      })
    );
    this.floors = floors;
    this.origin = origin;
    this.animationStart = Math.random() * 512;
  }

  onAnimationTick({ time }) {
    const { animationStart, floors, position } = this;
    const mid = (floors - 1) * Elevator.scale.y * 0.5;
    position.y = mid + (Math.sin((animationStart + time) * 0.5) * mid);
  }
}

Elevator.color = 0x330000;
Elevator.scale = new Vector3(2, 3, 2);

export default Elevator;
