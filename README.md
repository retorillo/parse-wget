# parse-wget

[![NPM](https://img.shields.io/npm/v/parse-wget.svg)](https://www.npmjs.com/package/parse-wget)
[![MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Parses complete or incomplete output file that generated by `wget` with
`--output-file` option.

```javascript
const parseWget = require('parse-wget');
var execSync = require('child_process').execSync;
try {
   execSync('wget -rHl1 --output-file=output https://nodejs.org/en/');
}
catch (e) {
   // Ignore HTTP errors
}
console.log(parseWget('output'));
```

The above example will be parsed as follow:

```javascript
[
   // ...

   // Error
   {
      "timestamp": 1461159565,
      "remote": "http://fonts.gstatic.com/robots.txt",
      "error": {
         "code": 404,
         "message": "Not Found."
      }
   },

   // ...

   // Redirection
   {
      "timestamp": 1461159574,
      "remote": "http://www.google-analytics.com/",
      "redirect": "https://www.google.com/analytics/"
   },
   
   // ...

   // Success
   {
      "timestamp": 1461159574,
      "remote": "https://nodejs.org/static/apple-touch-icon.png",
      "length": 5823,
      "type": "image/png",
      "local": "nodejs.org/static/apple-touch-icon.png",
      "read": 5823,
      "progress": 100,
      "complete": true,
      "estimate": 0,
      "elapsed": 0.002
   },

   // ...

```

## Install

```bash
npm install --save parse-wget
```

## parseWget(outputFile, [encoding [, dotStyle]])

### Arguments

#### outputFile

Specify path of output file that generated by `wget` with `--output-file`
option.

#### encoding (Optional)

Specify encoding. this argument will be passed to `fs.fileReadSync`. `utf-8` is
default.

#### dotStyle (Optional)

This is optional argument.  Specify `dotStyle` when run wget with
`--progress=dot:style` option.  For example, when run wget with
`--progres=dot:giga`, specify `giga`.

NOTE: Current version, output from wget with `--progress=bar:force` is not
supported.

### Return Value

| Property      | Type    | Description                        |
|---------------|---------|------------------------------------|
| timestamp     | Number  | Start time in UNIX time            |
| remote        | String  | Request URL                        |
| length        | Number  | Length of content in bytes         |
| type          | String  | MIME type of content               |
| local         | String  | Saved path                         |
| read          | Number  | Total read in bytes                |
| progress      | Number  | Progress percentage                |
| complete      | Boolean | Whether download was complete      |
| estimate      | Number  | Estimate for completion in seconds |
| elapse        | Number  | Elapse for completion in seconds   |
| redirect      | String  | Redirect URL                       |
| error.code    | Number  | Error code                         |
| error.message | String  | Error message                      |

- `length` and `type` may be `undefined` or wrong because some server
  response no or wrong value.
- `elapse` is `undefined` when incomplete state(`!complete`) and its value may
  be floating number.
- `read` may be **inaccurate**. This will be roughly estimated from number of
  dots, or progress and length. Check actual data for accuracy.

## License

Distirubted under the MIT license.

Copyright (C) 2016 Retorillo
