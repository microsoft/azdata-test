/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as TypeMoq from 'typemoq';

/**
 * Creates a mock of a vscode.TextEditor
 * @param document The underlying document for this editor
 * @param selections The current selections for the document. Defaults to an empty selection at position 0,0.
 * @returns The mocked editor
 */
export function createTextEditorMock(document: vscode.TextDocument, selections?: vscode.Selection[]): TypeMoq.IMock<vscode.TextEditor> {
	selections  = (!selections || selections.length === 0) ? [new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0))] : selections;
	const mock = TypeMoq.Mock.ofType<vscode.TextEditor>();
	mock.setup(m => m.document).returns(() => document);
	mock.setup(m => m.selection).returns(() => selections[0]);
	mock.setup(m => m.selections).returns(() => selections);
	return mock;
}