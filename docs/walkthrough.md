```
const translator = Translator({
  defaultLocale: 'en-GB',
  locales: {
    'en-GB': {
      words: {
        'test': 'Test {{name}}!'
      },
      converters: {}
    }
  }
});

const translated = translator.translate('test', {
  name: 'Bob'
});

// returns 'Test Bob!'
```

for a full specification of the {@link Translator} class please refer to it's documentation.