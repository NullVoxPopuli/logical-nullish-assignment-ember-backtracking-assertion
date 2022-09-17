import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

import { TrackedPreferences as One } from './using-tracked-map';
import { TwoTrackedTwoPreferences as Two } from './using-proxies';
import { ThreeTrackedAmigos as Three } from './using-deep-tracked';

const TEXT1 = 'update was clicked';
const TEXT2 = 'set was clicked';

export default class Demo extends Component {
  Scenario = Demonstration;
  preferences = new One();
  preferences2 = new Two();
  preferences3 = new Three();

  get one() {
    return this.preferences.forPlugin('my-plugin').theValue;
  }

  get two() {
    return this.preferences2.forPlugin('my-plugin')?.theValue;
  }

  get three() {
    return this.preferences3.forPlugin('my-plugin')?.theValue;
  }

  updateOne = () => this.preferences.forPlugin('my-plugin').update(TEXT1);
  updateTwo = () => this.preferences2.forPlugin('my-plugin').update(TEXT1);
  updateThree = () => this.preferences3.forPlugin('my-plugin').update(TEXT1);

  setOne = () => (this.preferences.forPlugin('my-plugin').theValue = TEXT2);
  setTwo = () => (this.preferences2.forPlugin('my-plugin').theValue = TEXT2);
  setThree = () => (this.preferences3.forPlugin('my-plugin').theValue = TEXT2);
}

setComponentTemplate(
  hbs`
  For each of these scenarios, the succes criteria is:
  <ul>
    <li>Click toggle first</li>
    <li>Observe no error in the console</li>
    <li>Clicking the 'update' button appropriately updates the text</li>
    <li>To reset, refresh the page</li>
    <li>atm, the only working demo is "using proxies"</li>
  </ul>

  <this.Scenario @title="Using TrackedMap" @update={{this.updateOne}} @set={{this.setOne}}>
    theValue: {{this.one}}
  </this.Scenario>

  <this.Scenario @title="Using proxies" @update={{this.updateTwo}} @set={{this.setTwo}}>
    theValue: {{this.two}}
  </this.Scenario>

  <this.Scenario @title="Using deepTracked" @update={{this.updateThree}} @set={{this.setThree}}>
    theValue: {{this.three}}
  </this.Scenario>
`,
  Demo
);

class Demonstration extends Component {
  @tracked visible = false;

  toggle = () => (this.visible = !this.visible);
}

setComponentTemplate(
  hbs`
  <fieldset>
    <legend>
      {{@title}}
    </legend>

    <button {{on 'click' this.toggle}}>toggle</button> |
    <button {{on 'click' @update}}>update</button> |
    <button {{on 'click' @set}}>set</button><br>

    {{#if this.visible}}
      {{yield}}
    {{/if}}

  </fieldset>
`,
  Demonstration
);
