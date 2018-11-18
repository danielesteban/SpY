import { Raycaster, Vector2 } from 'three';
import Touches from 'touches';
import { addWheelListener } from 'wheel';

class Input {
  constructor({
    mount = document.body,
  }) {
    this.mount = mount;
    this.pointer = {
      current: new Vector2(0, 0),
      movement: { x: 0, y: 0 },
      normalized: new Vector2(0, 0),
      last: new Vector2(0, 0),
      raycaster: new Raycaster(),
      wheel: 0,
    };
    this.touches = Touches(window, {
      filtered: true,
      preventSimulated: false,
      target: mount,
    })
      .on('start', this.onPointerDown.bind(this))
      .on('move', this.onPointerMove.bind(this))
      .on('end', this.onPointerUp.bind(this));
    addWheelListener(window, this.onPointerWheel.bind(this));
    window.addEventListener('contextmenu', e => e.preventDefault(), false);
    window.addEventListener('resize', this.onResize.bind(this), false);
    this.onResize();
  }

  getPointerFrame() {
    const { pointer } = this;
    const frame = { ...pointer };
    pointer.primaryDown = false;
    pointer.primaryUp = false;
    pointer.secondaryDown = false;
    pointer.secondaryUp = false;
    pointer.movement = { x: 0, y: 0 };
    pointer.wheel = 0;
    return frame;
  }

  onPointerDown({ button }) {
    const { pointer } = this;
    switch (button) {
      case 0:
        pointer.primary = true;
        pointer.primaryDown = true;
        break;
      case 2:
        pointer.secondary = true;
        pointer.secondaryDown = true;
        break;
      default:
    }
  }

  onPointerMove(e, [x, y]) {
    const { pointer, size: { width, height } } = this;
    pointer.current.x = x;
    pointer.current.y = y;
    pointer.normalized.x = ((x / width) * 2) - 1;
    pointer.normalized.y = 1 - ((y / height) * 2);
    pointer.movement = {
      x: pointer.current.x - pointer.last.x,
      y: pointer.current.y - pointer.last.y,
    };
    pointer.last.copy(pointer.current);
  }

  onPointerUp({ button }) {
    const { pointer } = this;
    switch (button) {
      case 0:
        pointer.primary = false;
        pointer.primaryUp = true;
        break;
      case 2:
        pointer.secondary = false;
        pointer.secondaryUp = true;
        break;
      default:
    }
  }

  onPointerWheel({ deltaY }) {
    const { pointer } = this;
    pointer.wheel = deltaY;
  }

  onResize() {
    const { mount } = this;
    this.size = mount.getBoundingClientRect();
  }
}


export default Input;
