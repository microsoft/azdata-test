/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';

/**
 * Creates a test connection profile with default values
 * @param profileValues Any values to override from their defaults
 * @returns A test connection profile
 */
export function createConnectionProfile(profileValues?: Partial<azdata.connection.ConnectionProfile>): azdata.connection.ConnectionProfile {
	const profile: azdata.connection.ConnectionProfile = {
		providerId: 'TestProvider',
		connectionId: 'TestConnectionId',
		connectionName: 'TestConnectionName',
		serverName: 'TestServerName',
		databaseName: 'TestDatabaseName',
		userName: 'TestUsername',
		password: 'TestPassword',
		authenticationType: 'TestAuthenticationType',
		savePassword: true,
		groupFullName: 'TestGroupFullName',
		groupId: 'TestGroupId',
		saveProfile: true,
		options: {}
	};
	Object.assign(profile, profileValues);
	return profile;
}