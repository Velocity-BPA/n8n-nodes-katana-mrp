/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class KatanaMrpApi implements ICredentialType {
  name = 'katanaMrpApi';
  displayName = 'Katana MRP API';
  documentationUrl = 'https://developer.katanamrp.com/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description:
        'Your Katana API key. Navigate to Katana → Settings → API → API keys to generate one.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
        Accept: 'application/json',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.katanamrp.com/v1',
      url: '/products',
      method: 'GET',
      qs: {
        limit: 1,
      },
    },
  };
}
