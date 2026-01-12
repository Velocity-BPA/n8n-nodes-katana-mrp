/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi } from '../../utils';

export const manufacturingOrderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
      },
    },
    options: [
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a manufacturing order',
        action: 'Cancel a manufacturing order',
      },
      {
        name: 'Complete',
        value: 'complete',
        description: 'Mark a manufacturing order as complete',
        action: 'Complete a manufacturing order',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new manufacturing order',
        action: 'Create a manufacturing order',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a manufacturing order',
        action: 'Delete a manufacturing order',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a manufacturing order by ID',
        action: 'Get a manufacturing order',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple manufacturing orders',
        action: 'Get many manufacturing orders',
      },
      {
        name: 'Get Operation Rows',
        value: 'getOperationRows',
        description: 'Get operation steps for a manufacturing order',
        action: 'Get operation rows for manufacturing order',
      },
      {
        name: 'Get Recipe Rows',
        value: 'getRecipeRows',
        description: 'Get BOM/recipe rows for a manufacturing order',
        action: 'Get recipe rows for manufacturing order',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a manufacturing order',
        action: 'Update a manufacturing order',
      },
      {
        name: 'Update Production',
        value: 'updateProduction',
        description: 'Update production quantities',
        action: 'Update production quantities',
      },
    ],
    default: 'get',
  },
];

export const manufacturingOrderFields: INodeProperties[] = [
  // ----------------------------------
  //         Get / Delete / Update
  // ----------------------------------
  {
    displayName: 'Manufacturing Order ID',
    name: 'manufacturingOrderId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['get', 'delete', 'update', 'getRecipeRows', 'getOperationRows', 'updateProduction', 'complete', 'cancel'],
      },
    },
    description: 'The unique identifier of the manufacturing order',
  },

  // ----------------------------------
  //         Get All
  // ----------------------------------
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
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
        resource: ['manufacturingOrder'],
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
        resource: ['manufacturingOrder'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Created After',
        name: 'createdAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter orders created after this date',
      },
      {
        displayName: 'Created Before',
        name: 'createdBefore',
        type: 'dateTime',
        default: '',
        description: 'Filter orders created before this date',
      },
      {
        displayName: 'Due Date After',
        name: 'dueDateAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter orders due after this date',
      },
      {
        displayName: 'Due Date Before',
        name: 'dueDateBefore',
        type: 'dateTime',
        default: '',
        description: 'Filter orders due before this date',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Filter by production location',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Not Started', value: 'NOT_STARTED' },
          { name: 'Blocked', value: 'BLOCKED' },
          { name: 'In Progress', value: 'IN_PROGRESS' },
          { name: 'Done', value: 'DONE' },
          { name: 'Cancelled', value: 'CANCELLED' },
        ],
        default: '',
        description: 'Filter by status',
      },
      {
        displayName: 'Variant ID',
        name: 'variantId',
        type: 'number',
        default: 0,
        description: 'Filter by product variant',
      },
    ],
  },

  // ----------------------------------
  //         Create
  // ----------------------------------
  {
    displayName: 'Variant ID',
    name: 'variantId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['create'],
      },
    },
    description: 'The product variant ID to manufacture',
  },
  {
    displayName: 'Planned Quantity',
    name: 'plannedQuantity',
    type: 'number',
    required: true,
    default: 1,
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['create'],
      },
    },
    description: 'Quantity to manufacture',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        description: 'Due date for the manufacturing order',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Production location ID',
      },
      {
        displayName: 'MO Number',
        name: 'moNo',
        type: 'string',
        default: '',
        description: 'Custom manufacturing order number',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes for the order',
      },
      {
        displayName: 'Sales Order Row ID',
        name: 'salesOrderRowId',
        type: 'number',
        default: 0,
        description: 'Link to a sales order line item',
      },
      {
        displayName: 'Scheduled Start Date',
        name: 'scheduledStartDate',
        type: 'dateTime',
        default: '',
        description: 'Scheduled start date',
      },
    ],
  },

  // ----------------------------------
  //         Update
  // ----------------------------------
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        description: 'Due date',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Production location ID',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes',
      },
      {
        displayName: 'Planned Quantity',
        name: 'plannedQuantity',
        type: 'number',
        default: 1,
        description: 'Planned quantity',
      },
      {
        displayName: 'Scheduled Start Date',
        name: 'scheduledStartDate',
        type: 'dateTime',
        default: '',
        description: 'Scheduled start date',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Not Started', value: 'NOT_STARTED' },
          { name: 'Blocked', value: 'BLOCKED' },
          { name: 'In Progress', value: 'IN_PROGRESS' },
          { name: 'Done', value: 'DONE' },
        ],
        default: 'NOT_STARTED',
        description: 'Order status',
      },
    ],
  },

  // ----------------------------------
  //         Update Production
  // ----------------------------------
  {
    displayName: 'Actual Quantity',
    name: 'actualQuantity',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['updateProduction'],
      },
    },
    description: 'Actual produced quantity',
  },
  {
    displayName: 'Completed Quantity',
    name: 'completedQuantity',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['manufacturingOrder'],
        operation: ['updateProduction'],
      },
    },
    description: 'Completed quantity',
  },
];

