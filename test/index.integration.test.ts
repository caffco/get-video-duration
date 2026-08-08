import { createReadStream } from "node:fs";
import { copyFile, readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve as resolvePath } from "node:path";
import { file as tmpFile } from "tmp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import getDuration, { getVideoDurationInSeconds } from "../src";

// A tiny video fixture is bundled with the tests so the suite does not depend
// on any external host staying online (previous external URLs kept going away).
const testVideoPath = resolvePath(__dirname, "fixtures", "video.mp4");
const expectedVideoDuration = 5;
const expectedVideoDurationThreshold = 1;

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

const copyFixtureToTemporalFile = async (
	options?: TemporalFileOptions,
): Promise<string> => {
	const temporalFilePath = await getNewTemporalFilePath(options);
	await copyFile(testVideoPath, temporalFilePath);
	return temporalFilePath;
};

describe("get-video-duration", () => {
	it("Should export function under named export, too", () => {
		expect(getDuration).toBe(getVideoDurationInSeconds);
	});

	describe.concurrent("When using a readable stream", () => {
		it.concurrent("Should return proper duration", async () => {
			const inputFileReadStream = createReadStream(testVideoPath);
			const duration = await getDuration(inputFileReadStream);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		});

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
			const duration = await getDuration(testVideoPath);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		});

		it.concurrent("Should work with spaces in paths", async () => {
			const temporalFilePath = await copyFixtureToTemporalFile({
				includingSpaces: true,
			});
			const duration = await getDuration(temporalFilePath);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		});

		it("Should throw an error if not a video file", async () => {
			const durationPromise = getDuration(resolvePath(__dirname, __filename));
			await expect(durationPromise).rejects.toThrow();
		});
	});

	describe("When using a URL", () => {
		let server: Server;
		let baseURL: string;

		beforeAll(async () => {
			const fixtureContents = await readFile(testVideoPath);

			server = createServer((request, response) => {
				if (request.url === "/not-a-video") {
					response.writeHead(200, { "Content-Type": "text/plain" });
					response.end("This is not a video file");
					return;
				}

				response.writeHead(200, { "Content-Type": "video/mp4" });
				response.end(fixtureContents);
			});

			await new Promise<void>((resolve) => {
				server.listen(0, "127.0.0.1", resolve);
			});

			const { port } = server.address() as AddressInfo;
			baseURL = `http://127.0.0.1:${port}`;
		});

		afterAll(async () => {
			await new Promise<void>((resolve, reject) => {
				server.close((err) => (err ? reject(err) : resolve()));
			});
		});

		it("Should return proper duration", async () => {
			const duration = await getDuration(`${baseURL}/video.mp4`);
			expect(duration).toBeCloseTo(
				expectedVideoDuration,
				expectedVideoDurationThreshold,
			);
		});

		it("Should throw an error if not a video URL", async () => {
			const durationPromise = getDuration(`${baseURL}/not-a-video`);
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
