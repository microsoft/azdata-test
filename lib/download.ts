/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as request from './request';
import * as del from './del';
import {
	getAzureDataStudioDownloadUrl as getAzureDataStudioDownloadUrl,
	urlToOptions,
	downloadDirToExecutablePath,
	insidersDownloadDirToExecutablePath,
	insidersDownloadDirMetadata,
	getLatestInsidersMetadata,
	systemDefaultPlatform
} from './util';

const extensionRoot = process.cwd();
const adsTestDir = path.resolve(extensionRoot, '.ads-test');

const azureDataStudioStableReleasesAPI = `https://azuredatastudio-update.azurewebsites.net/api/releases/stable`;

async function fetchLatestStableVersion(): Promise<string> {
	const versions = await request.getJSON(azureDataStudioStableReleasesAPI);
	if (!versions || !Array.isArray(versions) || !versions[0]) {
		throw Error('Failed to get latest Azure Data Studio version');
	}

	return versions[0];
}

async function isValidVersion(version: string) {
	const validVersions: string[] = await request.getJSON(azureDataStudioStableReleasesAPI);
	return version === 'insiders' || validVersions.indexOf(version) !== -1;
}

/**
 * Adapted from https://github.com/microsoft/TypeScript/issues/29729
 * Since `string | 'foo'` doesn't offer auto completion
 */
type StringLiteralUnion<T extends U, U = string> = T | (U & {});
export type DownloadVersion = StringLiteralUnion<'insiders' | 'stable'>;
export type DownloadPlatform = StringLiteralUnion<'darwin' | 'win32-x64-archive' | 'linux-x64'>;

/**
 * Download a copy of Azure Data Studio archive to `.ads-test`.
 *
 * @param version The version of Azure Data Studio to download such as '1.32.0'. You can also use
 * `'stable'` for downloading latest stable release.
 * `'insiders'` for downloading latest Insiders.
 */
async function downloadAzureDataStudioArchive(version: DownloadVersion, platform?: DownloadPlatform): Promise<string> {
	if (!fs.existsSync(adsTestDir)) {
		fs.mkdirSync(adsTestDir);
	}

	return new Promise((resolve, reject) => {
		const downloadUrl = getAzureDataStudioDownloadUrl(version, platform);
		console.log(`Downloading Azure Data Studio ${version} from ${downloadUrl}`);
		const requestOptions = urlToOptions(downloadUrl);

		https.get(requestOptions, res => {
			if (res.statusCode !== 302) {
				reject('Failed to get Azure Data Studio archive location');
			}
			const archiveUrl = res.headers.location;
			if (!archiveUrl) {
				reject('Failed to get Azure Data Studio archive location');
				return;
			}

			const archiveRequestOptions = urlToOptions(archiveUrl);
			if (archiveUrl.endsWith('.zip')) {
				const archivePath = path.resolve(adsTestDir, `ads-${version}.zip`);
				const outStream = fs.createWriteStream(archivePath);
				outStream.on('close', () => {
					resolve(archivePath);
				});

				https
					.get(archiveRequestOptions, res => {
						res.pipe(outStream);
					})
					.on('error', e => reject(e));
			} else {
				const zipPath = path.resolve(adsTestDir, `ads-${version}.tgz`);
				const outStream = fs.createWriteStream(zipPath);
				outStream.on('close', () => {
					resolve(zipPath);
				});

				https
					.get(archiveRequestOptions, res => {
						res.pipe(outStream);
					})
					.on('error', e => reject(e));
			}
		});
	});
}

/**
 * Unzip a .zip or .tar.gz Azure Data Studio archive
 */
