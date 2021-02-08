/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { Event } from 'vscode';
import { StubContainer } from './stubContainer';

export class StubDivContainer extends StubContainer implements azdata.DivContainer {
	onDidClick: Event<any>;
	overflowY?: string;
	yOffsetChange?: number;
	clickable?: boolean;
}