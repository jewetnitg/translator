/**
 * @author rik
 */
import Translator from '../../src/factories/Translator';

describe(`Translator`, () => {

  it(`should be a function`, (done) => {
    expect(Translator).to.be.a('function');
    done();
  });

  describe(`const translator = Translator(Object options)`, () => {

    it(`should add the provided locales`, (done) => {
      const expected = {
        words: {},
        converters: {}
      };

      const translator = Translator({
        locales: {
          'test': expected
        }
      });

      const actual = translator.locales.test;

      expect(actual).to.equal(expected);

      done();
    });

    it(`should set the default locale provided in the options`, (done) => {
      const expected = 'locale';

      const translator = Translator({
        defaultLocale: expected
      });

      const actual = translator.locale;

      expect(actual).to.equal(expected);

      done();
    });

    describe(`translator.add(String locale, Object localeDefinition)`, () => {

      it(`should add the locale`, (done) => {
        const expected = {};

        const translator = Translator();

        translator.add('name', expected);
        const actual = translator.locales.name;

        expect(actual).to.equal(expected);
        done();
      });

    });

    describe(`translator.add(Object locales)`, () => {

      it(`should add the locale`, (done) => {
        const expected = {};

        const translator = Translator();

        translator.add({
          name: expected
        });
        const actual = translator.locales.name;

        expect(actual).to.equal(expected);
        done();
      });

    });

    describe(`translator.setLocale(String locale)`, () => {

      it(`should set the locale if it exists`, (done) => {
        const expected = 'locale';

        const translator = Translator({
          locales: {
            locale: {}
          }
        });

        translator.setLocale(expected);
        const actual = translator.locale;

        expect(actual).to.equal(expected);
        done();
      });

      it(`should throw an error if the locale doesn't exist`, (done) => {
        const translator = Translator();

        expect(() => {
          translator.setLocale('locale');
        }).to.throw(Error);

        done();
      });

    });

    describe(`translator.translate(String key)`, () => {

      it(`should throw an error if no current locale is available`, (done) => {
        const translator = Translator();

        expect(() => {
          translator.translate('key');
        }).to.throw(Error);

        done();
      });

      it(`should throw an error the word doesn't exist on the current locale`, (done) => {
        const translator = Translator({
          defaultLocale: 'test',
          locales: {
            'test': {
              words: {}
            }
          }
        });

        expect(() => {
          translator.translate('key');
        }).to.throw(Error);

        done();
      });

      it(`should return the value of the word in the current locale`, (done) => {
        const expected = 'test translation';

        const translator = Translator({
          defaultLocale: 'test',
          locales: {
            'test': {
              words: {
                'test': expected
              },
              converters: {}
            }
          }
        });

        const actual = translator.translate('test');

        expect(actual).to.equal(expected);
        done();
      });

      it(`should use the delimiters provided when constructing`, (done) => {
        const value = '123';
        const expected = `test ${value} translation`;
        const translation = `test <@=value@> translation`;

        const translator = Translator({
          defaultLocale: 'test',
          delimiters: ['<@=', '@>'],
          locales: {
            'test': {
              words: {
                'test': translation
              },
              converters: {}
            }
          }
        });

        const actual = translator.translate('test', {
          value
        });

        expect(actual).to.equal(expected);
        done();
      });

      it(`should get the word deeply`, (done) => {
        const expected = 'test translation';

        const translator = Translator({
          defaultLocale: 'test',
          locales: {
            'test': {
              words: {
                'test': {
                  test2: expected
                }
              },
              converters: {}
            }
          }
        });

        const actual = translator.translate('test.test2');

        expect(actual).to.equal(expected);
        done();
      });

    });

    describe(`translator.translate(String key, Object data)`, () => {

      it(`should return the value of the word with data filled in`, (done) => {
        const value = '123';
        const expected = `test ${value} translation`;
        const translation = `test {{value}} translation`;

        const translator = Translator({
          defaultLocale: 'test',
          locales: {
            'test': {
              words: {
                'test': translation
              },
              converters: {}
            }
          }
        });

        const actual = translator.translate('test', {
          value
        });

        expect(actual).to.equal(expected);
        done();
      });

      it(`should replace template variables with no values with an empty string`, (done) => {
        const value = '123';
        const expected = `test  translation`;
        const translation = `test {{value}} translation`;

        const translator = Translator({
          defaultLocale: 'test',
          locales: {
            'test': {
              words: {
                'test': translation
              },
              converters: {}
            }
          }
        });

        const actual = translator.translate('test');

        expect(actual).to.equal(expected);
        done();
      });

      it(`should get the value to be filled in deeply`, (done) => {
        const value = '123';
        const expected = `test ${value} translation`;
        const translation = `test {{test.value}} translation`;

        const translator = Translator({
          defaultLocale: 'test',
          locales: {
            'test': {
              words: {
                'test': translation
              },
              converters: {}
            }
          }
        });

        const actual = translator.translate('test', {
          test: {
            value
          }
        });

        expect(actual).to.equal(expected);
        done();
      });

    });

  });

});