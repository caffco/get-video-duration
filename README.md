
# get-video-duration

[![NPM version][npm-image]][npm-url]
[![Node version][node-image]][node-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

Get the duration of an audio with `ffprobe`.
Requires the `ffprobe` binary installed.

# Install

```bash
$ npm install --save get-video-duration
```

# Usage

```js
const getDuration = require('get-video-duration');

// From a local path...
getDuration('video.mov').then((duration) => {
  console.log(duration);
});

// From a URL...
getDuration('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4').then((duration) => {
  console.log(duration);
});

// From a readable stream...

const fs = require('fs');
const stream = fs.createReadStream('video.mov');

getDuration(stream).then((duration) => {
  console.log(duration);
});
```

# License

MIT. Based on [get-video-dimensions](https://github.com/mgmtio/get-video-dimensions).

[npm-image]: https://img.shields.io/npm/v/get-video-duration.svg
[npm-url]: https://npmjs.org/package/get-video-duration
[node-image]: https://img.shields.io/node/v/get-video-duration.svg
[node-url]: https://npmjs.org/package/get-video-duration
[travis-image]: https://img.shields.io/travis/caffco/get-video-duration.svg
[travis-url]: https://travis-ci.org/caffco/get-video-duration
[coveralls-image]: https://img.shields.io/coveralls/caffco/get-video-duration.svg
[coveralls-url]: https://coveralls.io/r/caffco/get-video-duration
[david-image]: http://img.shields.io/david/caffco/get-video-duration.svg
[david-url]: https://david-dm.org/caffco/get-video-duration
[license-image]: http://img.shields.io/npm/l/get-video-duration.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/get-video-duration.svg
[downloads-url]: https://npmjs.org/package/get-video-duration
