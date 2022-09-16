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

  @tracked watTracked = 2;

  get wat() {
    this.watTracked = 3;
    return this.watTracked;
  }

  get working() {
    // ??? not this
    // return this.preferences2.forPlugin('my-plugin-name');
  }

  get failing() {
    return this.preferences.forPlugin('my-plugin-name');
  }
}

setComponentTemplate(
  hbs`
  Works: <br>{{this.wat}}<br>

  Why tho? no read before set?
  How do you do ||= or ??= with tracked?
  <hr>



  Works (not implemented): <br>
  <button {{on 'click' this.toggleWorking}}>toggle</button><br>
  {{#if this.showWorkingCase}}
    {{this.working}}
  {{/if}}

  <hr>

  Does not work (causes backtracking assertion): <br>
  <button {{on 'click' this.toggleFailing}}>toggle</button><br>
  {{#if this.showFailingCase}}
    {{this.failing}}
  {{/if}}
`,
  Demo
);

class TwoTrackedTwoPreferences {
  // ???

  forPlugin = (name) => {
    let existing = this.plugins.get(name);

    if (!existing) {
      existing = new TrackedPluginPrefs();
      // ???
      this.plugins.set(name, existing);
    }

    return existing;
  }
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
  }
}

class TrackedPluginPrefs {

}
