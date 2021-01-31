import 'jest'

import * as tmp from 'tmp'
import * as http from 'http'
import * as fs from 'fs'
import { resolve as resolvePath } from 'path'

const testVideoURL = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
const testTextURL =
  'https://github.com/caffco/get-video-duration/blob/master/LICENSE'
const expectedVideoDuration = 60
const expectedVideoDurationThreshold = 0

import getDuration, { getVideoDurationInSeconds } from '../src/index'

function getNewTemporalFilePath(
  options?: TemporalFileOptions
): Promise<string> {
  const includingSpaces = options && options.includingSpaces
  const postfix = includingSpaces ? ' with spaces' : ''

  return new Promise(function (resolve, reject) {
    tmp.file({ postfix }, function (err, path) {
      if (err) return reject(err)
      return resolve(path)
    })
  })
}

function downloadURLToPath(
  urlToDownload: string,
  pathToBeWritten: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(urlToDownload, (res) => {
      res.pipe(fs.createWriteStream(pathToBeWritten))
      res.on('end', () => {
        resolve(pathToBeWritten)
      })
      res.on('error', (err) => {
        reject(err)
      })
    })
  })
}

async function downloadFileToTemporalFile(
  urlToDownload: string,
  options?: TemporalFileOptions
): Promise<string> {
  const temporalFilePath = await getNewTemporalFilePath(options)
  await downloadURLToPath(urlToDownload, temporalFilePath)
  return temporalFilePath
}

describe('get-video-duration', function () {
  it('Should export function under named export, too', function () {
    expect(getDuration).toBe(getVideoDurationInSeconds)
  })

  describe('When using a readable stream', function () {
    it('Should return proper duration', async function () {
      const temporalFilePath = await downloadFileToTemporalFile(testVideoURL)
      const inputFileReadStream = fs.createReadStream(temporalFilePath)
      const duration = await getDuration(inputFileReadStream)
      expect(duration).toBeCloseTo(
        expectedVideoDuration,
        expectedVideoDurationThreshold
      )
    })

    it('Should throw an error if not a video stream', async function () {
      const inputFileReadStream = fs.createReadStream(
        resolvePath(__dirname, __filename)
      )
      const durationPromise = getDuration(inputFileReadStream)
      await expect(durationPromise).rejects.toThrowError()
    })
  })

  describe('When using a file path', function () {
    it('Should return proper duration', async function () {
      const temporalFilePath = await downloadFileToTemporalFile(testVideoURL)
      const duration = await getDuration(temporalFilePath)
      expect(duration).toBeCloseTo(
        expectedVideoDuration,
        expectedVideoDurationThreshold
      )
    })

    it('Should work with spaces in paths', async function () {
      const temporalFilePath = await downloadFileToTemporalFile(testVideoURL, {
        includingSpaces: true,
      })
      const duration = await getDuration(temporalFilePath)
      expect(duration).toBeCloseTo(
        expectedVideoDuration,
        expectedVideoDurationThreshold
      )
    })

    it('Should throw an error if not a video file', async function () {
      const durationPromise = getDuration(resolvePath(__dirname, __filename))
      await expect(durationPromise).rejects.toThrowError()
    })
  })

  describe('When using a URL', function () {
    it('Should return proper duration', async function () {
      const duration = await getDuration(testVideoURL)
      expect(duration).toBeCloseTo(
        expectedVideoDuration,
        expectedVideoDurationThreshold
      )
    })

    it('Should throw an error if not a video URL', async function () {
      const durationPromise = getDuration(testTextURL)
      await expect(durationPromise).rejects.toThrowError()
    })
  })

  describe('When passing a wrong-type parameter', function () {
    it('Should throw an error', async function () {
      const durationPromise = getDuration((0 as unknown) as string) // To trick TypeScript compiler
      await expect(durationPromise).rejects.toThrowError()
    })
  })
})

interface TemporalFileOptions {
  includingSpaces: boolean
}
