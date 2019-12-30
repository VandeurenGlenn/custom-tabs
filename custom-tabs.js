(function () {
  'use strict';

  /**
   * @mixin Backed
   * @module utils
   * @export merge
   *
   * some-prop -> someProp
   *
   * @param {object} object The object to merge with
   * @param {object} source The object to merge
   * @return {object} merge result
   */
  var merge = (object = {}, source = {}) => {
    // deep assign
    for (const key of Object.keys(object)) {
      if (source[key]) {
        Object.assign(object[key], source[key]);
      }
    }
    // assign the rest
    for (const key of Object.keys(source)) {
      if (!object[key]) {
        object[key] = source[key];
      }
    }
    return object;
  }

  window.Backed = window.Backed || {};
  // binding does it's magic using the propertyStore ...
  window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

  // TODO: Create & add global observer
  var PropertyMixin = base => {
    return class PropertyMixin extends base {
      static get observedAttributes() {
        return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
      }

      get properties() {
        return customElements.get(this.localName).properties;
      }

      constructor() {
        super();
        if (this.properties) {
          for (const entry of Object.entries(this.properties)) {
            const { observer, reflect, renderer } = entry[1];
            // allways define property even when renderer is not found.
            this.defineProperty(entry[0], entry[1]);
          }
        }
      }

      connectedCallback() {
        if (super.connectedCallback) super.connectedCallback();
        if (this.attributes)
          for (const attribute of this.attributes) {
            if (String(attribute.name).includes('on-')) {
              const fn = attribute.value;
              const name = attribute.name.replace('on-', '');
              this.addEventListener(String(name), event => {
                let target = event.path[0];
                while (!target.host) {
                  target = target.parentNode;
                }
                if (target.host[fn]) {
                  target.host[fn](event);
                }
              });
            }
        }
      }

      attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
      }

      /**
       * @param {function} options.observer callback function returns {instance, property, value}
       * @param {boolean} options.reflect when true, reflects value to attribute
       * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
       */
      defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
        Object.defineProperty(this, property, {
          set(value) {
            if (value === this[`___${property}`]) return;
            this[`___${property}`] = value;

            if (reflect) {
              if (value) this.setAttribute(property, String(value));
              else this.removeAttribute(property);
            }

            if (observer) {
              if (observer in this) this[observer]();
              else console.warn(`observer::${observer} undefined`);
            }

            if (renderer) {
              const obj = {};
              obj[property] = value;
              if (renderer in this) this.render(obj, this[renderer]);
              else console.warn(`renderer::${renderer} undefined`);
            }

          },
          get() {
            return this[`___${property}`];
          },
          configurable: strict ? false : true
        });
        // check if attribute is defined and update property with it's value
        // else fallback to it's default value (if any)
        const attr = this.getAttribute(property);
        this[property] = attr || this.hasAttribute(property) || value;
      }
    }
  }

  var SelectMixin = base => {
    return class SelectMixin extends PropertyMixin(base) {

      static get properties() {
        return merge(super.properties, {
          selected: {
            value: 0,
            observer: '__selectedObserver__'
          }
        });
      }

      constructor() {
        super();
      }

      get slotted() {
        return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
      }

      get _assignedNodes() {
        return 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
      }

      /**
      * @return {String}
      */
      get attrForSelected() {
        return this.getAttribute('attr-for-selected') || 'name';
      }

      set attrForSelected(value) {
        this.setAttribute('attr-for-selected', value);
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
          // check if value is number
          if (!isNaN(newValue)) {
            newValue = Number(newValue);
          }
          this[name] = newValue;
        }
      }

      /**
       * @param {string|number|HTMLElement} selected
       */
      select(selected) {
        this.selected = selected;
      }

      next(string) {
        const index = this.getIndexFor(this.currentSelected);
        if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
            (index + 1) <= this._assignedNodes.length - 1) {
          this.selected = this._assignedNodes[index + 1];
        }
      }

      previous() {
        const index = this.getIndexFor(this.currentSelected);
        if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
            (index - 1) >= 0) {
          this.selected = this._assignedNodes[index - 1];
        }
      }

      getIndexFor(element) {
        if (element && element instanceof HTMLElement === false)
          return console.error(`${element} is not an instanceof HTMLElement`);

        return this._assignedNodes.indexOf(element || this.selected);
      }

      _updateSelected(selected) {
        selected.classList.add('custom-selected');
        if (this.currentSelected && this.currentSelected !== selected) {
          this.currentSelected.classList.remove('custom-selected');
        }
        this.currentSelected = selected;
      }

      /**
       * @param {string|number|HTMLElement} change.value
       */
      __selectedObserver__(value) {
        switch (typeof this.selected) {
          case 'object':
            this._updateSelected(this.selected);
            break;
          case 'string':
            for (const child of this._assignedNodes) {
              if (child.nodeType === 1) {
                if (child.getAttribute(this.attrForSelected) === this.selected) {
                  return this._updateSelected(child);
                }
              }
            }
            if (this.currentSelected) {
              this.currentSelected.classList.remove('custom-selected');
            }
            break;
          default:
            // set selected by index
            const child = this._assignedNodes[this.selected];
            if (child && child.nodeType === 1) {
              this._updateSelected(child);
            // remove selected even when nothing found, better to return nothing
            } else if (this.currentSelected) {
              this.currentSelected.classList.remove('custom-selected');
            }
        }
      }
    }
  }

  var SelectorMixin = base => {
    return class SelectorMixin extends SelectMixin(base) {

    static get properties() {
        return merge(super.properties, {
          selected: {
            value: 0,
            observer: '__selectedObserver__'
          }
        });
      }
      constructor() {
        super();
      }
      connectedCallback() {
        super.connectedCallback();
        this._onClick = this._onClick.bind(this);
        this.addEventListener('click', this._onClick);
      }
      disconnectedCallback() {
        this.removeEventListener('click', this._onClick);
      }
      _onClick(event) {
        const target = event.path[0];
        const attr = target.getAttribute(this.attrForSelected);
        if (target.localName !== this.localName) {
          this.selected = attr ? attr : target;
          this.dispatchEvent(new CustomEvent('selected', { detail: this.selected }));
        }
      }
    }
  }

  customElements.define('custom-tabs', class CustomTabs extends SelectorMixin(HTMLElement) {
    constructor() {
      super();
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

}());
