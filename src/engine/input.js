import { Vector2 } from 'three';
import Touches from 'touches';
import { addWheelListener } from 'wheel';

class Input {
  constructor({
    mount = document.body,
  }) {
    this.mount = mount;
    this.keyboard = {
      backwards: false,
      forwards: false,
      leftwards: false,
      rightwards: false,
    };
    this.pointer = {
      current: new Vector2(0, 0),
      movement: { x: 0, y: 0 },
      normalized: new Vector2(0, 0),
      last: new Vector2(0, 0),
      wheel: 0,
    };
    this.touches = Touches(window, {
      preventSimulated: false,
      target: mount,
    })
      .on('start', this.onPointerDown.bind(this))
      .on('move', this.onPointerMove.bind(this))
      .on('end', this.onPointerUp.bind(this));
    addWheelListener(window, this.onPointerWheel.bind(this));
    window.addEventListener('contextmenu', e => e.preventDefault(), false);
    window.addEventListener('keydown', this.onKeydown.bind(this), false);
    window.addEventListener('keyup', this.onKeyup.bind(this), false);
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

  onKeydown({ keyCode, repeat, target }) {
    const { keyboard } = this;
    if (
      repeat
      || ~['INPUT', 'TEXTAREA'].indexOf(target.tagName)
    ) {
      return;
    }
    switch (keyCode) {
      case 87:
        keyboard.forwards = true;
        break;
      case 83:
        keyboard.backwards = true;
        break;
      case 65:
        keyboard.leftwards = true;
        break;
      case 68:
        keyboard.rightwards = true;
        break;
      default:
        break;
    }
  }

  onKeyup({ keyCode, repeat }) {
    const { keyboard } = this;
    if (repeat) {
      return;
    }
    switch (keyCode) {
      case 87:
        keyboard.forwards = false;
        break;
      case 83:
        keyboard.backwards = false;
        break;
      case 65:
        keyboard.leftwards = false;
        break;
      case 68:
        keyboard.rightwards = false;
        break;
      default:
        break;
    }
  }

  onPointerDown(e) {
    const { isEnabled, pointer } = this;
    if (!isEnabled) return;
    const { button, touches } = e;
    if (touches) {
      if (touches.length > 1) {
        e.preventDefault();
      }
      if (!pointer.secondary) {
        if (touches.length === 1) {
          pointer.primary = true;
          pointer.primaryDown = true;
        } else {
          pointer.secondary = true;
          pointer.secondaryDown = true;
          pointer.primary = false;
        }
      }
      return;
    }
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

  onPointerMove({ touches }, [x, y]) {
    const { isEnabled, pointer, rect } = this;
    if (!isEnabled) return;
    if (touches) {
      const { top, left } = rect;
      x = 0;
      y = 0;
      for (let i = 0; i < touches.length; i += 1) {
        const { clientX, clientY } = touches[i];
        x += (clientX - left);
        y += (clientY - top);
      }
      x /= touches.length;
      y /= touches.length;
    }
    const { width, height } = rect;
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

  onPointerUp({ button, touches }) {
    const { isEnabled, pointer } = this;
    if (!isEnabled) return;
    if (touches) {
      if (pointer.primary) {
        pointer.primary = false;
        pointer.primaryUp = true;
      }
      if (pointer.secondary) {
        pointer.secondary = false;
        pointer.secondaryUp = true;
      }
      return;
    }
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
    const { isEnabled, pointer } = this;
    if (!isEnabled) return;
    pointer.wheel = deltaY;
  }

  onResize() {
    const { mount } = this;
    this.rect = mount.getBoundingClientRect();
  }
}


export default Input;
