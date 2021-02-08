import * as path from 'path';
import * as cp from 'child_process';

import { runTests, downloadAndUnzipAzureDataStudio, resolveCliPathFromAzureDataStudioExecutablePath } from '../../lib/index';

async function go() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
		const extensionTestsPath = path.resolve(__dirname, './suite');

		/**
		 * Basic usage
		 */
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath
		});

		const extensionTestsPath2 = path.resolve(__dirname, './suite2');
		const testWorkspace = path.resolve(__dirname, '../../../test-fixtures/fixture1');

		/**
		 * Running another test suite on a specific workspace
		 */
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: extensionTestsPath2,
			launchArgs: [testWorkspace]
		});

		/**
		 * Use 1.24.0 release for testing
		 */
		await runTests({
			version: '1.24.0',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
		});

		/**
		 * Use Insiders release for testing
		 */
		await runTests({
			version: 'insiders',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
		});

		/**
		 * Noop, since 1.24.0 already downloaded to .ads-test/ads-1.24.0
		 */
		await downloadAndUnzipAzureDataStudio('1.24.0');

		/**
		 * Manually download Azure Data Studio 1.25.0 release for testing.
		 */
		const azureDataStudioExecutablePath = await downloadAndUnzipAzureDataStudio('1.25.0');
		await runTests({
			azureDataStudioExecutablePath,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
		});

		/**
		 * Install Python extension
		 */
		const cliPath = resolveCliPathFromAzureDataStudioExecutablePath(azureDataStudioExecutablePath);
		cp.spawnSync(cliPath, ['--install-extension', 'ms-python.python'], {
			encoding: 'utf-8',
			stdio: 'inherit'
		});

		/**
		 * - Add additional launch flags for Azure Data Studio
		 * - Pass custom environment variables to test runner
		 */
		await runTests({
			azureDataStudioExecutablePath,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				testWorkspace,
				// This disables all extensions except the one being testing
				'--disable-extensions'
			],
			// Custom environment variables for extension test script
			extensionTestsEnv: { foo: 'bar' }
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

go();
