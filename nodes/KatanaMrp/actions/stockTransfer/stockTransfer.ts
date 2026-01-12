/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi } from '../../utils';

export const stockTransferOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
      },
    },
    options: [
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a stock transfer',
        action: 'Cancel a stock transfer',
      },
      {
        name: 'Complete',
        value: 'complete',
        description: 'Complete a stock transfer',
        action: 'Complete a stock transfer',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a stock transfer',
        action: 'Create a stock transfer',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a stock transfer by ID',
        action: 'Get a stock transfer',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple stock transfers',
        action: 'Get many stock transfers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a stock transfer',
        action: 'Update a stock transfer',
      },
    ],
    default: 'get',
  },
];

export const stockTransferFields: INodeProperties[] = [
  {
    displayName: 'Stock Transfer ID',
    name: 'stockTransferId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
        operation: ['get', 'update', 'complete', 'cancel'],
      },
    },
    description: 'The unique identifier of the stock transfer',
  },

  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
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
        resource: ['stockTransfer'],
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
        resource: ['stockTransfer'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Destination Location ID',
        name: 'destinationLocationId',
        type: 'number',
        default: 0,
        description: 'Filter by destination location',
      },
      {
        displayName: 'Source Location ID',
        name: 'sourceLocationId',
        type: 'number',
        default: 0,
        description: 'Filter by source location',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'DRAFT' },
          { name: 'In Transit', value: 'IN_TRANSIT' },
          { name: 'Done', value: 'DONE' },
          { name: 'Cancelled', value: 'CANCELLED' },
        ],
        default: '',
        description: 'Filter by status',
      },
    ],
  },

  // Create
  {
    displayName: 'Source Location ID',
    name: 'sourceLocationId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
        operation: ['create'],
      },
    },
    description: 'Source location ID',
  },
  {
    displayName: 'Destination Location ID',
    name: 'destinationLocationId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
        operation: ['create'],
      },
    },
    description: 'Destination location ID',
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
        resource: ['stockTransfer'],
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
        ],
      },
    ],
    description: 'Transfer line items',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes',
      },
      {
        displayName: 'Scheduled Date',
        name: 'scheduledDate',
        type: 'dateTime',
        default: '',
        description: 'Scheduled date',
      },
    ],
  },

  // Update
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['stockTransfer'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Destination Location ID',
        name: 'destinationLocationId',
        type: 'number',
        default: 0,
        description: 'Destination location ID',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes',
      },
      {
        displayName: 'Scheduled Date',
        name: 'scheduledDate',
        type: 'dateTime',
        default: '',
        description: 'Scheduled date',
      },
      {
        displayName: 'Source Location ID',
        name: 'sourceLocationId',
        type: 'number',
        default: 0,
        description: 'Source location ID',
      },
    ],
  },
];

export async function executeStockTransfer(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const id = this.getNodeParameter('stockTransferId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/stock_transfers/${id}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      if (filters.status) query.status = filters.status;
      if (filters.sourceLocationId) query.source_location_id = filters.sourceLocationId;
      if (filters.destinationLocationId) query.destination_location_id = filters.destinationLocationId;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/stock_transfers', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/stock_transfers', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const sourceLocationId = this.getNodeParameter('sourceLocationId', i) as number;
      const destinationLocationId = this.getNodeParameter('destinationLocationId', i) as number;
      const rowsData = this.getNodeParameter('rows', i, {}) as IDataObject;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const rows = ((rowsData.row as IDataObject[]) || []).map((row) => ({
        variant_id: row.variantId,
        quantity: formatNumericForApi(row.quantity as number),
        batch_sn: row.batchSn || undefined,
      }));

      const body: IDataObject = {
        source_location_id: sourceLocationId,
        destination_location_id: destinationLocationId,
        rows,
      };

      if (additionalFields.scheduledDate) body.scheduled_date = additionalFields.scheduledDate;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/stock_transfers', removeEmptyValues(body));
      break;
    }

    case 'update': {
      const id = this.getNodeParameter('stockTransferId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const body: IDataObject = {};
      if (updateFields.sourceLocationId) body.source_location_id = updateFields.sourceLocationId;
      if (updateFields.destinationLocationId) body.destination_location_id = updateFields.destinationLocationId;
      if (updateFields.scheduledDate) body.scheduled_date = updateFields.scheduledDate;
      if (updateFields.notes) body.notes = updateFields.notes;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/stock_transfers/${id}`, removeEmptyValues(body));
      break;
    }

    case 'complete': {
      const id = this.getNodeParameter('stockTransferId', i) as number;
      responseData = await katanaApiRequest.call(this, 'POST', `/stock_transfers/${id}/complete`);
      break;
    }

    case 'cancel': {
      const id = this.getNodeParameter('stockTransferId', i) as number;
      responseData = await katanaApiRequest.call(this, 'POST', `/stock_transfers/${id}/cancel`);
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
