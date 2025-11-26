import 'jest'

import * as execa from 'execa'

import getDuration from '../src'

jest.mock('execa', () =>
  jest.fn().mockResolvedValue({
    stdout: 'duration="42.0"',
  } as never),
)

const expectedVideoDurationThreshold = 0

describe('get-video-duration', () => {
  describe('when using a file path', () => {
    it('Should use overriden ffprobe when provided', async () => {
      const durationPromise = getDuration(
        'fake file',
        'the overriden path to ffprobe',
      )

      expect(execa).toHaveBeenCalledWith(
        'the overriden path to ffprobe',
        expect.anything(),
      )

      await expect(durationPromise).resolves.toBeCloseTo(
        42.0,
        expectedVideoDurationThreshold,
      )
    })
  })
})
