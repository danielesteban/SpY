class UI {
  constructor(className) {
    this.wrapper = document.createElement('div');
    this.wrapper.className = className;
    this.content = document.createElement('div');
    this.wrapper.appendChild(this.content);
  }

  mount() {
    const { wrapper } = this;
    document.body.appendChild(wrapper);
  }

  unmount() {
    const { wrapper } = this;
    document.body.removeChild(wrapper);
  }

  add(tag, className) {
    const { content } = this;
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    content.appendChild(node);
    return node;
  }

  empty() {
    const { content } = this;
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }
  }
}

export default UI;
