
# get-video-duration

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![NPM bundle size (minified)][bundle-size-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]

Get the duration of video files/streams with `ffprobe`.

# Install

```bash
$ npm install --save get-video-duration
```

# Usage

```js
const { getVideoDurationInSeconds } = require('get-video-duration')

// From a local path...
getVideoDurationInSeconds('video.mov').then((duration) => {
  console.log(duration)
})

// From a URL...
getVideoDurationInSeconds('http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4').then((duration) => {
  console.log(duration)
})

// From a readable stream...

const fs = require('fs')
const stream = fs.createReadStream('video.mov')

getVideoDurationInSeconds(stream).then((duration) => {
  console.log(duration)
})
```

# License

MIT. Based on [get-video-dimensions](https://github.com/mgmtio/get-video-dimensions).

[npm-image]: https://img.shields.io/npm/v/get-video-duration.svg
[npm-url]: https://npmjs.org/package/get-video-duration
[bundle-size-image]: https://img.shields.io/bundlephobia/min/get-video-duration.svg
[travis-image]: https://img.shields.io/travis/caffco/get-video-duration.svg
[travis-url]: https://travis-ci.org/caffco/get-video-duration
[codecov-image]: https://codecov.io/gh/caffco/get-video-duration/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/caffco/get-video-duration
[david-image]: http://img.shields.io/david/caffco/get-video-duration.svg
[david-url]: https://david-dm.org/caffco/get-video-duration
[license-image]: http://img.shields.io/npm/l/get-video-duration.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/get-video-duration.svg
[downloads-url]: https://npmjs.org/package/get-video-duration
