/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IDataObject,
  IExecuteFunctions,
  IHookFunctions,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
  IPollFunctions,
  IRequestOptions,
  IWebhookFunctions,
  NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://api.katanamrp.com/v1';

// Rate limiting configuration
const MIN_REQUEST_INTERVAL = 200; // 5 requests per second
let lastRequestTime = 0;

/**
 * Wait to respect rate limits
 */
async function respectRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
}

/**
 * Make an authenticated request to the Katana API
 */
export async function katanaApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions | IPollFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
): Promise<any> {
  await respectRateLimit();

  const options: IRequestOptions = {
    method,
    uri: `${BASE_URL}${endpoint}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (body && Object.keys(body).length > 0) {
    options.body = body;
  }

  if (query && Object.keys(query).length > 0) {
    options.qs = query;
  }

  try {
    return await this.helpers.requestWithAuthentication.call(this, 'katanaMrpApi', options);
  } catch (error: any) {
    if (error.statusCode === 429) {
      throw new NodeApiError(this.getNode(), error, {
        message: 'Rate limit exceeded. Maximum 5 requests/second, 300/minute.',
        description: 'Please wait before making more requests.',
      });
    }

    if (error.statusCode === 401) {
      throw new NodeApiError(this.getNode(), error, {
        message: 'Invalid API key',
        description: 'Please check your Katana API key in the credentials.',
      });
    }

    if (error.statusCode === 403) {
      throw new NodeApiError(this.getNode(), error, {
        message: 'Access forbidden',
        description:
          'API access requires a Professional or Professional Plus plan. Please upgrade your Katana subscription.',
      });
    }

    if (error.statusCode === 404) {
      throw new NodeApiError(this.getNode(), error, {
        message: 'Resource not found',
        description: 'The requested resource does not exist.',
      });
    }

    if (error.statusCode === 422) {
      const validationErrors = error.response?.body?.error?.errors;
      let description = 'The provided data was invalid.';
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('; ');
        description = errorMessages;
      }
      throw new NodeApiError(this.getNode(), error, {
        message: 'Validation error',
        description,
      });
    }

    throw new NodeApiError(this.getNode(), error);
  }
}

/**
 * Make an API request and return all items using cursor-based pagination
 */
export async function katanaApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | IHookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  query?: IDataObject,
  limit?: number,
): Promise<any[]> {
  const returnData: any[] = [];
  let cursor: string | undefined;
  const pageLimit = 100;

  query = query || {};
  query.limit = pageLimit;

  do {
    if (cursor) {
      query.cursor = cursor;
    }

    const responseData = await katanaApiRequest.call(this, method, endpoint, body, query);

    if (responseData.data && Array.isArray(responseData.data)) {
      returnData.push(...responseData.data);
    } else if (Array.isArray(responseData)) {
      returnData.push(...responseData);
    }

    cursor = responseData.pagination?.cursor_next;

    // If a limit is specified, stop when we've collected enough items
    if (limit && returnData.length >= limit) {
      return returnData.slice(0, limit);
    }
  } while (cursor);

  return returnData;
}

/**
 * Build filter query parameters from node options
 */
export function buildFilterQuery(
  filters: IDataObject,
  fieldMapping?: Record<string, string>,
): IDataObject {
  const query: IDataObject = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const apiField = fieldMapping?.[key] || key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle range filters like created_at[gte]
      for (const [operator, operatorValue] of Object.entries(value as IDataObject)) {
        if (operatorValue !== undefined && operatorValue !== null && operatorValue !== '') {
          query[`${apiField}[${operator}]`] = operatorValue;
        }
      }
    } else {
      query[apiField] = value;
    }
  }

  return query;
}

/**
 * Format date for API requests
 */
export function formatDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return new Date(date).toISOString();
}

/**
 * Parse Katana API date response
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}
