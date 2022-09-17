import { tracked } from '@glimmer/tracking';
import { TrackedMap } from 'tracked-built-ins';
import { readStorage, updateStorage, fnCacheFor } from './storage-helpers';

class TrackedPluginPrefs {
  @tracked theValue = 'this is the value in the "preferences"';

  update = (nextValue) => (this.theValue = nextValue);
}

let CACHE = new Map();
export class TwoTrackedTwoPreferences {
  plugins = new TrackedMap();

  forPlugin = (name) => {
    let existing = this.plugins.get(name);
    readStorage(this, name);

    /**
     * Normally, in a !existing check, we'd set the value on the Map... but,
     *
     * We can't call set here during a data _read_, so we need to wait until
     * data is set, and then we can set.
     *
     * We can wait for a set on the plugin prefs because that can only happen outside
     * a tracking frame -- so we can wait for that to happen, and do our own
     * setting here, which will update consumers. (hopefully)
     */
    if (!existing) {
      let inCache = CACHE.get(name);

      if (!inCache) {
        inCache = new TrackedPluginPrefs();
        CACHE.set(name, inCache);
      }

      let self = this; // WHAT YEAR IS IT?!?!?!?
      let proxy = new Proxy(inCache, {
        get(target, property, receiver) {
          let value = Reflect.get(target, property, receiver);

          if (typeof value === 'function') {
            let fnCache = fnCacheFor(target);
            let existing = fnCache.get(property);

            if (!existing) {
              let newFn = function (...args) {
                /**
                 * Doing this means that next time `forPlugin` is called, we'll skip all of this
                 * and "just return 'existing'" below
                 */
                self.plugins.set(name, inCache);
                updateStorage(self, name);

                return value.call(target, ...args);
              };

              fnCache.set(property, newFn);

              return newFn;
            }

            return existing;
          }

          return value;
        },
      });

      console.log(proxy);

      return proxy;
    }

    console.log(existing);

    return existing;
  };
}
