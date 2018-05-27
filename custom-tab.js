var CustomTab = (function () {
  'use strict';

  /**
   * Add space between camelCase text.
   */
  var unCamelCase = (string) => {
    string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
    string = string.toLowerCase();
    return string;
  };

  /**
  * Replaces all accented chars with regular ones
  */
  var replaceAccents = (string) => {
    // verifies if the String has accents and replace them
    if (string.search(/[\xC0-\xFF]/g) > -1) {
        string = string
                .replace(/[\xC0-\xC5]/g, 'A')
                .replace(/[\xC6]/g, 'AE')
                .replace(/[\xC7]/g, 'C')
                .replace(/[\xC8-\xCB]/g, 'E')
                .replace(/[\xCC-\xCF]/g, 'I')
                .replace(/[\xD0]/g, 'D')
                .replace(/[\xD1]/g, 'N')
                .replace(/[\xD2-\xD6\xD8]/g, 'O')
                .replace(/[\xD9-\xDC]/g, 'U')
                .replace(/[\xDD]/g, 'Y')
                .replace(/[\xDE]/g, 'P')
                .replace(/[\xE0-\xE5]/g, 'a')
                .replace(/[\xE6]/g, 'ae')
                .replace(/[\xE7]/g, 'c')
                .replace(/[\xE8-\xEB]/g, 'e')
                .replace(/[\xEC-\xEF]/g, 'i')
                .replace(/[\xF1]/g, 'n')
                .replace(/[\xF2-\xF6\xF8]/g, 'o')
                .replace(/[\xF9-\xFC]/g, 'u')
                .replace(/[\xFE]/g, 'p')
                .replace(/[\xFD\xFF]/g, 'y');
    }

    return string;
  };

  var removeNonWord = (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

  const WHITE_SPACES = [
      ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
      '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
      '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
      '\u205F', '\u3000'
  ];

  /**
  * Remove chars from beginning of string.
  */
  var ltrim = (string, chars) => {
    chars = chars || WHITE_SPACES;

    let start = 0,
        len = string.length,
        charLen = chars.length,
        found = true,
        i, c;

    while (found && start < len) {
        found = false;
        i = -1;
        c = string.charAt(start);

        while (++i < charLen) {
            if (c === chars[i]) {
                found = true;
                start++;
                break;
            }
        }
    }

    return (start >= len) ? '' : string.substr(start, len);
  };

  /**
  * Remove chars from end of string.
  */
  var rtrim = (string, chars) => {
    chars = chars || WHITE_SPACES;

    var end = string.length - 1,
        charLen = chars.length,
        found = true,
        i, c;

    while (found && end >= 0) {
        found = false;
        i = -1;
        c = string.charAt(end);

        while (++i < charLen) {
            if (c === chars[i]) {
                found = true;
                end--;
                break;
            }
        }
    }

    return (end >= 0) ? string.substring(0, end + 1) : '';
  }

  /**
   * Remove white-spaces from beginning and end of string.
   */
  var trim = (string, chars) => {
    chars = chars || WHITE_SPACES;
    return ltrim(rtrim(string, chars), chars);
  }

  /**
   * Convert to lower case, remove accents, remove non-word chars and
   * replace spaces with the specified delimeter.
   * Does not split camelCase text.
   */
  var slugify = (string, delimeter) => {
    if (delimeter == null) {
        delimeter = "-";
    }

    string = replaceAccents(string);
    string = removeNonWord(string);
    string = trim(string) //should come after removeNonWord
            .replace(/ +/g, delimeter) //replace spaces with delimeter
            .toLowerCase();
    return string;
  };

  /**
  * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
  */
  var hyphenate = string => {
    string = unCamelCase(string);
    return slugify(string, "-");
  }

  const shouldRegister = name => {
    return customElements.get(name) ? false : true;
  };

  var define = klass => {
    const name = hyphenate(klass.name);
    return shouldRegister(name) ? customElements.define(name, klass) : '';
  }

  const charIt = (chars, string) => `${chars[0]}${string}${chars[1]}`;

  let offset = 0;

  /**
   * @param {object} element HTMLElement
   * @param {function} template custom-html templateResult
   * @param {object} properties {}
   */
  var render = (element, template, properties) => {
    const result = template(properties);
    if (element.shadowRoot) element = element.shadowRoot;
    if (!element.innerHTML) {
      element.innerHTML = result.template;
    }
    const length = element.innerHTML.length;
    result.changes.forEach(change => {
      const position = change.from.position;
      const chars = [
        element.innerHTML.charAt(((position[0] - 1) + offset)),
        element.innerHTML.charAt(((position[1]) + offset))
      ];
      element.innerHTML = element.innerHTML.replace(
        charIt(chars, change.from.value), charIt(chars, change.to.value)
      );
      offset = element.innerHTML.length - length;
    });
    return;
  }

  // TODO: check for change & render change only
  const set = [];

  /**
   *
   * @example
   ```js
    const template = html`<h1>${'name'}</h1>`;
    let templateResult = template({name: 'Olivia'})
    element.innerHTML = templateResult.template;
    templateResult = template({name: 'Jon'})
    element.innerHTML = templateResult.template;

    // you can also update the changes only
    templateResult.changes.forEach(change => {
      change.from.value // previous value
      change.from.position // previous position
      change.to.value // new value
      change.to.position // new position
      // check https://github.com/vandeurenglenn/custom-renderer for an example how to implement.
    });

   ```
   */
  const html$1 = (strings, ...keys) => {
    return ((...values) => {
      const dict = values[values.length - 1] || {};
      let template = strings[0];
      const changes = [];
      if (values[0]  !== undefined) {
        keys.forEach((key, i) => {
          let value = Number.isInteger(key) ? values[key] : dict[key];
          if (value === undefined && Array.isArray(key)) {
            value = key.join('');
          } else if(value === undefined && !Array.isArray(key)) {
            value = set[i].value; // set previous value, doesn't require developer to pass all properties set
          }
          const string = JSON.stringify(strings[i + 1]).replace(/\r?\\n|\r/g, '').replace(/"/g, '');
          const stringLength = string.length;
          const start = template.length;
          const end = template.length + value.length;
          const position = [start, end];

          if (set[i] && set[i].value !== value) {
            changes.push({
              from: {
                value: set[i].value,
                position: set[i].position,
              },
              to: {
                value,
                position
              }
            });
            set[i].value = value;
            set[i].position = [start, end];
          } else if (!set[i]) {
            set.push({value, position: [start, end]});
            changes.push({
              from: {
                value: null,
                position
              },
              to: {
                value,
                position
              }
            });
          }
          template += `${value}${string}`;
        });
      } else {
        template += JSON.stringify(strings[0]).replace(/\r?\\n|\r/g, '').replace(/"/g, '');
      }
      return {
        template,
        changes
      };
    });
  };

  window.html = window.html || html$1;

  var RenderMixin = (base = HTMLElement) =>
  class RenderMixin extends base {

    constructor() {
      super();
        // check template for slotted and set shadowRoot when nece
      if (this.template && this.shouldAttachShadow() && !this.shadowRoot)
        this.attachShadow({mode: 'open'});
      // this._isValidRenderer(this.render);
    }

    shouldAttachShadow() {
      return Boolean(String(this.template({}).template).match(/<slot>(.*)<\/slot>/));
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
        this.render = (properties = this.properties, template = this.template) =>
          render(this, template, properties);

      if (this.render) {
        this.render();
        this.rendered = true;
      }  }
  }

  var customTab = define(class CustomTab extends RenderMixin(HTMLElement) {
    constructor() {
      super();
      this._onMouseIn = this._onMouseIn.bind(this);
      this._onMouseOut = this._onMouseOut.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();
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

  return customTab;

}());
