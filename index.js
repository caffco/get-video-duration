const execa = require('execa');
const assert = require('assert');
const isStream = require('is-stream');

/**
 * Returns a promise wrapping the result of executing ffprobe on given file or
 * stream.
 * @param  {Stream|String} input Stream to be used as input for ffprobe or URL
 * or path to file to be used as input.
 * @return {Promise} Promise-like object wrapping ffprobe execution.
 */
const ffprobe = (input) => {
  const params = ['-v', 'error', '-show_format', '-show_streams'];
  if (isStream(input)) {
    const reject = false;
    return execa('ffprobe', [...params, '-i', 'pipe:0'], { reject, input });
  }
  return execa('ffprobe', [...params, input]);
};

/**
 * Returns a promise that will be resolved with duration of given video, as a
 * float.
 *
 * @param  {Stream|String} input Stream or URL or path to file to be used as
 * input for ffprobe.
 *
 * @return {Promise} Promise that will be resolved with given video duration, as
 * a float.
 */
module.exports = input => ffprobe(input).then((out) => {
  const { stdout } = out;
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/);
  assert(matched && matched[1], 'No duration found!');
  return parseFloat(matched[1]);
});
