import {
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  Vector3,
  VertexColors,
} from 'three';

class Elevator extends Mesh {
  constructor({
    floors,
    origin,
  }) {
    const geometry = new BoxGeometry(
      0.99, 0.99, 0.99,
      Elevator.scale.x, Elevator.scale.y, Elevator.scale.z
    );
    const color = new Color();
    geometry.faces.forEach((face, i) => {
      if (i % 2 === 0) {
        color.setHSL(Math.random(), 0.05, 0.25 + (Math.random() * 0.125));
      }
      face.color.copy(color);
    });
    geometry.translate(0, 0.5, 0);
    for (let i = 0; i < 12; i += 1) {
      geometry.faces.splice(40, 1);
    }
    geometry.scale(Elevator.scale.x, Elevator.scale.y, Elevator.scale.z);
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshPhongMaterial({
        color: Elevator.color,
        side: DoubleSide,
        vertexColors: VertexColors,
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

Elevator.color = 0x440000;
Elevator.scale = new Vector3(2, 3, 2);

export default Elevator;
