/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { StubComponent } from './stubComponent';

export class StubContainer extends StubComponent implements azdata.Container<any, any> {
	items: azdata.Component[] = [];
	clearItems(): void {
		this.items.length = 0;
	}
	addItems(itemConfigs: azdata.Component[], itemLayout?: any): void {
		this.items.push(...itemConfigs);
	}
	addItem(component: azdata.Component, itemLayout?: any): void {
		this.items.push(component);
	}
	insertItem(component: azdata.Component, index: number, itemLayout?: any): void {
		throw new Error('Method not implemented.');
	}
	removeItem(component: azdata.Component): boolean {
		throw new Error('Method not implemented.');
	}
	setLayout(layout: any): void {
		throw new Error('Method not implemented.');
	}
}