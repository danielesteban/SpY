import UI from '@/core/ui';

class EditorUI extends UI {
  constructor({
    floorCount,
    onAddFloor,
    onRemoveFloor,
    onSetFloor,
  }) {
    super('toolbar');
    this.onKeyup = this.onKeyup.bind(this);
    this.onSetFloor = onSetFloor;
    // Color
    const color = this.add('label');
    color.innerText = 'Color';
    this.colorInput = this.add('input');
    this.colorInput.type = 'color';
    this.colorInput.addEventListener('change', ({ target: { value: color } }) => {
      this.setColor(color);
    }, false);
    this.setColor('#aaaaaa');
    // Tiles
    const tiles = this.add('label');
    tiles.innerText = 'Tiles';
    this.tiles = [
      'Air',
      'Tile',
      'Wall',
    ].map((label, tile) => {
      const button = this.add('button');
      button.innerText = label;
      button.tile = tile;
      button.addEventListener('click', () => {
        this.setTile(tile);
      }, false);
      return button;
    });
    this.setTile(1);
    // Floors
    const floors = this.add('label');
    floors.innerText = 'Floors';
    this.floorInput = this.add('input');
    this.floorInput.type = 'number';
    this.floorInput.addEventListener('change', ({ target: { value: floor } }) => {
      this.setFloor(parseInt(floor, 10));
    }, false);
    this.floorInput.min = 0;
    this.floorInput.step = 1;
    this.setFloorCount(floorCount);
    this.setFloor(0);
    {
      const add = this.add('button');
      add.innerText = '+';
      add.addEventListener('click', onAddFloor, false);
      const remove = this.add('button');
      remove.innerText = '×';
      remove.addEventListener('click', onRemoveFloor, false);
      const wrapper = this.add('div');
      wrapper.appendChild(add);
      wrapper.appendChild(remove);
    }
    this.mount();
  }

  mount() {
    super.mount();
    window.addEventListener('keyup', this.onKeyup, false);
  }

  unmount() {
    super.unmount();
    window.removeEventListener('keyup', this.onKeyup);
  }

  onKeyup({ keyCode, repeat }) {
    if (repeat) {
      return;
    }
    if (keyCode >= 49 && keyCode <= 57) {
      this.setTile(keyCode - 49);
    }
  }

  setColor(value) {
    const { colorInput } = this;
    colorInput.value = value;
    this.color = value;
  }

  setFloorCount(count) {
    const { floorInput } = this;
    floorInput.max = count - 1;
    this.floorCount = count;
  }

  setFloor(value) {
    const { floorInput } = this;
    floorInput.value = value;
    this.floor = value;
    this.onSetFloor(value);
  }

  setTile(value) {
    const { tiles } = this;
    tiles.forEach((button) => {
      button.className = button.tile === value ? 'active' : '';
    });
    this.tile = value;
  }
}

export default EditorUI;
