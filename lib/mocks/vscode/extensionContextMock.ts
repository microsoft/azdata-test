/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';
import * as TypeMoq from 'typemoq';
import { StubSecretStorage } from '../../stubs/vscode';
import * as os from 'os';

/**
 * Creates a mock of a vscode.ExtensionContext
 * @param storageUri The base storage URI to use, defaults to the temp directory
 * @returns The mocked extension context
 */
export function createExtensionContextMock(storageUri: vscode.Uri): TypeMoq.IMock<vscode.ExtensionContext> {
	const mock = TypeMoq.Mock.ofType<vscode.ExtensionContext>();
	mock.setup(m => m.globalStorageUri).returns(() => storageUri);
	mock.setup(m => m.secrets).returns(() => new StubSecretStorage());
	return mock;
}