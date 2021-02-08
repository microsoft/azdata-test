/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { StubComponent } from './stubComponent';

export class StubText extends StubComponent implements azdata.TextComponent {
	readonly id = 'text-box';
}