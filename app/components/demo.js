import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { TrackedMap } from 'tracked-built-ins';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

export default class Demo extends Component {
  @tracked showWorkingCase = false;
  @tracked showFailingCase = false;

  preferences = new TrackedPreferences();

  preferences2 = new TwoTrackedTwoPreferences();

  toggleWorking = () => (this.showWorkingCase = !this.showWorkingCase);
  toggleFailing = () => (this.showFailingCase = !this.showFailingCase);

  get working() {
    return this.preferences2.forPlugin('my-plugin-name')?.theValue;
  }

  updateWorking = () =>
    this.preferences2.forPlugin('my-plugin-name')?.update('updated');

  get failing() {
    return this.preferences.forPlugin('my-plugin-name').theValue;
  }

  updateFailing = () =>
    this.preferences.forPlugin('my-plugin-name')?.update('updated');
}

setComponentTemplate(
  hbs`
  Works: <br>
  <button {{on 'click' this.toggleWorking}}>toggle</button> |
  <button {{on 'click' this.updateWorking}}>update</button><br>
  {{#if this.showWorkingCase}}
    {{this.working}}
  {{/if}}

  <hr>

  Does not work (causes backtracking assertion): <br>
  <button {{on 'click' this.toggleFailing}}>toggle</button> |
  <button {{on 'click' this.updateFailing}}>update</button><br>
  {{#if this.showFailingCase}}
    {{this.failing}}
  {{/if}}
`,
  Demo
);

let CACHE = new Map();
class TwoTrackedTwoPreferences {
  plugins = new TrackedMap();

  forPlugin = (name) => {
    let existing = this.plugins.get(name);

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

      let fnCache = new Map();
      let self = this; // WHAT YEAR IS IT?!?!?!?
      return new Proxy(inCache, {
        get(target, property, receiver) {
          let value = Reflect.get(target, property, receiver);

          if (typeof value === 'function') {
            let cachedFn = fnCache.get(property);

            if (cachedFn) {
              return cachedFn;
            }

            let newFn = function (...args) {
              /**
               * Doing this means that next time `forPlugin` is called, we'll skip all of this
               * and "just return 'existing'" below
               */
              self.plugins.set(name, existing);

              return value(...args);
            };

            newFn.bind(receiver);
            fnCache.set(property, newFn);

            return newFn;
          }

          return value;
        },
      });
    }

    return existing;
  };
}

class TrackedPreferences {
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
