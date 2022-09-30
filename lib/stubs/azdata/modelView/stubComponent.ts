/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';

export class StubComponent implements azdata.Component {
	id: string;
	updateProperties(properties: { [key: string]: any; }): Thenable<void> {
		throw new Error('Method not implemented.');
	}
	updateProperty(key: string, value: any): Thenable<void> {
		throw new Error('Method not implemented.');
	}
	updateCssStyles(cssStyles: { [key: string]: string; }): Thenable<void> {
		throw new Error('Method not implemented.');
	}
	onValidityChanged: vscode.Event<boolean>;
	valid: boolean;
	validate(): Thenable<boolean> {
		throw new Error('Method not implemented.');
	}
	focus(): Thenable<void> {
		throw new Error('Method not implemented.');
	}
	height?: string | number = 0;
	width?: string | number = 0;
	position?: azdata.PositionType = 'initial';
	enabled?: boolean = false;
	display?: azdata.DisplayType = 'initial';
	ariaLabel?: string = '';
	ariaRole?: string = '';
	ariaSelected?: boolean = false;
	CSSStyles?: { [key: string]: string; } = { };
}