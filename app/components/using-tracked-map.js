import { tracked } from '@glimmer/tracking';
import { TrackedMap } from 'tracked-built-ins';

export class TrackedPreferences {
  plugins = new TrackedMap();

  forPlugin = (name) => {
    let existing = this.plugins.get(name);

    if (!existing) {
      existing = new TrackedPluginPrefs();
      this.plugins.set(name, existing);
    }

    return existing;
  };
}

class TrackedPluginPrefs {
  @tracked theValue = 'this is the value in the "preferences"';

  update = (nextValue) => (this.theValue = nextValue);
}
