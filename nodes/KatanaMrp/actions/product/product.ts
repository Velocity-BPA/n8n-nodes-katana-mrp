/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues } from '../../utils';

export const productOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['product'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new product',
        action: 'Create a product',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a product',
        action: 'Delete a product',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a product by ID',
        action: 'Get a product',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple products',
        action: 'Get many products',
      },
      {
        name: 'Get Operations',
        value: 'getOperations',
        description: 'Get manufacturing operations for a product',
        action: 'Get manufacturing operations',
      },
      {
        name: 'Get Recipe',
        value: 'getRecipe',
        description: 'Get product recipe/BOM',
        action: 'Get product recipe',
      },
      {
        name: 'Get Variants',
        value: 'getVariants',
        description: 'Get product variants',
        action: 'Get product variants',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a product',
        action: 'Update a product',
      },
    ],
    default: 'get',
  },
];

export const productFields: INodeProperties[] = [
  // ----------------------------------
  //         Get / Delete / Update
  // ----------------------------------
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['get', 'delete', 'update', 'getVariants', 'getRecipe', 'getOperations'],
      },
    },
    description: 'The unique identifier of the product',
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
        resource: ['product'],
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
        resource: ['product'],
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
        resource: ['product'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether to include archived products',
      },
      {
        displayName: 'Category ID',
        name: 'categoryId',
        type: 'number',
        default: 0,
        description: 'Filter by category',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search products by name or SKU',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Product', value: 'product' },
          { name: 'Material', value: 'material' },
        ],
        default: '',
        description: 'Filter by product type',
      },
    ],
  },

  // ----------------------------------
  //         Create
  // ----------------------------------
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['create'],
      },
    },
    description: 'Product name',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Barcode',
        name: 'barcode',
        type: 'string',
        default: '',
        description: 'Product barcode',
      },
      {
        displayName: 'Category ID',
        name: 'categoryId',
        type: 'number',
        default: 0,
        description: 'Category ID',
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
        description: 'Product notes',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'Stock keeping unit',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Product', value: 'product' },
          { name: 'Material', value: 'material' },
        ],
        default: 'product',
        description: 'Product type',
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
        resource: ['product'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Archived',
        name: 'archived',
        type: 'boolean',
        default: false,
        description: 'Whether the product is archived',
      },
      {
        displayName: 'Barcode',
        name: 'barcode',
        type: 'string',
        default: '',
        description: 'Product barcode',
      },
      {
        displayName: 'Category ID',
        name: 'categoryId',
        type: 'number',
        default: 0,
        description: 'Category ID',
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
        description: 'Product name',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Product notes',
      },
      {
        displayName: 'SKU',
        name: 'sku',
        type: 'string',
        default: '',
        description: 'Stock keeping unit',
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

export async function executeProduct(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const productId = this.getNodeParameter('productId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/products/${productId}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      
      if (filters.type) query.type = filters.type;
      if (filters.categoryId) query.category_id = filters.categoryId;
      if (filters.search) query.search = filters.search;
      if (filters.archived !== undefined) query.archived = filters.archived;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/products', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/products', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        name,
      };

      if (additionalFields.sku) body.sku = additionalFields.sku;
      if (additionalFields.internalSku) body.internal_sku = additionalFields.internalSku;
      if (additionalFields.barcode) body.barcode = additionalFields.barcode;
      if (additionalFields.type) body.type = additionalFields.type;
      if (additionalFields.categoryId) body.category_id = additionalFields.categoryId;
      if (additionalFields.defaultSupplierId) body.default_supplier_id = additionalFields.defaultSupplierId;
      if (additionalFields.unit) body.unit = additionalFields.unit;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/products', removeEmptyValues(body));
      break;
    }

    case 'update': {
      const productId = this.getNodeParameter('productId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.sku) body.sku = updateFields.sku;
      if (updateFields.internalSku) body.internal_sku = updateFields.internalSku;
      if (updateFields.barcode) body.barcode = updateFields.barcode;
      if (updateFields.categoryId) body.category_id = updateFields.categoryId;
      if (updateFields.defaultSupplierId) body.default_supplier_id = updateFields.defaultSupplierId;
      if (updateFields.unit) body.unit = updateFields.unit;
      if (updateFields.notes) body.notes = updateFields.notes;
      if (updateFields.archived !== undefined) body.archived = updateFields.archived;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/products/${productId}`, removeEmptyValues(body));
      break;
    }

    case 'delete': {
      const productId = this.getNodeParameter('productId', i) as number;
      responseData = await katanaApiRequest.call(this, 'DELETE', `/products/${productId}`);
      break;
    }

    case 'getVariants': {
      const productId = this.getNodeParameter('productId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/products/${productId}/variants`);
      break;
    }

    case 'getRecipe': {
      const productId = this.getNodeParameter('productId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/products/${productId}/recipe`);
      break;
    }

    case 'getOperations': {
      const productId = this.getNodeParameter('productId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/products/${productId}/operations`);
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
