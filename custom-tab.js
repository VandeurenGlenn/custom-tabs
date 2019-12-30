(function () {
  'use strict';

  customElements.define('custom-tab', class CustomTab extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = this.template;
      this._onMouseIn = this._onMouseIn.bind(this);
      this._onMouseOut = this._onMouseOut.bind(this);
    }

    connectedCallback() {
      this.addEventListener('mouseover', this._onMouseIn);
      this.addEventListener('mouseout', this._onMouseOut);
    }

    disconnected() {
      this.removeEventListener('mouseover', this._onMouseIn);
      this.removeEventListener('mouseout', this._onMouseOut);
    }

    _onMouseIn() {
      this.classList.add('over');
    }

    _onMouseOut() {
      this.classList.remove('over');
    }

    get template() {
      return `
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
        
        --tab-underline-color:  #00B8D4;
      }

      :host(.custom-selected) {
        border-bottom: 2px solid var(--tab-underline-color);
      }
      
      ::slotted(*) {
        pointer-events: none;
      }
    </style>
    <slot></slot>
    `;
    }
  });

}());
