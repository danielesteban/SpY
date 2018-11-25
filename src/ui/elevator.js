import Dialog from './dialog';

class ElevatorUI extends Dialog {
  show(
    {
      floor,
      floors,
      origin,
    },
    {
      onFloor,
      onExit,
    }
  ) {
    this.empty();
    for (let i = floors - 1; i >= 0; i -= 1) {
      const button = this.add('button', floor === i ? 'active' : '');
      if (floor !== i) {
        button.addEventListener('click', (i => () => {
          this.unmount();
          onFloor(i);
        })(i), false);
      }
      button.innerText = origin.y + i;
    }
    const button = this.add('button', 'exit');
    button.addEventListener('click', () => {
      this.unmount();
      onExit();
    }, false);
    button.innerText = 'Exit elevator';
    this.mount();
  }
}

export default ElevatorUI;
