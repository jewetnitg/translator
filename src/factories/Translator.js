/**
 * @author rik
 */
import _ from 'lodash';
import escapeRegExp from '../helpers/escapeRegExp';

/**
 * The Translator is in charge of executing policies. Policies can be provided when constructing or when constructed by using the {@link Translator#add} method, policies can be executed using the {@link Translator#execute} method. For information on the req object passed into policies, please refer to the documentation of the {@link Request}.
 *
 * @class Translator
 *
 * @param options {Object} Object with the properties listed below
 *
 * @property locales {Object<Object>} Hashmap with locales
 * @property defaultLocale {String} Name/key of the default locale
 * @property delimiters {Array<String>} Array with two items, the start and end delimiter for template variables respectively
 * @property options {Object} The options object passed in
 *
 * @example
 * const translator = Translator({
 *   defaultLocale: 'en-GB',
 *   delimiters: ['{{', '}}'],
 *   locales: {
 *     'en-GB': {
 *       words: {
 *         'test': 'Test {{name}}!'
 *       },
 *       converters: {}
 *     }
 *   }
 * });
 */
function Translator(options = {}) {
  _.defaults(options, Translator.defaults);

  const startDelimiter = escapeRegExp(options.delimiters[0]);
  const endDelimiter = escapeRegExp(options.delimiters[1]);

  const props = {
    locales: {
      value: options.locales || {}
    },
    locale: {
      value: options.defaultLocale,
      writable: true
    },
    startDelimiterRegex: {
      value: new RegExp(`^${startDelimiter}`)
    },
    endDelimiterRegex: {
      value: new RegExp(`${endDelimiter}$`)
    },
    templateRegex: {
      value: new RegExp(`${startDelimiter}\\s*([\\s|\\S]+)\\s*${endDelimiter}`, 'g')
    },
    options: {
      value: options
    }
  };

  return Object.create(Translator.prototype, props);
}

/**
 * Defaults for the options passed into the {@link Translator} factory
 *
 * @name defaults
 * @memberof Translator
 * @static
 * @type Object
 * @property {Array<String>} [delimiters=['{{', '}}']] The start and end delimiter for template variables
 */
Translator.defaults = {
  delimiters: ['{{', '}}']
};

Translator.prototype = {

  /**
   * Converters for the current locale
   * @name converters
   * @memberof Translator
   * @instance
   * @type Object
   */
  get converters() {
    return this.currentLocale && this.currentLocale.converters
  },

  /**
   * Words for the current locale
   * @name words
   * @memberof Translator
   * @instance
   * @type Object
   */
  get words() {
    return this.currentLocale && this.currentLocale.words
  },

  /**
   * The current locale object
   * @name currentLocale
   * @memberof Translator
   * @instance
   * @type Object
   */
  get currentLocale() {
    return this.locale && this.locales[this.locale];
  },

  /**
   * Adds one or more languages.
   *
   * @memberof Translator
   * @instance
   *
   * @param name {String|Object} Name of the language, or a hashmap of policies
   * @param localeDefinition {Object|undefined} The definition of the language, has a words and converters property
   *
   * @example
   * translator.add('nl-NL', {
   *   words: {},
   *   converters: {
   *     currency() {},
   *     temperature() {}
   *   }
   * });
   * // or
   * translator.add({
   *   'nl-NL': {
   *     words: {},
   *     converters: {
   *       currency() {},
   *       temperature() {}
   *     }
   *   }
   * });
   */
  add(name, localeDefinition) {
    const type = typeof name;
    if (type === 'object') {
      _.each(name, (_localeDefinition, _name) => {
        this.add(_name, _localeDefinition);
      });
    } else if (type === 'string') {
      this.locales[name] = localeDefinition;
    }
  },

  /**
   * Sets the current locale
   *
   * @method setLocale
   * @memberof Translator
   * @instance
   *
   * @param locale {String} The locale to set
   * @example
   * translator.setLocale('en-GB')
   */
  setLocale(locale) {
    if (!this.locales[locale]) {
      throw new Error(`Can't set locale to '${locale}', locale doesn't exist.`);
    }

    this.locale = locale;
  },

  /**
   * Translates a word with data, key may be a path (like 'basic.yes')
   *
   * @method translate
   * @memberof Translator
   * @instance
   *
   * @param key {String} The key of the word to translate (may be deep using dots)
   * @param {Object} [data={}] - Data to fill the translation with
   *
   * @returns {String}
   *
   * @example
   * // where the translation for 'basic.greet' is 'hello {{model.name}}!'
   * < translator.translate('basic.greet', {model: {name: 'BOB'}});
   * > "hello BOB!"
   */
  translate(key, data = {}) {
    if (!this.currentLocale) {
      throw new Error(`Can't translate '${key}', no current locale.`);
    }

    let translation = _.get(this.currentLocale.words, key);

    if (!translation) {
      throw new Error(`Can't find translation for '${key}', translation not found for the current locale '${this.locale}'.`);
    }

    const variableMatches = translation.match(this.templateRegex);

    _.each(variableMatches, (match) => {
      const key = match.replace(this.startDelimiterRegex, '').replace(this.endDelimiterRegex, '').replace(/\s+/g, '');
      let val = _.get(data, key);
      val = typeof val !== 'undefined' ? val : "";

      translation = translation.replace(match, val);
    });

    return translation;
  }

};

export default Translator;