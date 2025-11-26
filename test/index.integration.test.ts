import { createReadStream, createWriteStream } from "node:fs";
import { get as getHTTP } from "node:https";
import { resolve as resolvePath } from "node:path";
import { file as tmpFile } from "tmp";
import { describe, expect, it } from "vitest";

const testVideoURL =
	"https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const testTextURL =
	"https://github.com/caffco/get-video-duration/blob/master/LICENSE";
const expectedVideoDuration = 596;
const expectedVideoDurationThreshold = 0;

import getDuration, { getVideoDurationInSeconds } from "../src";

const getNewTemporalFilePath = (
	options?: TemporalFileOptions,
): Promise<string> => {
	const postfix = options?.includingSpaces ? " with spaces" : "";

	return new Promise((resolve, reject) => {
		tmpFile({ postfix }, (err, path) => {
			if (err) return reject(err);
			return resolve(path);
		});
	});
};

const downloadURLToPath = (
	urlToDownload: string,
	pathToBeWritten: string,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		getHTTP(urlToDownload, (res) => {
			res.pipe(createWriteStream(pathToBeWritten));
			res.on("end", () => {
				resolve(pathToBeWritten);
			});
			res.on("error", (err) => {
				reject(err);
			});
		});
	});
};

const downloadFileToTemporalFile = async (
	urlToDownload: string,
	options?: TemporalFileOptions,
): Promise<string> => {
	const temporalFilePath = await getNewTemporalFilePath(options);
	await downloadURLToPath(urlToDownload, temporalFilePath);
	return temporalFilePath;
};

describe("get-video-duration", () => {
	it("Should export function under named export, too", () => {
		expect(getDuration).toBe(getVideoDurationInSeconds);
	});

	describe.concurrent("When using a readable stream", () => {
		it.concurrent("Should return proper duration", async () => {
			const temporalFilePath = await downloadFileToTemporalFile(testVideoURL);
			const inputFileReadStream = createReadStream(temporalFilePath);
			const duration = await getDuration(inputFileReadStream);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		}, 60_000);

		it("Should throw an error if not a video stream", async () => {
			const inputFileReadStream = createReadStream(
				resolvePath(__dirname, __filename),
			);
			const durationPromise = getDuration(inputFileReadStream);
			await expect(durationPromise).rejects.toThrow();
		});
	});

	describe.concurrent("When using a file path", () => {
		it.concurrent("Should return proper duration", async () => {
			const temporalFilePath = await downloadFileToTemporalFile(testVideoURL);
			const duration = await getDuration(temporalFilePath);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		}, 60_000);

		it.concurrent("Should work with spaces in paths", async () => {
			const temporalFilePath = await downloadFileToTemporalFile(testVideoURL, {
				includingSpaces: true,
			});
			const duration = await getDuration(temporalFilePath);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		}, 60_000);

		it("Should throw an error if not a video file", async () => {
			const durationPromise = getDuration(resolvePath(__dirname, __filename));
			await expect(durationPromise).rejects.toThrow();
		});
	});

	describe.concurrent("When using a URL", () => {
		it.concurrent("Should return proper duration", async () => {
			const duration = await getDuration(testVideoURL);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		}, 60_000);

		it("Should throw an error if not a video URL", async () => {
			const durationPromise = getDuration(testTextURL);
			await expect(durationPromise).rejects.toThrow();
		});
	});

	describe("When passing a wrong-type parameter", () => {
		it("Should throw an error", async () => {
			const durationPromise = getDuration(0 as unknown as string);
			await expect(durationPromise).rejects.toThrow();
		});
	});
});

interface TemporalFileOptions {
	includingSpaces: boolean;
}