export async function executeManufacturingOrder(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/manufacturing_orders/${moId}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.variantId) query.variant_id = filters.variantId;
      if (filters.locationId) query.location_id = filters.locationId;
      if (filters.createdAfter) query['created_at[gte]'] = filters.createdAfter;
      if (filters.createdBefore) query['created_at[lte]'] = filters.createdBefore;
      if (filters.dueDateAfter) query['due_date[gte]'] = filters.dueDateAfter;
      if (filters.dueDateBefore) query['due_date[lte]'] = filters.dueDateBefore;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/manufacturing_orders', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/manufacturing_orders', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      const plannedQuantity = this.getNodeParameter('plannedQuantity', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        variant_id: variantId,
        planned_quantity: formatNumericForApi(plannedQuantity),
      };

      if (additionalFields.moNo) body.mo_no = additionalFields.moNo;
      if (additionalFields.dueDate) body.due_date = additionalFields.dueDate;
      if (additionalFields.scheduledStartDate) body.scheduled_start_date = additionalFields.scheduledStartDate;
      if (additionalFields.locationId) body.location_id = additionalFields.locationId;
      if (additionalFields.salesOrderRowId) body.sales_order_row_id = additionalFields.salesOrderRowId;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/manufacturing_orders', removeEmptyValues(body));
      break;
    }

    case 'update': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.plannedQuantity) body.planned_quantity = formatNumericForApi(updateFields.plannedQuantity as number);
      if (updateFields.dueDate) body.due_date = updateFields.dueDate;
      if (updateFields.scheduledStartDate) body.scheduled_start_date = updateFields.scheduledStartDate;
      if (updateFields.locationId) body.location_id = updateFields.locationId;
      if (updateFields.status) body.status = updateFields.status;
      if (updateFields.notes) body.notes = updateFields.notes;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/manufacturing_orders/${moId}`, removeEmptyValues(body));
      break;
    }

    case 'delete': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      responseData = await katanaApiRequest.call(this, 'DELETE', `/manufacturing_orders/${moId}`);
      break;
    }

    case 'getRecipeRows': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/manufacturing_orders/${moId}/recipe_rows`);
      break;
    }

    case 'getOperationRows': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/manufacturing_orders/${moId}/operation_rows`);
      break;
    }

    case 'updateProduction': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      const actualQuantity = this.getNodeParameter('actualQuantity', i, 0) as number;
      const completedQuantity = this.getNodeParameter('completedQuantity', i, 0) as number;

      const body: IDataObject = {};
      if (actualQuantity) body.actual_quantity = formatNumericForApi(actualQuantity);
      if (completedQuantity) body.completed_quantity = formatNumericForApi(completedQuantity);

      responseData = await katanaApiRequest.call(this, 'PATCH', `/manufacturing_orders/${moId}`, removeEmptyValues(body));
      break;
    }

    case 'complete': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      responseData = await katanaApiRequest.call(this, 'PATCH', `/manufacturing_orders/${moId}`, { status: 'DONE' });
      break;
    }

    case 'cancel': {
      const moId = this.getNodeParameter('manufacturingOrderId', i) as number;
      responseData = await katanaApiRequest.call(this, 'PATCH', `/manufacturing_orders/${moId}`, { status: 'CANCELLED' });
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
