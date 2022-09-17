import { deepTracked } from 'ember-deep-tracked';

export class ThreeTrackedAmigos {
  @deepTracked plugins = {};

  forPlugin = (name) => {
    /**
     * but using deepTracked, we can't have a default
     * value of a class (it works only on objects, arrays, and primitives)
     */
    // let existing = this.plugins[name]; /* as TrackedPreferences */
    // if (!this.plugins[name]) {
    //   this.plugins[name] = {};
    // }

    /**
      * This doesn't work as it intially returns undefined
      * and we can't do `undefined.property = newthing`
      */
    return this.plugins[name] /* as TrackedPluginPrefs */;
  };
}
