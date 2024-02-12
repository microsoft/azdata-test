/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';

/**
 * Simple stub secret storage
 */
export class StubSecretStorage implements vscode.SecretStorage {
	private _storageMap: Map<string, string> = new Map<string, string>();

	public onDidChange: vscode.Event<vscode.SecretStorageChangeEvent> = this._onDidChangeEmitter?.event;

	constructor(private readonly _onDidChangeEmitter?: vscode.EventEmitter<vscode.SecretStorageChangeEvent>) { }

	public async get(key: string): Promise<string | undefined> {
		return this._storageMap.get(key);
	}

	public async store(key: string, value: string): Promise<void> {
		this._storageMap.set(key, value);
		this._onDidChangeEmitter?.fire({ key });
	}

	public async delete(key: string): Promise<void> {
		this._storageMap.delete(key);
		this._onDidChangeEmitter?.fire({ key });
	}
}
