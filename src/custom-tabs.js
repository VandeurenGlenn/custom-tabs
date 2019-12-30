import SelectorMixin from './../node_modules/custom-select-mixins/src/selector-mixin.js';

customElements.define('custom-tabs', class CustomTabs extends SelectorMixin(HTMLElement) {
  constructor() {
    super()
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = this.template;
  }
  // TODO: make scrollable
  get template() {
    return `
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
