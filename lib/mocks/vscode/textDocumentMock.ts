/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as TypeMoq from 'typemoq';

export type RangeWithContent = { range: vscode.Range, content: string };

export function createTextDocumentMock(uri: vscode.Uri, contentOrRanges: string | RangeWithContent[] = ''): TypeMoq.IMock<vscode.TextDocument> {
	const mock = TypeMoq.Mock.ofType<vscode.TextDocument>();
	mock.setup(m => m.uri).returns(() => uri);
	if (typeof contentOrRanges === 'string') {
		mock.setup(m => m.getText(undefined)).returns(() => contentOrRanges);
	} else {
		for (const rangeWithContent of contentOrRanges) {
			mock.setup(m => m.getText(rangeWithContent.range)).returns(() => rangeWithContent.content);
		}
	}
	return mock;
}