/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi } from '../../utils';

export const materialOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['material'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new material',
        action: 'Create a material',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a material',
        action: 'Delete a material',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a material by ID',
        action: 'Get a material',
      },
      {
        name: 'Get Inventory',
        value: 'getInventory',
        description: 'Get inventory levels for a material',
        action: 'Get material inventory',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple materials',
        action: 'Get many materials',
      },
      {
        name: 'Get Suppliers',
        value: 'getSuppliers',
        description: 'Get suppliers for a material',
        action: 'Get material suppliers',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a material',
        action: 'Update a material',
      },
    ],
    default: 'get',
  },
];

export const materialFields: INodeProperties[] = [
  {
    displayName: 'Material ID',
    name: 'materialId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['material'],
        operation: ['get', 'delete', 'update', 'getInventory', 'getSuppliers'],
      },
    },
    description: 'The unique identifier of the material',
  },

  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['material'],
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
        resource: ['material'],
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
        resource: ['material'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to include archived materials',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search materials by name or SKU',
      },
      {
        displayName: 'Supplier ID',
        name: 'supplierId',
        type: 'number',
        default: 0,
        description: 'Filter by supplier',
      },
    ],
  },

  // Create
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['material'],
        operation: ['create'],
      },
    },
    description: 'Material name',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['material'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Barcode',
        name: 'barcode',
        type: 'string',
        default: '',
        description: 'Barcode',
      },
      {
        displayName: 'Default Supplier ID',
        name: 'defaultSupplierId',
        type: 'number',
        default: 0,
        description: 'Default supplier ID',
      },
      {
        displayName: 'Internal SKU',
        name: 'internalSku',
        type: 'string',
        default: '',
        description: 'Internal SKU',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes',
      },
      {
        displayName: 'Purchase Price',
        name: 'purchasePrice',
        type: 'number',
        default: 0,
        description: 'Purchase price',
      },
      {
        displayName: 'Reorder Point',
        name: 'reorderPoint',
        type: 'number',
        default: 0,
        description: 'Reorder level',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'SKU',
      },
      {
        displayName: 'Unit',
        name: 'unit',
        type: 'string',
        default: '',
        description: 'Unit of measure',
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
        resource: ['material'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the material is archived',
      },
      {
        displayName: 'Barcode',
        name: 'barcode',
        type: 'string',
        default: '',
        description: 'Barcode',
      },
      {
        displayName: 'Default Supplier ID',
        name: 'defaultSupplierId',
        type: 'number',
        default: 0,
        description: 'Default supplier ID',
      },
      {
        displayName: 'Internal SKU',
        name: 'internalSku',
        type: 'string',
        default: '',
        description: 'Internal SKU',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Name',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes',
      },
      {
        displayName: 'Purchase Price',
        name: 'purchasePrice',
        type: 'number',
        default: 0,
        description: 'Purchase price',
      },
      {
        displayName: 'Reorder Point',
        name: 'reorderPoint',
        type: 'number',
        default: 0,
        description: 'Reorder level',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'SKU',
      },
      {
        displayName: 'Unit',
        name: 'unit',
        type: 'string',
        default: '',
        description: 'Unit of measure',
      },
    ],
  },
];

export async function executeMaterial(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const materialId = this.getNodeParameter('materialId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/materials/${materialId}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      if (filters.search) query.search = filters.search;
      if (filters.supplierId) query.supplier_id = filters.supplierId;
      if (filters.archived !== undefined) query.archived = filters.archived;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/materials', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/materials', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = { name };

      if (additionalFields.sku) body.sku = additionalFields.sku;
      if (additionalFields.internalSku) body.internal_sku = additionalFields.internalSku;
      if (additionalFields.barcode) body.barcode = additionalFields.barcode;
      if (additionalFields.defaultSupplierId) body.default_supplier_id = additionalFields.defaultSupplierId;
      if (additionalFields.unit) body.unit = additionalFields.unit;
      if (additionalFields.purchasePrice) body.purchase_price = formatNumericForApi(additionalFields.purchasePrice as number);
      if (additionalFields.reorderPoint) body.reorder_point = formatNumericForApi(additionalFields.reorderPoint as number);
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/materials', removeEmptyValues(body));
      break;
    }

    case 'update': {
      const materialId = this.getNodeParameter('materialId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.sku) body.sku = updateFields.sku;
      if (updateFields.internalSku) body.internal_sku = updateFields.internalSku;
      if (updateFields.barcode) body.barcode = updateFields.barcode;
      if (updateFields.defaultSupplierId) body.default_supplier_id = updateFields.defaultSupplierId;
      if (updateFields.unit) body.unit = updateFields.unit;
      if (updateFields.purchasePrice) body.purchase_price = formatNumericForApi(updateFields.purchasePrice as number);
      if (updateFields.reorderPoint) body.reorder_point = formatNumericForApi(updateFields.reorderPoint as number);
      if (updateFields.notes) body.notes = updateFields.notes;
      if (updateFields.archived !== undefined) body.archived = updateFields.archived;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/materials/${materialId}`, removeEmptyValues(body));
      break;
    }

    case 'delete': {
      const materialId = this.getNodeParameter('materialId', i) as number;
      responseData = await katanaApiRequest.call(this, 'DELETE', `/materials/${materialId}`);
      break;
    }

    case 'getInventory': {
      const materialId = this.getNodeParameter('materialId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/materials/${materialId}/inventory`);
      break;
    }

    case 'getSuppliers': {
      const materialId = this.getNodeParameter('materialId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/materials/${materialId}/suppliers`);
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
