/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi } from '../../utils';

export const inventoryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['inventory'],
      },
    },
    options: [
      {
        name: 'Adjust',
        value: 'adjust',
        description: 'Make an inventory adjustment',
        action: 'Adjust inventory',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get inventory for a product/material',
        action: 'Get inventory',
      },
      {
        name: 'Get By Location',
        value: 'getByLocation',
        description: 'Get inventory by location',
        action: 'Get inventory by location',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get all inventory records',
        action: 'Get many inventory records',
      },
      {
        name: 'Get Summary',
        value: 'getSummary',
        description: 'Get inventory summary',
        action: 'Get inventory summary',
      },
    ],
    default: 'get',
  },
];

export const inventoryFields: INodeProperties[] = [
  {
    displayName: 'Inventory ID',
    name: 'inventoryId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['get'],
      },
    },
    description: 'The inventory record ID',
  },

  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['getAll'],
      },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 50,
    description: 'Max number of results to return',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Filter by location',
      },
      {
        displayName: 'Variant ID',
        name: 'variantId',
        type: 'number',
        default: 0,
        description: 'Filter by variant',
      },
    ],
  },

  // Get By Location
  {
    displayName: 'Location ID',
    name: 'locationId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['getByLocation'],
      },
    },
    description: 'The location ID',
  },

  // Adjust
  {
    displayName: 'Variant ID',
    name: 'variantId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjust'],
      },
    },
    description: 'The variant ID to adjust',
  },
  {
    displayName: 'Adjustment Type',
    name: 'adjustmentType',
    type: 'options',
    options: [
      { name: 'Add', value: 'add' },
      { name: 'Remove', value: 'remove' },
    ],
    required: true,
    default: 'add',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjust'],
      },
    },
    description: 'Type of adjustment',
  },
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 1,
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjust'],
      },
    },
    description: 'Quantity to adjust',
  },
  {
    displayName: 'Adjustment Additional Fields',
    name: 'adjustmentAdditionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjust'],
      },
    },
    options: [
      {
        displayName: 'Batch/Serial Number',
        name: 'batchSn',
        type: 'string',
        default: '',
        description: 'Batch or serial number',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Location ID',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Adjustment notes',
      },
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        description: 'Reason for adjustment',
      },
    ],
  },
];

export async function executeInventory(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const inventoryId = this.getNodeParameter('inventoryId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/inventory/${inventoryId}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      if (filters.variantId) query.variant_id = filters.variantId;
      if (filters.locationId) query.location_id = filters.locationId;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/inventory', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/inventory', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'getSummary': {
      responseData = await katanaApiRequest.call(this, 'GET', '/inventory/summary');
      break;
    }

    case 'getByLocation': {
      const locationId = this.getNodeParameter('locationId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', '/inventory', {}, { location_id: locationId });
      break;
    }

    case 'adjust': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      const adjustmentType = this.getNodeParameter('adjustmentType', i) as string;
      const quantity = this.getNodeParameter('quantity', i) as number;
      const additionalFields = this.getNodeParameter('adjustmentAdditionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        type: adjustmentType,
        rows: [
          {
            variant_id: variantId,
            quantity: formatNumericForApi(quantity),
            batch_sn: additionalFields.batchSn || undefined,
          },
        ],
      };

      if (additionalFields.locationId) body.location_id = additionalFields.locationId;
      if (additionalFields.reason) body.reason = additionalFields.reason;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/stock_adjustments', removeEmptyValues(body));
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
