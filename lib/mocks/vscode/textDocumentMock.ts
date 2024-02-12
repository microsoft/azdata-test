/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';
import * as TypeMoq from 'typemoq';

export type RangeWithContent = { range: vscode.Range, content: string };

/**
 * Creates a mock of a vscode.TextDocument
 * @param uri The URI to give the document
 * @param contentOrRanges The content of the document. If just a string then that is returned when all context is gotten from the document, otherwise the array is a set of range to content mappings to return when that specified range is requested
 * @returns The mocked document
 */
export function createTextDocumentMock(uri: vscode.Uri, contentOrRanges: string | RangeWithContent[] = ''): TypeMoq.IMock<vscode.TextDocument> {
	const mock = TypeMoq.Mock.ofType<vscode.TextDocument>();
	mock.setup(m => m.uri).returns(() => uri);
	if (typeof contentOrRanges === 'string') {
		mock.setup(m => m.getText(undefined)).returns(() => contentOrRanges);
	} else {
		for (const rangeWithContent of contentOrRanges) {
			mock.setup(m => m.getText(TypeMoq.It.is<vscode.Range>(r => r.isEqual(rangeWithContent.range)))).returns(() => rangeWithContent.content);
		}
	}
	return mock;
}