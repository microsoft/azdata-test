/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { StubComponent } from './stubComponent';

export class StubInputBox extends StubComponent implements azdata.InputBoxComponent {
	readonly id = 'input-box';

	value?: string;
	ariaLive?: string;
	placeHolder?: string;
	inputType?: azdata.InputBoxInputType;
	required?: boolean;
	multiline?: boolean;
	rows?: number;
	columns?: number;
	min?: number;
	max?: number;
	stopEnterPropagation?: boolean;

	onTextChanged: vscode.Event<any> = undefined!;
	onEnterKeyPressed: vscode.Event<string> = undefined!;
}