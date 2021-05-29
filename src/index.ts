/// <reference types="./ffprobe" />
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { path as ffprobePath } from 'node-ffprobe-installer'
import * as execa from 'execa'
import * as isStream from 'is-stream'
import { Readable } from 'stream'

function getFFprobeWrappedExecution(
  input: string | Readable
): execa.ExecaChildProcess {
  const params = ['-v', 'error', '-show_format', '-show_streams']

  if (typeof input === 'string') {
    return execa(ffprobePath, [...params, input])
  }

  if (isStream(input)) {
    return execa(ffprobePath, [...params, '-i', 'pipe:0'], {
      reject: false,
      input,
    })
  }

  throw new Error('Given input was neither a string nor a Stream')
}

/**
 * Returns a promise that will be resolved with the duration of given video in
 * seconds.
 *
 * @param  {Stream|String} input Stream or URL or path to file to be used as
 * input for `ffprobe`.
 *
 * @return {Promise} Promise that will be resolved with given video duration in
 * seconds.
 */
async function getVideoDurationInSeconds(
  input: string | Readable
): Promise<number> {
  const { stdout } = await getFFprobeWrappedExecution(input)
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/)
  if (matched && matched[1]) return parseFloat(matched[1])
  throw new Error('No duration found!')
}

export default getVideoDurationInSeconds
export { getVideoDurationInSeconds }
