class History {
  constructor() {
    this.past = [];
    this.future = [];
  }

  empty() {
    const { past, future } = this;
    past.length = 0;
    future.length = 0;
  }

  undo() {
    const { past, future } = this;
    const prev = past.pop();
    if (!prev) {
      return;
    }
    prev.undo();
    future.unshift(prev);
  }

  redo() {
    const { past, future } = this;
    const next = future.shift();
    if (!next) {
      return;
    }
    next.redo();
    past.push(next);
  }

  push({ undo, redo }) {
    const { past, future } = this;
    past.push({ undo, redo });
    future.length = 0;
  }
}

export default History;
