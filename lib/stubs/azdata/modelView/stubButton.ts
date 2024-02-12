/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as azdata from 'azdata';
import type * as vscode from 'vscode';
import { StubComponent } from './stubComponent';

export class StubButton extends StubComponent implements azdata.ButtonComponent {

	constructor(private readonly _onDidClickEmitter?: vscode.EventEmitter<any>) {
		super();
	}

	// Helper functions
	click() {
		this._onDidClickEmitter.fire(this);
	}

	// Radio Button implementation

	readonly id = 'button';

	onDidClick = this._onDidClickEmitter?.event;
}
