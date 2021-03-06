import {
  BufferGeometry,
  Color,
  DoubleSide,
  Math as ThreeMath,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PlaneGeometry,
  PlaneBufferGeometry,
  VertexColors,
  Vector3,
} from 'three';
import Button from '@/meshes/button';

class Doors extends Object3D {
  constructor({
    color,
    onCall,
    scale,
  }) {
    super();
    const plane = new PlaneGeometry(0.5, 1, scale.x * 0.5, scale.y);
    const aux = new Color();
    plane.faces.forEach((face, i) => {
      if (i % 2 === 0) {
        aux.setHSL(Math.random(), 0.05, 0.25 + (Math.random() * 0.125));
      }
      face.color.copy(aux);
    });
    plane.scale(scale.x, scale.y, scale.z);
    const geometry = (new BufferGeometry()).fromGeometry(plane);
    for (let i = 0; i < 2; i += 1) {
      const door = new Mesh(
        geometry,
        new MeshPhongMaterial({
          color,
          side: DoubleSide,
          vertexColors: VertexColors,
        })
      );
      door.position.set(
        (-0.26 + (i * 0.52)) * scale.x,
        0.5 * scale.y,
        0.499 * scale.z
      );
      this.add(door);
    }
    this.animation = 0;
    this.animationScale = scale.x;
    this.state = Doors.states.CLOSED;
    this.targetState = this.state;
    this.callButton = new Button({
      onTap: onCall,
      position: new Vector3(0.6 * scale.x, (1 / 3) * scale.y, 0.5 * scale.z),
    });
    this.add(this.callButton);
    this.collisionMesh = new Mesh(
      new PlaneBufferGeometry(1, 1)
        .scale(scale.x, scale.y, 1)
        .translate(0, scale.y * 0.5, scale.z * 0.5),
      new MeshBasicMaterial({
        opacity: 0.1,
        transparent: true,
        visible: false,
        wireframe: true,
      })
    );
    this.add(this.collisionMesh);
  }

  open() {
    this.state = Doors.states.MOVING;
    this.targetState = Doors.states.OPEN;
  }

  close() {
    this.state = Doors.states.MOVING;
    this.targetState = Doors.states.CLOSED;
  }

  toggle() {
    const { state } = this;
    switch (state) {
      case Doors.states.OPEN:
        this.close();
        break;
      case Doors.states.CLOSED:
        this.open();
        break;
      default:
        break;
    }
  }

  onAnimationTick(animation) {
    const {
      animationScale,
      children,
      state,
      targetState,
    } = this;
    this.callButton.onAnimationTick(animation);
    if (state !== Doors.states.MOVING) return;
    const { delta } = animation;
    const animationStep = delta * 0.75;
    switch (targetState) {
      case Doors.states.OPEN:
        this.animation = Math.min(this.animation + animationStep, 1);
        if (this.animation === 1) {
          this.state = Doors.states.OPEN;
        }
        break;
      case Doors.states.CLOSED:
        this.animation = Math.max(this.animation - animationStep, 0);
        if (this.animation === 0) {
          this.state = Doors.states.CLOSED;
        }
        break;
      default:
        break;
    }
    const step = ThreeMath.smoothstep(this.animation, 0, 1) * 0.4;
    for (let i = 0; i < 2; i += 1) {
      children[i].position.x = (-0.26 + (i * 0.52) + (step * (i === 0 ? -1 : 1))) * animationScale;
    }
  }
}

Doors.states = {
  OPEN: 0,
  CLOSED: 1,
  MOVING: 2,
};

export default Doors;
