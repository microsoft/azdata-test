/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as TypeMoq from 'typemoq';

/**
 * Creates a mock of a azdata.queryeditor.QueryDocument
 * @param uri The URI to give the document
 * @param providerId The providerId for the document. Defaults to MSSQL
 * @returns The mocked document
 */
export function createQueryDocumentMock(uri: string, providerId: string = 'MSSQL'): TypeMoq.IMock<azdata.queryeditor.QueryDocument> {
	const mock = TypeMoq.Mock.ofType<azdata.queryeditor.QueryDocument>();
	mock.setup(m => m.uri).returns(() => uri);
	mock.setup(m => m.providerId).returns(() => providerId);
	return mock;
}