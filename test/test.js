/* eslint-env node, mocha */
/* eslint comma-dangle: ["error", {"functions": "never"}] */
/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */

const { expect } = require('chai');

const tmp = require('tmp');

const http = require('http');
const fs = require('fs');

const videoURL = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4';
const videoDuration = 60;
const videoDurationThreshold = 1;

/**
 * Downloads file at given URL to a temporary file.
 *
 * @param  {String} url URL to be downloaded.
 *
 * @return {Promise} Promise that will be resolved with path to downloaded file.
 */
const download = (url) => {
  const tmpFilePromise = new Promise((fulfill, reject) => {
    tmp.file((err, path, fd) => {
      if (err) {
        return reject(err);
      }
      return fulfill({ path, fd });
    });
  });

  const downloadPromise = tmpFilePromise.then((tmpFile) => {
    const { path } = tmpFile;
    return new Promise((fulfill, reject) => {
      http.get(url, (res) => {
        res.pipe(fs.createWriteStream(path));
        res.on('end', () => { fulfill(path); });
        res.on('error', (err) => { reject(err); });
      });
    });
  });

  return downloadPromise;
};

const getDuration = require('../src');

describe('get-video-duration', function () {
  context('when using a readable stream', function () {
    it('should return proper duration', function () {
      return download(videoURL)
      .then(path => fs.createReadStream(path))
      .then(getDuration)
      .then(d => expect(d).to.be.closeTo(videoDuration, videoDurationThreshold));
    });
  });

  context('when using a file path', function () {
    it('should return proper duration', function () {
      return download(videoURL)
      .then(getDuration)
      .then(d => expect(d).to.be.closeTo(videoDuration, videoDurationThreshold));
    });
  });

  context('when using a URL', function () {
    it('should return proper duration', function () {
      return getDuration(videoURL)
      .then(d => expect(d).to.be.closeTo(videoDuration, videoDurationThreshold));
    });
  });
});
