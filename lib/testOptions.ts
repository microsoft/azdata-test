/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';

/**
 * Get the default mocha options for ads extension unit test. The following environment variables will be examined.
 * ADS_TEST_GREP: custom test filter.
 * ADS_TEST_INVERT_GREP: whether to invert the grep results.
 * RUN_UNSTABLE_TESTS: whether to run the unstable tests. By default, only the stable tests will be executed unless this variable is set to true. If ADS_TEST_GREP is specified, this variable will be ignored.
 * ADS_TEST_TIMEOUT: test timeout.
 * ADS_TEST_RETRIES: number of retries.
 * BUILD_ARTIFACTSTAGINGDIRECTORY: target directory for the test reports.
 * @param testSuiteName The test suite name.
 */
export function getDefaultMochaOptions(testSuiteName: string): any {
	const mochaOptions: any = {
		ui: 'bdd',
		useColors: true,
		timeout: 10000
	};

	const grep = process.env.ADS_TEST_GREP
	const invert = parseInt(process.env.ADS_TEST_INVERT_GREP);
	const runUnstableTest = process.env.RUN_UNSTABLE_TESTS === 'true';
	const testTimeout = parseInt(process.env.ADS_TEST_TIMEOUT);
	const retries = parseInt(process.env.ADS_TEST_RETRIES);
	const artifactDirectory = process.env.BUILD_ARTIFACTSTAGINGDIRECTORY;
	// If the ADS_TEST_GREP is set, it will be used otherwise, RUN_UNSTABLE_TESTS will be checked to determine whether to only run the stable tests or the whole test suite.
	if (grep) {
		mochaOptions.grep = grep;
		mochaOptions.invert = invert;
	} else {
		if (!runUnstableTest) {
			mochaOptions.grep = "@UNSTABLE@";
			mochaOptions.invert = true;
		}
	}
	if (testTimeout) {
		mochaOptions.timeout = testTimeout;
	}
	if (retries) {
		mochaOptions.retries = retries;
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
	console.log("Test options:" + mochaOptions);
	return mochaOptions;
}
