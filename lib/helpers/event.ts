/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

/**
 * Wraps an event with a new event that will only fire the first time the underlying event fires
 * @param event The event to wrap
 * @returns The wrapped event
 */
export function onceEvent<T>(event: vscode.Event<T>): vscode.Event<T> {
	return (listener: (e: T) => any, thisArgs?: any, disposables?: vscode.Disposable[]): vscode.Disposable => {
		const result = event(e => {
			result.dispose();
			return listener.call(thisArgs, e);
		}, null, disposables);

		return result;
	};
}

/**
 * Creates a promise that will resolve when the specified event fires
 * @param event The event to convert
 * @returns The promise wrapper
 */
export function eventToPromise<T>(event: vscode.Event<T>): Promise<T> {
	return new Promise<T>(c => onceEvent(event)(c));
}