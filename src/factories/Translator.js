/**
 * @author rik
 */
import _ from 'lodash';

/**
 * The Translator is in charge of executing policies. Policies can be provided when constructing or when constructed by using the {@link Translator#add} method, policies can be executed using the {@link Translator#execute} method. For information on the req object passed into policies, please refer to the documentation of the {@link Request}.
 *
 * @class Translator
 *
 * @param options {Object} Object with the properties listed below
 *
 * @property locales {Object<Object>} Hashmap with locales
 * @property defaultLocale {String} Name/key of the default locale
 * @property options {Object} The options object passed in
 *
 * @todo implement converters
 *
 * @example
 * const translator = Translator({
 *   defaultLocale: 'en-GB',
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
  const props = {
    locales: {
      value: options.locales || {}
    },
    locale: {
      value: options.defaultLocale,
      writable: true
    },
    options: {
      value: options
    }
  };

  return Object.create(Translator.prototype, props);
}

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
      _.each(name, (_languageDefinition, _name) => {
        this.add(_name, _languageDefinition);
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
   * Translates a word with data
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
   * translator.translate('basic.greet', {name: 'BOB'});
   * // returns something like 'hello BOB!'
   */
  translate(key, data = {}) {
    if (!this.currentLocale) {
      throw new Error(`Can't translate '${key}', no current locale.`);
    }

    let translation = _.get(this.currentLocale.words, key);

    if (!translation) {
      throw new Error(`Can't translate '${key}', word not defined.`);
    }

    const variableMatches = translation.match(/\{\{\s*([\s|\S]+)\s*\}\}/g);

    _.each(variableMatches, (match) => {
      const key = match.replace(/\{|\}|\s/g, '');
      translation = translation.replace(match, data[key]);
    });

    return translation;
  }

};

export default Translator;