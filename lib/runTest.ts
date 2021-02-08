/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import { downloadAndUnzipAzureDataStudio, DownloadVersion, DownloadPlatform } from './download';

export interface TestOptions {
	/**
	 * The Azure Data Studio executable path used for testing.
	 *
	 * If not passed, will use `options.version` to download a copy of Azure Data Studio for testing.
	 * If `version` is not specified either, will download and use latest stable release.
	 */
	azureDataStudioExecutablePath?: string;

	/**
	 * The Azure Data Studio version to download. Valid versions are:
	 * - `'stable'`
	 * - `'insiders'`
	 * - `'1.32.0'`, `'1.31.1'`, etc
	 *
	 * Defaults to `stable`, which is latest stable version.
	 *
	 * *If a local copy exists at `.ads-test/ads-<VERSION>`, skip download.*
	 */
	version?: DownloadVersion;

	/**
	 * The Azure Data Studio platform to download. If not specified, defaults to:
	 * - Windows: `win32-x64-archive`
	 * - macOS: `darwin`
	 * - Linux: `linux-x64`
	 *
	 * Possible values are: `win32-archive`, `win32-x64-archive`, `darwin` and `linux-x64`.
	 */
	platform?: DownloadPlatform;

	/**
	 * Absolute path to the extension root. Passed to `--extensionDevelopmentPath`.
	 * Must include a `package.json` Extension Manifest.
	 */
	extensionDevelopmentPath: string;

	/**
	 * Absolute path to the extension tests runner. Passed to `--extensionTestsPath`.
	 * Can be either a file path or a directory path that contains an `index.js`.
	 * Must export a `run` function of the following signature:
	 *
	 * ```ts
	 * function run(): Promise<void>;
	 * ```
	 *
	 * When running the extension test, the Extension Development Host will call this function
	 * that runs the test suite. This function should throws an error if any test fails.
	 *
	 */
	extensionTestsPath: string;

	/**
	 * Environment variables being passed to the extension test script.
	 */
	extensionTestsEnv?: {
		[key: string]: string | undefined;
	};

	/**
	 * A list of launch arguments passed to Azure Data Studio executable, in addition to `--extensionDevelopmentPath`
	 * and `--extensionTestsPath` which are provided by `extensionDevelopmentPath` and `extensionTestsPath`
	 * options.
	 *
	 * If the first argument is a path to a file/folder/workspace, the launched Azure Data Studio instance
	 * will open it.
	 *
	 * See `code --help` for possible arguments.
	 */
	launchArgs?: string[];
}

/**
 * Run Azure Data Studio extension test
 *
 * @returns The exit code of the command to launch Azure Data Studio extension test
 */
export async function runTests(options: TestOptions): Promise<number> {
	if (!options.azureDataStudioExecutablePath) {
		options.azureDataStudioExecutablePath = await downloadAndUnzipAzureDataStudio(options.version, options.platform);
	}

	let args = [
		// https://github.com/microsoft/vscode/issues/84238
		'--no-sandbox',
		'--extensionDevelopmentPath=' + options.extensionDevelopmentPath,
		'--extensionTestsPath=' + options.extensionTestsPath
	];

	if (options.launchArgs) {
		args = options.launchArgs.concat(args);
	}

	return innerRunTests(options.azureDataStudioExecutablePath, args, options.extensionTestsEnv);
}

async function innerRunTests(
	executable: string,
	args: string[],
	testRunnerEnv?: {
		[key: string]: string | undefined;
	}
): Promise<number> {
	return new Promise((resolve, reject) => {
		const fullEnv = Object.assign({}, process.env, testRunnerEnv);
		const cmd = cp.spawn(executable, args, { env: fullEnv });

		cmd.stdout.on('data', function (data) {
			console.log(data.toString());
		});

		cmd.stderr.on('data', function (data) {
			console.error(data.toString());
		});

		cmd.on('error', function (data) {
			console.log('Test error: ' + data.toString());
		});

		let finished = false;
		function onProcessClosed(code: number | null, signal: NodeJS.Signals | null): void {
			if (finished) {
				return;
			}
			finished = true;
			console.log(`Exit code:   ${code}`);

			if (code === null) {
				reject(signal);
			} else if (code !== 0) {
				reject('Failed');
			}

			console.log('Done\n');
			resolve(code);
		}

		cmd.on('close', onProcessClosed);

		cmd.on('exit', onProcessClosed);
	});
}
