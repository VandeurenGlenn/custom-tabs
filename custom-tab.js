import { define } from '../backed/src/utils.js';
import LitMixin from '../backed/mixins/lit-mixin.js'
export default define(class CustomTab extends LitMixin(HTMLElement) {
  constructor() {
    super();
    this._onMouseIn = this._onMouseIn.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseover', this._onMouseIn)
    this.addEventListener('mouseout', this._onMouseOut)
  }

  disconnected() {
    this.removeEventListener('mouseover', this._onMouseIn)
    this.removeEventListener('mouseout', this._onMouseOut)
  }

  _onMouseIn() {
    this.classList.add('over');
  }

  _onMouseOut() {
    this.classList.remove('over');
  }

  render() {
    return html`
    <style>
      :host {
        position: relative;
        display: inline-flex;
        width: 148px;
        height: 48px;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        box-sizing: border-box;
        cursor: pointer;

        --svg-icon-size: 16px;
        --svg-icon-color: #EEE;
      }

      :host(.custom-selected) {
        border-bottom: 2px solid #00B8D4;
      }
    </style>
    <slot></slot>
    `;
  }
});
