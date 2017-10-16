import { define } from '../backed/src/utils.js';
import LitMixin from '../backed/mixins/lit-mixin.js'
import CustomSelectorMixin from '../custom-select-mixins/custom-selector-mixin.js'

define(class CustomTabs extends LitMixin(CustomSelectorMixin(HTMLElement)) {
  constructor() {
    super()
  }
  // TODO: make scrollable
  render() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          /*align-items: flex-end;*/
          height: var(--custom-tabs-height, 48px);
        }
      </style>
      <slot></slot>
    `;
  }
});
