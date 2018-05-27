import define from '../../backed/src/utils/define.js';
import RenderMixin from '../../custom-renderer-mixin/src/render-mixin.js';
import CustomSelectorMixin from '../../custom-select-mixins/src/selector-mixin.js'

define(class CustomTabs extends RenderMixin(CustomSelectorMixin(HTMLElement)) {
  constructor() {
    super()
  }
  // TODO: make scrollable
  get template() {
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
