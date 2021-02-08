/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { parse as parseUrl } from 'url';
import * as https from 'https';
import * as request from './request';
import { DownloadPlatform } from './download';

export let systemDefaultPlatform;

switch (process.platform) {
	case 'darwin':
		systemDefaultPlatform = 'darwin';
		break;
	case 'win32':
		systemDefaultPlatform = 'win32-x64-archive';
		break;
	default:
		systemDefaultPlatform = 'linux-x64';
}

export function getAzureDataStudioDownloadUrl(version: string, platform?: DownloadPlatform) {
	const downloadPlatform = platform || systemDefaultPlatform;
	if (version === 'insiders') {
        return `https://azuredatastudio-update.azurewebsites.net/latest/${downloadPlatform}/insider`;
    }
    return `https://azuredatastudio-update.azurewebsites.net/${version}/${downloadPlatform}/stable`;
}

const HttpsProxyAgent = require('https-proxy-agent');
const HttpProxyAgent = require('http-proxy-agent');

let PROXY_AGENT = undefined;
let HTTPS_PROXY_AGENT = undefined;

if (process.env.npm_config_proxy) {
	PROXY_AGENT = new HttpProxyAgent(process.env.npm_config_proxy);
	HTTPS_PROXY_AGENT = new HttpsProxyAgent(process.env.npm_config_proxy);
}
if (process.env.npm_config_https_proxy) {
	HTTPS_PROXY_AGENT = new HttpsProxyAgent(process.env.npm_config_https_proxy);
}

export function urlToOptions(url: string): https.RequestOptions {
	const options: https.RequestOptions = parseUrl(url);
	if (PROXY_AGENT && options.protocol.startsWith('http:')) {
		options.agent = PROXY_AGENT;
	}

	if (HTTPS_PROXY_AGENT && options.protocol.startsWith('https:')) {
		options.agent = HTTPS_PROXY_AGENT;
	}
	return options;
}

export function downloadDirToExecutablePath(dir: string) {
	if (process.platform === 'win32') {
		return path.resolve(dir, 'azuredatastudio.exe');
	} else if (process.platform === 'darwin') {
		return path.resolve(dir, 'Azure Data Studio.app/Contents/MacOS/Electron');
	} else {
		return path.resolve(dir, 'azuredatastudio-linux-x64/azuredatastudio');
	}
}

export function insidersDownloadDirToExecutablePath(dir: string) {
	if (process.platform === 'win32') {
		return path.resolve(dir, 'azuredatastudio-insiders.exe');
	} else if (process.platform === 'darwin') {
		return path.resolve(dir, 'Azure Data Studio - Insiders.app/Contents/MacOS/Electron');
	} else {
		return path.resolve(dir, 'azuredatastudio-linux-x64/azuredatastudio');
	}
}

export function insidersDownloadDirMetadata(dir: string) {
	let productJsonPath;
	if (process.platform === 'win32') {
		productJsonPath = path.resolve(dir, 'resources/app/product.json');
	} else if (process.platform === 'darwin') {
		productJsonPath = path.resolve(dir, 'Azure Data Studio - Insiders.app/Contents/Resources/app/product.json');
	} else {
		productJsonPath = path.resolve(dir, 'azuredatastudio-linux-x64/resources/app/product.json');
	}
	const productJson = require(productJsonPath);

	return {
		version: productJson.commit,
		date: productJson.date
	};
}

export async function getLatestInsidersMetadata(platform: string) {
	const remoteUrl = `https://azuredatastudio-update.azurewebsites.net/api/update/${platform}/insider/latest`;
	return await request.getJSON(remoteUrl);
}

/**
 * Resolve the Azure Data Studio cli path from executable path returned from `downloadAndUnzipAzureDataStudio`.
 * You can use this path to spawn processes for extension management. For example:
 *
 * ```ts
 * const cp = require('child_process');
 * const { downloadAndUnzipAzureDataStudio, resolveCliPathFromExecutablePath } = require('azdata-test')
 * const azureDataStudioExecutablePath = await downloadAndUnzipAzureDataStudio('1.36.0');
 * const cliPath = resolveCliPathFromExecutablePath(azureDataStudioExecutablePath);
 *
 * cp.spawnSync(cliPath, ['--install-extension', '<EXTENSION-ID-OR-PATH-TO-VSIX>'], {
 *   encoding: 'utf-8',
 *   stdio: 'inherit'
 * });
 * ```
 *
 * @param azureDataStudioExecutablePath The `azureDataStudioExecutablePath` from `downloadAndUnzipAzureDataStudio`.
 */
export function resolveCliPathFromAzureDataStudioExecutablePath(azureDataStudioExecutablePath: string) {
	if (process.platform === 'win32') {
		if (azureDataStudioExecutablePath.endsWith('azuredatastudio-insiders.exe')) {
			return path.resolve(azureDataStudioExecutablePath, '../bin/azuredatastudio-insiders.cmd');
		} else {
			return path.resolve(azureDataStudioExecutablePath, '../bin/azuredatastudio.cmd');
		}
	} else if (process.platform === 'darwin') {
		return path.resolve(azureDataStudioExecutablePath, '../../../Contents/Resources/app/bin/code');
	} else {
		if (azureDataStudioExecutablePath.endsWith('azuredatastudio-insiders')) {
			return path.resolve(azureDataStudioExecutablePath, '../bin/azuredatastudio-insiders');
		} else {
			return path.resolve(azureDataStudioExecutablePath, '../bin/azuredatastudio');
		}
	}
}
