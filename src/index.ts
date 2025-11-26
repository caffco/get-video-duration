import * as http from 'http'
import * as https from 'https'
import * as ffprobe from '@ffprobe-installer/ffprobe'
import * as execa from 'execa'
import * as isStream from 'is-stream'
import { createWriteStream, promises as fsPromises } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { Readable, pipeline as streamPipeline } from 'stream'
import { promisify } from 'util'

const pipeline = promisify(streamPipeline)
const HTTP_PROTOCOLS = new Set(['http:', 'https:'])
const TEMP_DIR_PREFIX = 'get-video-duration-'

const getFFprobeWrappedExecution = (
  input: string | Readable,
  ffprobePath?: string,
): execa.ExecaChildProcess => {
  const params = ['-v', 'error', '-show_format', '-show_streams']

  const overridenPath = ffprobePath || ffprobe.path

  if (typeof input === 'string') {
    return execa(overridenPath, [...params, input])
  }

  if (isStream(input)) {
    return execa(overridenPath, [...params, '-i', 'pipe:0'], {
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
 * @param input Stream or URL or path to file to be used as
 * input for `ffprobe`.
 * @param [ffprobePath] Optional. Path to `ffprobe` binary. Do not provide any
 * value for this parameter unless you need to override the path to `ffprobe`.
 * Defaults to the path provided by `@ffprobe-installer/ffprobe`, which works in
 * most environments.
 *
 * @return Promise that will be resolved with given video duration in
 * seconds.
 */
const getVideoDurationInSeconds = async (
  input: string | Readable,
  ffprobePath?: string,
): Promise<number> => {
  if (typeof input === 'string' && isRemoteUrl(input)) {
    return withDownloadedSource(input, async (localPath) =>
      readDuration(localPath, ffprobePath),
    )
  }

  return readDuration(input, ffprobePath)
}

export default getVideoDurationInSeconds
export { getVideoDurationInSeconds }

const readDuration = async (
  input: string | Readable,
  ffprobePath?: string,
): Promise<number> => {
  const { stdout } = await getFFprobeWrappedExecution(input, ffprobePath)
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/)
  if (matched && matched[1]) return parseFloat(matched[1])
  throw new Error('No duration found!')
}

const isRemoteUrl = (input: string): boolean => {
  try {
    const { protocol } = new URL(input)
    return HTTP_PROTOCOLS.has(protocol)
  } catch {
    return false
  }
}

const withDownloadedSource = async (
  url: string,
  useLocalPath: (path: string) => Promise<number>,
): Promise<number> => {
  const { path, cleanup } = await downloadUrlToTempFile(url)
  try {
    return await useLocalPath(path)
  } finally {
    await cleanup()
  }
}

const downloadUrlToTempFile = async (
  url: string,
): Promise<{ path: string; cleanup: () => Promise<void> }> => {
  const tempDirectory = await fsPromises.mkdtemp(
    join(tmpdir(), TEMP_DIR_PREFIX),
  )
  const tempFilePath = join(tempDirectory, 'source')

  await fetchToFile(url, tempFilePath)

  return {
    path: tempFilePath,
    cleanup: async () => {
      await fsPromises.unlink(tempFilePath).catch(() => undefined)
      await fsPromises.rmdir(tempDirectory).catch(() => undefined)
    },
  }
}

const fetchToFile = async (url: string, destination: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const getter = url.startsWith('https') ? https : http
    getter
      .get(url, (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume()
          fetchToFile(response.headers.location, destination)
            .then(resolve)
            .catch(reject)
          return
        }

        if (!response.statusCode || response.statusCode >= 400) {
          reject(
            new Error(
              `Unexpected status code ${
                response.statusCode ?? 'unknown'
              } while requesting ${url}`,
            ),
          )
          response.resume()
          return
        }

        const fileStream = createWriteStream(destination)
        pipeline(response, fileStream).then(resolve).catch(reject)
      })
      .on('error', reject)
  })
}
