import UI from '@/core/ui';

class EditorUI extends UI {
  constructor() {
    super('toolbar');
    this.color = this.add('input');
    this.color.type = 'color';
    this.color.addEventListener('change', ({ target: { value: color } }) => {
      this.setColor(color);
    }, false);
    this.setColor('#bebebe');
    this.buttons = [
      {
        label: 'Floor',
        tool: 1,
      },
      {
        label: 'Wall',
        tool: 2,
      },
      {
        label: 'Erase',
        tool: 0,
      },
    ].map(({ label, tool }) => {
      const button = this.add('button');
      button.innerText = label;
      button.tool = tool;
      button.addEventListener('click', () => {
        this.setTool(tool);
      }, false);
      return button;
    });
    this.setTool(1);
    this.mount();
  }

  setColor(value) {
    const { color } = this;
    color.value = value;
    if (this.onColorChange) {
      this.onColorChange(value);
    }
  }

  setTool(value) {
    const { buttons } = this;
    buttons.forEach((button) => {
      button.className = button.tool === value ? 'active' : '';
    });
    this.tool = value;
    if (this.onToolChange) {
      this.onToolChange(value);
    }
  }
}

export default EditorUI;
