import UI from '@/core/ui';

class EditorUI extends UI {
  constructor() {
    super('toolbar');
    this.buttons = ['Air', 'Floor', 'Wall'].map((label, tool) => {
      const button = this.add('button');
      button.innerText = label;
      button.addEventListener('click', () => {
        this.setTool(tool);
      }, false);
      return button;
    });
    this.setTool(1);
    this.color = this.add('input');
    this.color.type = 'color';
    this.color.addEventListener('change', ({ target: { value: color } }) => {
      this.setColor(color);
    }, false);
    this.setColor('#bebebe');
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
    buttons.forEach((button, tool) => {
      button.className = tool === value ? 'active' : '';
    });
    this.tool = value;
    if (this.onToolChange) {
      this.onToolChange(value);
    }
  }
}

export default EditorUI;
