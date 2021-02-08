/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { StubComponent } from './stubComponent';

export class StubRadioButton extends StubComponent implements azdata.RadioButtonComponent {
	// Helper functions
	click() {
		this.checked = true;
		this._onDidClickEmitter.fire(this);
	}

	// Radio Button implementation

	readonly id = 'radio-button';

	private _onDidClickEmitter = new vscode.EventEmitter<any>();
	private _onDidChangeCheckedStateEmitter = new vscode.EventEmitter<boolean>();

	onDidClick = this._onDidClickEmitter.event;
	onDidChangeCheckedState = this._onDidChangeCheckedStateEmitter.event;

	label?: string;
	value?: string;
	checked?: boolean;
}
