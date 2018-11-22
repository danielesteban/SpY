import {
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
  VertexColors,
} from 'three';

class Doors extends Object3D {
  constructor({
    floor,
  }) {
    super();
    const plane = new PlaneGeometry(0.5, 1, Doors.scale.x * 0.5, Doors.scale.y);
    const color = new Color();
    plane.faces.forEach((face, i) => {
      if (i % 2 === 0) {
        color.setHSL(Math.random(), 0.05, 0.25 + (Math.random() * 0.125));
      }
      face.color.copy(color);
    });
    plane.scale(Doors.scale.x, Doors.scale.y, Doors.scale.z);
    const geometry = (new BufferGeometry()).fromGeometry(plane);
    for (let i = 0; i < 2; i += 1) {
      const door = new Mesh(
        geometry,
        new MeshPhongMaterial({
          color: Doors.color,
          side: DoubleSide,
          vertexColors: VertexColors,
        })
      );
      door.position.set(
        (-0.25 + (i * 0.5)) * Doors.scale.x,
        0.5 * Doors.scale.y,
        0.499 * Doors.scale.z
      );
      this.add(door);
    }
    this.position.y = floor * Doors.scale.y;
    this.animationStart = Math.random() * 512;
  }

  onAnimationTick({ time }) {
    const { animationStart, children } = this;
    const step = (0.25 + (Math.sin(animationStart + time) * 0.24));
    children.forEach((door, i) => {
      door.position.x = (-0.25 + (i * 0.5) + (step * (i === 0 ? -1 : 1))) * Doors.scale.x;
    });
  }
}

Doors.color = 0x333333;
Doors.scale = new Vector3(2, 3, 2);

export default Doors;
