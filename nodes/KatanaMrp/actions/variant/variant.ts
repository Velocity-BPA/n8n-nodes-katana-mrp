/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi } from '../../utils';

export const variantOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['variant'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new variant',
        action: 'Create a variant',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a variant',
        action: 'Delete a variant',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a variant by ID',
        action: 'Get a variant',
      },
      {
        name: 'Get Inventory',
        value: 'getInventory',
        description: 'Get inventory levels for a variant',
        action: 'Get variant inventory',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple variants',
        action: 'Get many variants',
      },
      {
        name: 'Get Recipe',
        value: 'getRecipe',
        description: 'Get variant-specific recipe',
        action: 'Get variant recipe',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a variant',
        action: 'Update a variant',
      },
    ],
    default: 'get',
  },
];

export const variantFields: INodeProperties[] = [
  {
    displayName: 'Variant ID',
    name: 'variantId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['variant'],
        operation: ['get', 'delete', 'update', 'getInventory', 'getRecipe'],
      },
    },
    description: 'The unique identifier of the variant',
  },

  // Get All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
      show: {
        resource: ['variant'],
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
        resource: ['variant'],
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
        resource: ['variant'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to include archived variants',
      },
      {
        displayName: 'Product ID',
        name: 'productId',
        type: 'number',
        default: 0,
        description: 'Filter by parent product',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search by name or SKU',
      },
    ],
  },

  // Create
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['variant'],
        operation: ['create'],
      },
    },
    description: 'Parent product ID',
  },
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['variant'],
        operation: ['create'],
      },
    },
    description: 'Variant name (e.g., "Large - Red")',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['variant'],
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
        displayName: 'Internal SKU',
        name: 'internalSku',
        type: 'string',
        default: '',
        description: 'Internal SKU',
      },
      {
        displayName: 'Purchase Price',
        name: 'purchasePrice',
        type: 'number',
        default: 0,
        description: 'Purchase price',
      },
      {
        displayName: 'Sales Price',
        name: 'salesPrice',
        type: 'number',
        default: 0,
        description: 'Sales price',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'SKU',
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
        resource: ['variant'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the variant is archived',
      },
      {
        displayName: 'Barcode',
        name: 'barcode',
        type: 'string',
        default: '',
        description: 'Barcode',
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
        description: 'Variant name',
      },
      {
        displayName: 'Purchase Price',
        name: 'purchasePrice',
        type: 'number',
        default: 0,
        description: 'Purchase price',
      },
      {
        displayName: 'Sales Price',
        name: 'salesPrice',
        type: 'number',
        default: 0,
        description: 'Sales price',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'SKU',
      },
    ],
  },
];

export async function executeVariant(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/variants/${variantId}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      if (filters.productId) query.product_id = filters.productId;
      if (filters.search) query.search = filters.search;
      if (filters.archived !== undefined) query.archived = filters.archived;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/variants', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/variants', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const productId = this.getNodeParameter('productId', i) as number;
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        product_id: productId,
        name,
      };

      if (additionalFields.sku) body.sku = additionalFields.sku;
      if (additionalFields.internalSku) body.internal_sku = additionalFields.internalSku;
      if (additionalFields.barcode) body.barcode = additionalFields.barcode;
      if (additionalFields.salesPrice) body.sales_price = formatNumericForApi(additionalFields.salesPrice as number);
      if (additionalFields.purchasePrice) body.purchase_price = formatNumericForApi(additionalFields.purchasePrice as number);

      responseData = await katanaApiRequest.call(this, 'POST', '/variants', removeEmptyValues(body));
      break;
    }

    case 'update': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.sku) body.sku = updateFields.sku;
      if (updateFields.internalSku) body.internal_sku = updateFields.internalSku;
      if (updateFields.barcode) body.barcode = updateFields.barcode;
      if (updateFields.salesPrice) body.sales_price = formatNumericForApi(updateFields.salesPrice as number);
      if (updateFields.purchasePrice) body.purchase_price = formatNumericForApi(updateFields.purchasePrice as number);
      if (updateFields.archived !== undefined) body.archived = updateFields.archived;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/variants/${variantId}`, removeEmptyValues(body));
      break;
    }

    case 'delete': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      responseData = await katanaApiRequest.call(this, 'DELETE', `/variants/${variantId}`);
      break;
    }

    case 'getInventory': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/variants/${variantId}/inventory`);
      break;
    }

    case 'getRecipe': {
      const variantId = this.getNodeParameter('variantId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/variants/${variantId}/recipe`);
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
