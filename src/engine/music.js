class Music {
  static shuffle(tracks) {
    let temp;
    let random;
    for (let index = tracks.length - 1; index >= 0; index -= 1) {
      random = Math.floor(Math.random() * index);
      temp = tracks[index];
      tracks[index] = tracks[random];
      tracks[random] = temp;
    }
    return tracks;
  }

  constructor({ toggle }) {
    this.api = window.SC;
    this.api.initialize({
      client_id: 'eb5fcff9e107aab508431b4c3c416415',
    });
    // this.api.resolve('https://soundcloud.com/travis-stanley-3/sets/jazz-noir-dark-jazz').then(({ tracks }) => {
    //   console.log(JSON.stringify(tracks.map(({ id }) => (id))));
    // });
    // eslint-disable-next-line
    this.tracks = Music.shuffle([15107449,14281750,135099881,11470035,14449372,132576042,201545618,7546385,199917181,130450594,43516158,20969172,209771982,29561041,6582510,89379153,96594845,187242780,193388680,199889475,2665818,8834943,187747016,137188503,74658085,151273675,177686789,135693650,90256034,51186312,183847047,3916883,167411437]);
    this.track = 0;
    toggle.addEventListener('click', () => this.toggle(toggle), false);
  }

  next() {
    this.track = (this.track + 1) % this.tracks.length;
    this.play();
  }

  play() {
    const {
      api,
      player,
      track,
      tracks,
    } = this;
    if (player) {
      player.kill();
      delete this.player;
    }
    const id = tracks[track];
    api.stream(`/tracks/${id}`).then((player) => {
      this.player = player;
      player.on('finish', () => this.next());
      player.play();
    }).catch(() => {
      this.next();
    });
  }

  toggle(button) {
    const { player } = this;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
      button.className = 'muted';
    } else {
      button.className = '';
      player.play();
    }
  }
}

export default Music;
