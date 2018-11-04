import 'mocha'

import * as chaiAsPromised from 'chai-as-promised'
import { expect, use as chaiUse } from 'chai'
chaiUse(chaiAsPromised)

import * as tmp from 'tmp'
import * as http from 'http'
import * as fs from 'fs'
import { resolve as resolvePath } from 'path'

const testVideoURL = 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4'
const testTextURL = 'https://github.com/caffco/get-video-duration/blob/master/LICENSE'
const expectedVideoDuration = 60
const expectedVideoDurationThreshold = 1

import getDuration from '../src/index'

describe('get-video-duration', function () {
  context('When using a readable stream', function () {
    it('Should return proper duration', async function () {
      const temporalFilePath = await downloadFileToTemporalFile(testVideoURL)
      const inputFileReadStream = fs.createReadStream(temporalFilePath)
      const duration = await getDuration(inputFileReadStream)
      expect(duration)
        .to.be.a('number')
        .that.is.closeTo(expectedVideoDuration, expectedVideoDurationThreshold)
    })

    it('Should throw an error if not a video stream', async function () {
      const inputFileReadStream = fs.createReadStream(resolvePath(__dirname, __filename))
      const durationPromise = getDuration(inputFileReadStream)
      await expect(durationPromise).to.be.eventually.rejected
    })
  })

  context('When using a file path', function () {
    it('Should return proper duration', async function () {
      const temporalFilePath = await downloadFileToTemporalFile(testVideoURL)
      const duration = await getDuration(temporalFilePath)
      expect(duration)
        .to.be.a('number')
        .that.is.closeTo(expectedVideoDuration, expectedVideoDurationThreshold)
    })

    it('Should throw an error if not a video file', async function () {
      const durationPromise = getDuration(resolvePath(__dirname, __filename))
      await expect(durationPromise).to.be.eventually.rejected
    })
  })

  context('When using a URL', function () {
    it('Should return proper duration', async function () {
      const duration = await getDuration(testVideoURL)
      expect(duration)
        .to.be.a('number')
        .that.is.closeTo(expectedVideoDuration, expectedVideoDurationThreshold)
    })

    it('Should throw an error if not a video URL', async function () {
      const durationPromise = getDuration(testTextURL)
      await expect(durationPromise).to.be.eventually.rejected
    })
  })

  context('When passing a wrong-type parameter', function () {
    it('Should throw an error', async function () {
      const durationPromise = getDuration(0 as any as string) // To trick TypeScript compiler
      await expect(durationPromise).to.be.eventually.rejected
    })
  })
})

async function downloadFileToTemporalFile (urlToDownload: string): Promise<string> {
  const temporalFilePath = await getNewTemporalFilePath()
  await downloadURLToPath(urlToDownload, temporalFilePath)
  return temporalFilePath
}

function getNewTemporalFilePath (): Promise<string> {
  return new Promise(function (resolve, reject) {
    tmp.file(function (err, path) {
      if (err) return reject(err)
      return resolve(path)
    })
  })
}

function downloadURLToPath (urlToDownload: string, pathToBeWritten: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(urlToDownload, (res) => {
      res.pipe(fs.createWriteStream(pathToBeWritten))
      res.on('end', () => { resolve(pathToBeWritten) })
      res.on('error', (err) => { reject(err) })
    })
  })
}
