<p>
  <h1 align="center">azdata-test</h1>
</p>

This module helps you test Azure Data Studio extensions.

This is a fork of the [vscode-test](https://github.com/microsoft/vscode-test) package. The download, install and run functionality provided by that package has not yet been updated to work with Azure Data Studio - only the stubs and mocks are available for use.

Supported:

- Node >= 8.x
- Windows >= Windows Server 2012+ / Win10+ (anything with Powershell >= 5.0)
- macOS
- Linux

## Stubs and Mocks

This package provides a set of basic stubs and mocks to help test various parts of the Azure Data Studio extensibility layer which are difficult or repetitive for extensions to implement themselves.

These are located in the `lib/mocks` and `lib/stubs` folders.
## Usage

See [./sample](./sample) for a runnable sample, with [Azure DevOps Pipelines](https://github.com/microsoft/azdata-test/blob/master/sample/azure-pipelines.yml) and [Travis CI](https://github.com/microsoft/azdata-test/blob/master/.travis.yml) configuration.

```ts
async function go() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../')
		const extensionTestsPath = path.resolve(__dirname, './suite')

		/**
		 * Basic usage
		 */
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath
		})

		const extensionTestsPath2 = path.resolve(__dirname, './suite2')
		const testWorkspace = path.resolve(__dirname, '../../../test-fixtures/fixture1')

		/**
		 * Running another test suite on a specific workspace
		 */
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: extensionTestsPath2,
			launchArgs: [testWorkspace]
		})

		/**
		 * Use 1.36.1 release for testing
		 */
		await runTests({
			version: '1.36.1',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
		})

		/**
		 * Use Insiders release for testing
		 */
		await runTests({
			version: 'insiders',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
		})

		/**
		 * Noop, since 1.36.1 already downloaded to .ads-test/ads-1.36.1
		 */
		await downloadAndUnzipAzureDataStudio('1.36.1')

		/**
		 * Manually download Azure Data Studio 1.35.0 release for testing.
		 */
		const azureDataStudioExecutablePath = await downloadAndUnzipAzureDataStudio('1.35.0')
		await runTests({
			azureDataStudioExecutablePath,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [testWorkspace]
		})

		/**
		 * Install Python extension
		 */
		const cliPath = resolveCliPathFromAzureDataStudioExecutablePath(azureDataStudioExecutablePath)
		cp.spawnSync(cliPath, ['--install-extension', 'ms-python.python'], {
			encoding: 'utf-8',
			stdio: 'inherit'
		})

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
		})

	} catch (err) {
		console.error('Failed to run tests')
		process.exit(1)
	}
}

go()
```

## Development

- `yarn install`
- Make necessary changes in [`lib`](./lib)
- `yarn compile` (or `yarn watch`)
- In [`sample`](./sample), run `yarn install`, `yarn compile` and `yarn test` to make sure integration test can run successfully

## License

[MIT](LICENSE)

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
