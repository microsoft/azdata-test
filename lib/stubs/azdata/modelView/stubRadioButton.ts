/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as azdata from 'azdata';
import type * as vscode from 'vscode';
import { StubComponent } from './stubComponent';

export class StubRadioButton extends StubComponent implements azdata.RadioButtonComponent {

	constructor(private readonly _onDidClickEmitter?: vscode.EventEmitter<any>, private readonly _onDidChangeCheckedStateEmitter?: vscode.EventEmitter<boolean>) {
		super();
	}
	// Helper functions
	click() {
		this.checked = true;
		this._onDidClickEmitter.fire(this);
	}

	// Radio Button implementation

	readonly id = 'radio-button';

	onDidClick = this._onDidClickEmitter?.event;
	onDidChangeCheckedState = this._onDidChangeCheckedStateEmitter?.event;

	label?: string;
	value?: string;
	checked?: boolean;
}
