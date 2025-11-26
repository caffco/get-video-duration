import type { Readable } from "node:stream";
import * as ffprobe from "@ffprobe-installer/ffprobe";
import { execa } from "execa";
import { isStream } from "is-stream";

const getFFprobeWrappedExecution = (
	input: string | Readable,
	ffprobePath?: string,
) => {
	const params = ["-v", "error", "-show_format", "-show_streams"];

	const overridenPath = ffprobePath || ffprobe.path;

	if (typeof input === "string") {
		return execa(overridenPath, [...params, input]);
	}

	if (isStream(input)) {
		return execa(overridenPath, [...params, "-i", "pipe:0"], {
			reject: false,
			input,
		});
	}

	throw new Error("Given input was neither a string nor a Stream");
};

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
	const { stdout } = await getFFprobeWrappedExecution(input, ffprobePath);
	const matched = stdout?.match(/duration="?(\d*\.\d*)"?/);
	if (matched?.[1]) return parseFloat(matched?.[1]);
	throw new Error("No duration found!");
};

export default getVideoDurationInSeconds;
export { getVideoDurationInSeconds };
