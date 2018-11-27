import {
  Vector3,
} from 'three';

class AI {
  constructor(building) {
    this.building = building;
    this.actors = [];
  }

  addActor({
    actor,
    floor,
    position,
  }) {
    const { actors } = this;
    actors.push({
      actor,
      floor,
      position,
      lastThought: 0,
      state: AI.states.IDLE,
    });
  }

  onAnimationTick({ time }) {
    const { actors, building } = this;
    actors.forEach((actor) => {
      const {
        floor,
        position,
        lastThought,
        state,
      } = actor;
      if (state === AI.states.IDLE) {
        if (time - lastThought > 3) {
          actor.lastThought = time;
          if (Math.random() > 0.75) {
            actor.state = AI.states.WALKING;
          }
        }
        switch (actor.state) {
          case AI.states.WALKING: {
            const { walkable } = building.floors[floor];
            const { finder, grid } = walkable;
            let destination;
            let path;
            grid.setWalkableAt(position.x, position.z, true);
            do {
              destination = {
                x: Math.floor(Math.random() * grid.width),
                z: Math.floor(Math.random() * grid.height),
              };
              path = finder.findPath(
                position.x, position.z,
                destination.x, destination.z,
                grid.clone()
              )
                .map(([x, z]) => (
                  walkable.localToWorld(new Vector3(x + 0.5, 0, z + 0.5))
                ));
            } while (
              path.length < 2
            );
            grid.setWalkableAt(destination.x, destination.z, false);
            actor.actor.walk(path.slice(1), () => {
              position.x = destination.x;
              position.z = destination.z;
              actor.lastThought = time;
              actor.state = AI.states.IDLE;
            });
            break;
          }
          default:
            break;
        }
      }
    });
  }
}

AI.states = {
  IDLE: 0,
  WALKING: 1,
};

export default AI;
