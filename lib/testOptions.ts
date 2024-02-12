/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import type { InterfaceContributions, MochaOptions } from 'mocha';

/**
 * Get default mocha options for ADS test, using the below environment variables to control what values various options are set to.
 * ADS_TEST_GREP: custom test filter.
 * ADS_TEST_INVERT_GREP: whether to invert the grep results.
 * RUN_UNSTABLE_TESTS: whether to run unstable tests (tests that have @UNSTABLE@ in their name). By default, only the stable tests will be executed unless this variable is set to true. If ADS_TEST_GREP is specified, this variable will be ignored.
 * ADS_TEST_TIMEOUT: test timeout.
 * ADS_TEST_RETRIES: number of retries.
 * BUILD_ARTIFACTSTAGINGDIRECTORY: target directory for the test reports.
 * @param testSuiteName The test suite name.
 * @param ui mocha ui.
 */
export function getDefaultMochaOptions(testSuiteName: string, ui: keyof InterfaceContributions = 'bdd'): MochaOptions {
	const mochaOptions: MochaOptions = {
		ui: ui,
		timeout: 10000
	};

	const grep = process.env.ADS_TEST_GREP;
	const invert = getBoolean(process.env.ADS_TEST_INVERT_GREP);
	const runUnstableTest = getBoolean(process.env.RUN_UNSTABLE_TESTS);
	const testTimeout = getNumber(process.env.ADS_TEST_TIMEOUT);
	const retries = getNumber(process.env.ADS_TEST_RETRIES);
	const artifactDirectory = process.env.BUILD_ARTIFACTSTAGINGDIRECTORY;
	// If the ADS_TEST_GREP is set, it will be used otherwise, RUN_UNSTABLE_TESTS will be checked to determine whether to only run the stable tests or the whole test suite.
	if (grep) {
		mochaOptions.grep = grep;
		mochaOptions.invert = invert;
	} else {
		if (!runUnstableTest) {
			mochaOptions.grep = '@UNSTABLE@';
			mochaOptions.invert = true;
		}
	}

	if (artifactDirectory) {
		mochaOptions.reporter = 'mocha-multi-reporters';
		mochaOptions.reporterOptions = {
			reporterEnabled: 'spec, mocha-junit-reporter',
			mochaJunitReporterReporterOptions: {
				testsuitesTitle: `${testSuiteName} ${process.platform}`,
				mochaFile: path.join(artifactDirectory, `test-results/${process.platform}-${testSuiteName.toLowerCase().replace(/[^\w]/g, '-')}-results.xml`)
			}
		};
	}

	if (testTimeout !== undefined) {
		mochaOptions.timeout = testTimeout;
	}
	mochaOptions.retries = retries;

	console.log(`Mocha Options: ${JSON.stringify(mochaOptions)}`);

	return mochaOptions;
}

function getBoolean(val: string | undefined): boolean | undefined {
	return val ? val.toLowerCase() === 'true' : undefined;
}

function getNumber(val: string | undefined): number | undefined {
	const num = parseInt(val || '');
	return isNaN(num) ? undefined : num;
}