function unzipAzureDataStudio(azureDataStudioArchivePath: string) {
	// The 'ads-1.32' out of '.../ads-1.32.zip'
	const dirName = path.parse(azureDataStudioArchivePath).name;
	const extractDir = path.resolve(adsTestDir, dirName);

	let res: cp.SpawnSyncReturns<string>;
	if (azureDataStudioArchivePath.endsWith('.zip')) {
		if (process.platform === 'win32') {
			res = cp.spawnSync('powershell.exe', [
				'-NoProfile',
				'-ExecutionPolicy',
				'Bypass',
				'-NonInteractive',
				'-NoLogo',
				'-Command',
				`Microsoft.PowerShell.Archive\\Expand-Archive -Path "${azureDataStudioArchivePath}" -DestinationPath "${extractDir}"`
			]);
		} else {
			res = cp.spawnSync('unzip', [azureDataStudioArchivePath, '-d', `${extractDir}`]);
		}
	} else {
		// tar does not create extractDir by default
		if (!fs.existsSync(extractDir)) {
			fs.mkdirSync(extractDir);
		}
		res = cp.spawnSync('tar', ['-xzf', azureDataStudioArchivePath, '-C', extractDir]);
	}

	if (res && !(res.status === 0 && res.signal === null)) {
		throw Error(`Failed to unzip downloaded Azure Data Studio at ${azureDataStudioArchivePath}`);
	}
}

/**
 * Download and unzip a copy of Azure Data Studio in `.ads-test`. The paths are:
 * - `.ads-test/ads-<VERSION>`. For example, `./ads-test/ads-1.32.0`
 * - `.ads-test/ads-insiders`.
 *
 * *If a local copy exists at `.ads-test/ads-<VERSION>`, skip download.*
 *
 * @param version The version of Azure Data Studio to download such as `1.32.0`. You can also use
 * `'stable'` for downloading latest stable release.
 * `'insiders'` for downloading latest Insiders.
 * When unspecified, download latest stable version.
 *
 * @returns Promise of `azureDataStudioExecutablePath`.
 */
export async function downloadAndUnzipAzureDataStudio(version?: DownloadVersion, platform?: DownloadPlatform): Promise<string> {
	if (version) {
		if (version === 'stable') {
            console.log('fetch latest stable');
			version = await fetchLatestStableVersion();
		} else {
			/**
			 * Only validate version against server when no local download that matches version exists
			 */
			if (!fs.existsSync(path.resolve(adsTestDir, `ads-${version}`))) {
				if (!(await isValidVersion(version))) {
					throw Error(`Invalid version ${version}`);
				}
			}
		}
	} else {
		version = await fetchLatestStableVersion();
    }
    console.log(`version ${version}`);

	const downloadedPath = path.resolve(adsTestDir, `ads-${version}`);
	if (fs.existsSync(downloadedPath)) {
		if (version === 'insiders') {
			const { version: currentHash, date: currentDate } = insidersDownloadDirMetadata(downloadedPath);

			const { version: latestHash, timestamp: latestTimestamp } = await getLatestInsidersMetadata(
				systemDefaultPlatform
			);
			if (currentHash === latestHash) {
				console.log(`Found .ads-test/ads-insiders matching latest Insiders release. Skipping download.`);
				return Promise.resolve(insidersDownloadDirToExecutablePath(downloadedPath));
			} else {
				try {
					console.log(`Remove outdated Insiders at ${downloadedPath} and re-downloading.`);
					console.log(`Old: ${currentHash} | ${currentDate}`);
					console.log(`New: ${latestHash} | ${new Date(parseInt(latestTimestamp, 10)).toISOString()}`);
					await del.rmdir(downloadedPath);
					console.log(`Removed ${downloadedPath}`);
				} catch (err) {
					console.error(err);
					throw Error(`Failed to remove outdated Insiders at ${downloadedPath}.`);
				}
			}
		} else {
			console.log(`Found .ads-test/ads-${version}. Skipping download.`);

			return Promise.resolve(downloadDirToExecutablePath(downloadedPath));
		}
	}

	try {
		const azureDataStudioArchivePath = await downloadAzureDataStudioArchive(version, platform);
		if (fs.existsSync(azureDataStudioArchivePath)) {
			unzipAzureDataStudio(azureDataStudioArchivePath);
			console.log(`Downloaded Azure Data Studio ${version} into .ads-test/ads-${version}`);
			// Remove archive
			fs.unlinkSync(azureDataStudioArchivePath);
		}
	} catch (err) {
		console.error(err);
		throw Error(`Failed to download and unzip Azure Data Studio ${version}`);
	}

	if (version === 'insiders') {
		return Promise.resolve(insidersDownloadDirToExecutablePath(path.resolve(adsTestDir, `ads-${version}`)));
	} else {
		return downloadDirToExecutablePath(path.resolve(adsTestDir, `ads-${version}`));
	}
}
