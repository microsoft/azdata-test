/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { StubComponent } from './stubComponent';

export class StubButton extends StubComponent implements azdata.ButtonComponent {
	// Helper functions
	click() {
		this._onDidClickEmitter.fire(this);
	}

	// Radio Button implementation

	readonly id = 'button';

	private _onDidClickEmitter = new vscode.EventEmitter<any>();

	onDidClick = this._onDidClickEmitter.event;
}
