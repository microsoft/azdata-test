/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as azdata from 'azdata';
import type * as vscode from 'vscode';

export class StubCheckbox implements azdata.CheckBoxComponent {
	private _checked = false;

	readonly id = 'stub-checkbox';
	public enabled: boolean = false;

	get checked(): boolean {
		return this._checked;
	}
	set checked(value: boolean) {
		this._checked = value;
		this._onChanged?.fire();
	}

	constructor(private readonly _onChanged?: vscode.EventEmitter<void>) { }

	onChanged: vscode.Event<any> = this._onChanged.event;

	updateProperties(properties: { [key: string]: any }): Thenable<void> { throw new Error('Not implemented'); }

	updateProperty(key: string, value: any): Thenable<void> { throw new Error('Not implemented'); }

	updateCssStyles(cssStyles: { [key: string]: string }): Thenable<void> { throw new Error('Not implemented'); }

	readonly onValidityChanged: vscode.Event<boolean> = undefined!;

	readonly valid: boolean = true;

	validate(): Thenable<boolean> { throw new Error('Not implemented'); }

	focus(): Thenable<void> { return Promise.resolve(); }

	dispose() { }
}