/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi } from '../../utils';

export const stockAdjustmentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['stockAdjustment'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a stock adjustment',
        action: 'Create a stock adjustment',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a stock adjustment by ID',
        action: 'Get a stock adjustment',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple stock adjustments',
        action: 'Get many stock adjustments',
      },
      {
        name: 'Get Rows',
        value: 'getRows',
        description: 'Get line items for a stock adjustment',
        action: 'Get stock adjustment rows',
      },
    ],
    default: 'get',
  },
];

export const stockAdjustmentFields: INodeProperties[] = [
  {
    displayName: 'Stock Adjustment ID',
    name: 'stockAdjustmentId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['stockAdjustment'],
        operation: ['get', 'getRows'],
      },
    },
    description: 'The unique identifier of the stock adjustment',
  },

  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['stockAdjustment'],
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
        resource: ['stockAdjustment'],
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
        resource: ['stockAdjustment'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Created After',
        name: 'createdAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter adjustments created after this date',
      },
      {
        displayName: 'Created Before',
        name: 'createdBefore',
        type: 'dateTime',
        default: '',
        description: 'Filter adjustments created before this date',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Filter by location',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
        ],
        default: '',
        description: 'Filter by adjustment type',
      },
    ],
  },

  // Create
  {
    displayName: 'Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Add', value: 'add' },
      { name: 'Remove', value: 'remove' },
    ],
    required: true,
    default: 'add',
    displayOptions: {
      show: {
        resource: ['stockAdjustment'],
        operation: ['create'],
      },
    },
    description: 'Type of adjustment',
  },
  {
    displayName: 'Rows',
    name: 'rows',
    placeholder: 'Add Row',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    required: true,
    default: {},
    displayOptions: {
      show: {
        resource: ['stockAdjustment'],
        operation: ['create'],
      },
    },
    options: [
      {
        name: 'row',
        displayName: 'Row',
        values: [
          {
            displayName: 'Variant ID',
            name: 'variantId',
            type: 'number',
            default: 0,
            description: 'Variant ID',
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            default: 1,
            description: 'Quantity',
          },
          {
            displayName: 'Batch/Serial Number',
            name: 'batchSn',
            type: 'string',
            default: '',
            description: 'Batch or serial number',
          },
          {
            displayName: 'Notes',
            name: 'notes',
            type: 'string',
            default: '',
            description: 'Row notes',
          },
        ],
      },
    ],
    description: 'Adjustment line items',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['stockAdjustment'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'Adjustment date',
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
        description: 'Notes',
      },
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        description: 'Adjustment reason',
      },
    ],
  },
];

export async function executeStockAdjustment(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const id = this.getNodeParameter('stockAdjustmentId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/stock_adjustments/${id}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      if (filters.type) query.type = filters.type;
      if (filters.locationId) query.location_id = filters.locationId;
      if (filters.createdAfter) query['created_at[gte]'] = filters.createdAfter;
      if (filters.createdBefore) query['created_at[lte]'] = filters.createdBefore;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/stock_adjustments', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/stock_adjustments', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const type = this.getNodeParameter('type', i) as string;
      const rowsData = this.getNodeParameter('rows', i, {}) as IDataObject;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const rows = ((rowsData.row as IDataObject[]) || []).map((row) => ({
        variant_id: row.variantId,
        quantity: formatNumericForApi(row.quantity as number),
        batch_sn: row.batchSn || undefined,
        notes: row.notes || undefined,
      }));

      const body: IDataObject = {
        type,
        rows,
      };

      if (additionalFields.locationId) body.location_id = additionalFields.locationId;
      if (additionalFields.reason) body.reason = additionalFields.reason;
      if (additionalFields.date) body.date = additionalFields.date;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/stock_adjustments', removeEmptyValues(body));
      break;
    }

    case 'getRows': {
      const id = this.getNodeParameter('stockAdjustmentId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/stock_adjustments/${id}/rows`);
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
