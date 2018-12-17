import UI from '@/core/ui';

class EditorUI extends UI {
  constructor({
    floorCount,
    onAddFloor,
    onRemoveFloor,
    onSave,
    onSetFloor,
  }) {
    super('toolbar');
    this.onKeyup = this.onKeyup.bind(this);
    this.onSetFloor = onSetFloor;
    // Floor
    {
      const label = this.add('label');
      label.innerText = 'Floor';
      const input = this.add('input');
      input.type = 'number';
      input.addEventListener('change', ({ target: { value: floor } }) => {
        this.setFloor(parseInt(floor, 10));
      }, false);
      input.min = 0;
      input.step = 1;
      this.floorInput = input;
      const buttons = this.add('div');
      {
        const add = this.add('button');
        add.innerText = '+';
        add.addEventListener('click', onAddFloor, false);
        const remove = this.add('button');
        remove.innerText = '×';
        remove.addEventListener('click', onRemoveFloor, false);
        buttons.appendChild(add);
        buttons.appendChild(remove);
      }
      const wrapper = this.add('div');
      wrapper.appendChild(input);
      wrapper.appendChild(buttons);
    }
    // Tiles
    {
      const label = this.add('label');
      label.innerText = 'Tiles';
      const tiles = [
        'Air',
        'Tile',
        'Wall',
        'Window',
        'Door',
        'Dude',
      ].map((label, tile) => {
        const button = this.add('button');
        button.innerText = label;
        button.addEventListener('click', () => {
          this.setTool('paint', tile);
        }, false);
        return button;
      });
      const wrapper = this.add('div');
      tiles.forEach(button => wrapper.appendChild(button));
      this.tiles = tiles;
    }
    // Color
    {
      const label = this.add('label');
      label.innerText = 'Color';
      const input = this.add('input');
      input.type = 'color';
      input.addEventListener('change', ({ target: { value: color } }) => {
        this.setColor(color);
      }, false);
      this.colorInput = input;
      const button = this.add('button');
      button.innerText = 'Pick';
      button.addEventListener('click', () => {
        const { tool, modifier } = this.tool;
        this.setTool('pick', tool === 'paint' ? modifier : 1);
      }, false);
      this.pickButton = button;
      const wrapper = this.add('div');
      wrapper.appendChild(input);
      wrapper.appendChild(button);
    }
    // Save
    const save = this.add('button');
    save.className = 'save';
    save.innerText = 'Save';
    save.addEventListener('click', onSave, false);
    this.saveButton = save;
    // Initial state
    this.setFloorCount(floorCount);
    this.setFloor(0);
    this.setTool('paint', 1);
    this.setColor('#aaaaaa');
    // Mount UI
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
      this.setTool('paint', keyCode - 49);
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

  setModified(value) {
    const { saveButton } = this;
    saveButton.className = `save${value ? ' modified' : ''}`;
  }

  setTool(tool, modifier) {
    const { pickButton, tiles } = this;
    this.tool = { tool, modifier };
    tiles.forEach((button) => { button.className = ''; });
    pickButton.className = '';
    switch (tool) {
      case 'paint':
        tiles[modifier].className = 'active';
        break;
      case 'pick':
        pickButton.className = 'active';
        break;
      default:
        break;
    }
  }
}

export default EditorUI;