class Music {
  static shuffle(tracks) {
    for (let index = tracks.length - 1; index >= 0; index -= 1) {
      const random = Math.floor(Math.random() * tracks.length);
      const temp = tracks[index];
      tracks[index] = tracks[random];
      tracks[random] = temp;
    }
    return tracks;
  }

  constructor({ toggle }) {
    const loaded = () => {
      this.api = window.SC;
      this.api.initialize({
        client_id: 'eb5fcff9e107aab508431b4c3c416415',
      });
      // this.api.resolve('https://soundcloud.com/travis-stanley-3/sets/jazz-noir-dark-jazz').then(({ tracks }) => {
      //   console.log(JSON.stringify(tracks.map(({ id }) => (id))));
      // });
      // eslint-disable-next-line
      this.tracks = Music.shuffle([14281750,14449372,201545618,130450594,43516158,20969172,6582510,89379153,96594845,199889475,137188503,74658085,90256034,183847047,3916883]);
      this.track = 0;
      toggle.addEventListener('click', () => this.toggle(toggle), false);
      if (this.wantsToPlay) {
        delete this.wantsToPlay;
        this.play();
      }
    };
    const check = () => {
      if (!window.SC) {
        setTimeout(check, 10);
        return;
      }
      loaded();
    };
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://connect.soundcloud.com/sdk/sdk-3.3.1.js';
    document.body.appendChild(script);
    check();
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
    if (!api) {
      this.wantsToPlay = true;
      return;
    }
    if (player) {
      player.kill();
      delete this.player;
    }
    const id = tracks[track];
    if (!__PRODUCTION__) console.log(`playing: ${id}`);
    api.stream(`/tracks/${id}`).then((player) => {
      this.player = player;
      player.on('audio_error', () => this.next());
      player.on('finish', () => this.next());
      player.setVolume(0.8);
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
