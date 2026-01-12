/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport';
import { removeEmptyValues, formatNumericForApi, buildAddressObject } from '../../utils';

export const salesOrderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
      },
    },
    options: [
      {
        name: 'Add Row',
        value: 'addRow',
        description: 'Add a line item to a sales order',
        action: 'Add line item to sales order',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new sales order',
        action: 'Create a sales order',
      },
      {
        name: 'Create Fulfillment',
        value: 'createFulfillment',
        description: 'Create a fulfillment for a sales order',
        action: 'Create fulfillment for sales order',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a sales order',
        action: 'Delete a sales order',
      },
      {
        name: 'Delete Row',
        value: 'deleteRow',
        description: 'Remove a line item from a sales order',
        action: 'Delete line item from sales order',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Retrieve a sales order by ID',
        action: 'Get a sales order',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Retrieve multiple sales orders',
        action: 'Get many sales orders',
      },
      {
        name: 'Get Fulfillments',
        value: 'getFulfillments',
        description: 'Get fulfillments for a sales order',
        action: 'Get fulfillments for sales order',
      },
      {
        name: 'Get Rows',
        value: 'getRows',
        description: 'Get line items for a sales order',
        action: 'Get line items for sales order',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a sales order',
        action: 'Update a sales order',
      },
      {
        name: 'Update Row',
        value: 'updateRow',
        description: 'Update a line item in a sales order',
        action: 'Update line item in sales order',
      },
    ],
    default: 'get',
  },
];

export const salesOrderFields: INodeProperties[] = [
  // ----------------------------------
  //         Get / Delete
  // ----------------------------------
  {
    displayName: 'Sales Order ID',
    name: 'salesOrderId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['get', 'delete', 'update', 'getRows', 'addRow', 'getFulfillments', 'createFulfillment'],
      },
    },
    description: 'The unique identifier of the sales order',
  },

  // ----------------------------------
  //         Row Operations
  // ----------------------------------
  {
    displayName: 'Row ID',
    name: 'rowId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['updateRow', 'deleteRow'],
      },
    },
    description: 'The unique identifier of the line item',
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
        resource: ['salesOrder'],
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
        resource: ['salesOrder'],
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
        resource: ['salesOrder'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'number',
        default: 0,
        description: 'Filter by customer ID',
      },
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
        displayName: 'Invoicing Status',
        name: 'invoicingStatus',
        type: 'options',
        options: [
          { name: 'Not Invoiced', value: 'notInvoiced' },
          { name: 'Partially Invoiced', value: 'partiallyInvoiced' },
          { name: 'Invoiced', value: 'invoiced' },
        ],
        default: '',
        description: 'Filter by invoicing status',
      },
      {
        displayName: 'Source',
        name: 'source',
        type: 'options',
        options: [
          { name: 'Katana', value: 'katana' },
          { name: 'Shopify', value: 'shopify' },
          { name: 'WooCommerce', value: 'woocommerce' },
          { name: 'BigCommerce', value: 'bigcommerce' },
          { name: 'Amazon', value: 'amazon' },
          { name: 'Etsy', value: 'etsy' },
          { name: 'API', value: 'api' },
        ],
        default: '',
        description: 'Filter by order source',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Not Shipped', value: 'NOT_SHIPPED' },
          { name: 'Partially Shipped', value: 'PARTIALLY_SHIPPED' },
          { name: 'Shipped', value: 'SHIPPED' },
          { name: 'Cancelled', value: 'CANCELLED' },
        ],
        default: '',
        description: 'Filter by shipping status',
      },
      {
        displayName: 'Updated After',
        name: 'updatedAfter',
        type: 'dateTime',
        default: '',
        description: 'Filter orders updated after this date',
      },
    ],
  },

  // ----------------------------------
  //         Create
  // ----------------------------------
  {
    displayName: 'Customer ID',
    name: 'customerId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['create'],
      },
    },
    description: 'The customer ID for this order',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Additional Info',
        name: 'additionalInfo',
        type: 'string',
        default: '',
        description: 'Additional notes or comments for the order',
      },
      {
        displayName: 'Delivery Date',
        name: 'deliveryDate',
        type: 'dateTime',
        default: '',
        description: 'Expected delivery date',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Fulfillment location ID',
      },
      {
        displayName: 'Order Created Date',
        name: 'orderCreatedDate',
        type: 'dateTime',
        default: '',
        description: 'Order creation date',
      },
      {
        displayName: 'Order Number',
        name: 'orderNo',
        type: 'string',
        default: '',
        description: 'Custom order number',
      },
      {
        displayName: 'Shipping Address City',
        name: 'shippingCity',
        type: 'string',
        default: '',
        description: 'Shipping address city',
      },
      {
        displayName: 'Shipping Address Country',
        name: 'shippingCountry',
        type: 'string',
        default: '',
        description: 'Shipping address country',
      },
      {
        displayName: 'Shipping Address Line 1',
        name: 'shippingLine1',
        type: 'string',
        default: '',
        description: 'Shipping address line 1',
      },
      {
        displayName: 'Shipping Address Line 2',
        name: 'shippingLine2',
        type: 'string',
        default: '',
        description: 'Shipping address line 2',
      },
      {
        displayName: 'Shipping Address Postal Code',
        name: 'shippingPostalCode',
        type: 'string',
        default: '',
        description: 'Shipping address postal code',
      },
      {
        displayName: 'Shipping Address State',
        name: 'shippingState',
        type: 'string',
        default: '',
        description: 'Shipping address state/province',
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
        resource: ['salesOrder'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Additional Info',
        name: 'additionalInfo',
        type: 'string',
        default: '',
        description: 'Additional notes or comments',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'number',
        default: 0,
        description: 'Customer ID',
      },
      {
        displayName: 'Delivery Date',
        name: 'deliveryDate',
        type: 'dateTime',
        default: '',
        description: 'Expected delivery date',
      },
      {
        displayName: 'Location ID',
        name: 'locationId',
        type: 'number',
        default: 0,
        description: 'Fulfillment location ID',
      },
      {
        displayName: 'Picked Date',
        name: 'pickedDate',
        type: 'dateTime',
        default: '',
        description: 'Date items were picked',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Not Shipped', value: 'NOT_SHIPPED' },
          { name: 'Partially Shipped', value: 'PARTIALLY_SHIPPED' },
          { name: 'Shipped', value: 'SHIPPED' },
          { name: 'Cancelled', value: 'CANCELLED' },
        ],
        default: 'NOT_SHIPPED',
        description: 'Order status',
      },
    ],
  },

  // ----------------------------------
  //         Add Row
  // ----------------------------------
  {
    displayName: 'Variant ID',
    name: 'variantId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['addRow'],
      },
    },
    description: 'The product variant ID',
  },
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 1,
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['addRow'],
      },
    },
    description: 'Quantity to order',
  },
  {
    displayName: 'Row Additional Fields',
    name: 'rowAdditionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['addRow'],
      },
    },
    options: [
      {
        displayName: 'Discount',
        name: 'discount',
        type: 'number',
        default: 0,
        description: 'Discount amount',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Line item notes',
      },
      {
        displayName: 'Tax Rate ID',
        name: 'taxRateId',
        type: 'number',
        default: 0,
        description: 'Tax rate ID',
      },
      {
        displayName: 'Unit Price',
        name: 'unitPrice',
        type: 'number',
        default: 0,
        description: 'Unit price',
      },
    ],
  },

  // ----------------------------------
  //         Update Row
  // ----------------------------------
  {
    displayName: 'Row Update Fields',
    name: 'rowUpdateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['updateRow'],
      },
    },
    options: [
      {
        displayName: 'Discount',
        name: 'discount',
        type: 'number',
        default: 0,
        description: 'Discount amount',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Line item notes',
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 1,
        description: 'Quantity',
      },
      {
        displayName: 'Tax Rate ID',
        name: 'taxRateId',
        type: 'number',
        default: 0,
        description: 'Tax rate ID',
      },
      {
        displayName: 'Unit Price',
        name: 'unitPrice',
        type: 'number',
        default: 0,
        description: 'Unit price',
      },
    ],
  },

  // ----------------------------------
  //         Create Fulfillment
  // ----------------------------------
  {
    displayName: 'Fulfillment Items',
    name: 'fulfillmentItems',
    placeholder: 'Add Item',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    default: {},
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['createFulfillment'],
      },
    },
    options: [
      {
        name: 'items',
        displayName: 'Items',
        values: [
          {
            displayName: 'Row ID',
            name: 'rowId',
            type: 'number',
            default: 0,
            description: 'Sales order row ID',
          },
          {
            displayName: 'Quantity',
            name: 'quantity',
            type: 'number',
            default: 1,
            description: 'Quantity to fulfill',
          },
        ],
      },
    ],
    description: 'Items to fulfill',
  },
  {
    displayName: 'Fulfillment Additional Fields',
    name: 'fulfillmentAdditionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['salesOrder'],
        operation: ['createFulfillment'],
      },
    },
    options: [
      {
        displayName: 'Carrier',
        name: 'carrier',
        type: 'string',
        default: '',
        description: 'Shipping carrier',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Fulfillment notes',
      },
      {
        displayName: 'Shipped Date',
        name: 'shippedDate',
        type: 'dateTime',
        default: '',
        description: 'Date shipped',
      },
      {
        displayName: 'Tracking Number',
        name: 'trackingNumber',
        type: 'string',
        default: '',
        description: 'Tracking number',
      },
    ],
  },
];

export async function executeSalesOrder(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      responseData = await katanaApiRequest.call(this, 'GET', `/sales_orders/${salesOrderId}`);
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
      
      const query: IDataObject = {};
      
      if (filters.customerId) query.customer_id = filters.customerId;
      if (filters.status) query.status = filters.status;
      if (filters.source) query.source = filters.source;
      if (filters.invoicingStatus) query.invoicing_status = filters.invoicingStatus;
      if (filters.createdAfter) query['created_at[gte]'] = filters.createdAfter;
      if (filters.createdBefore) query['created_at[lte]'] = filters.createdBefore;
      if (filters.updatedAfter) query['updated_at[gte]'] = filters.updatedAfter;

      if (returnAll) {
        responseData = await katanaApiRequestAllItems.call(this, 'GET', '/sales_orders', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        query.limit = limit;
        const response = await katanaApiRequest.call(this, 'GET', '/sales_orders', {}, query);
        responseData = response.data || response;
      }
      break;
    }

    case 'create': {
      const customerId = this.getNodeParameter('customerId', i) as number;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        customer_id: customerId,
      };

      if (additionalFields.orderNo) body.order_no = additionalFields.orderNo;
      if (additionalFields.orderCreatedDate) body.order_created_date = additionalFields.orderCreatedDate;
      if (additionalFields.deliveryDate) body.delivery_date = additionalFields.deliveryDate;
      if (additionalFields.locationId) body.location_id = additionalFields.locationId;
      if (additionalFields.additionalInfo) body.additional_info = additionalFields.additionalInfo;

      const shippingAddress = buildAddressObject(additionalFields, 'shipping');
      if (shippingAddress) body.shipping_address = shippingAddress;

      responseData = await katanaApiRequest.call(this, 'POST', '/sales_orders', removeEmptyValues(body));
      break;
    }

    case 'update': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.customerId) body.customer_id = updateFields.customerId;
      if (updateFields.status) body.status = updateFields.status;
      if (updateFields.deliveryDate) body.delivery_date = updateFields.deliveryDate;
      if (updateFields.locationId) body.location_id = updateFields.locationId;
      if (updateFields.pickedDate) body.picked_date = updateFields.pickedDate;
      if (updateFields.additionalInfo) body.additional_info = updateFields.additionalInfo;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/sales_orders/${salesOrderId}`, removeEmptyValues(body));
      break;
    }

    case 'delete': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      responseData = await katanaApiRequest.call(this, 'DELETE', `/sales_orders/${salesOrderId}`);
      break;
    }

    case 'getRows': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/sales_orders/${salesOrderId}/rows`);
      break;
    }

    case 'addRow': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      const variantId = this.getNodeParameter('variantId', i) as number;
      const quantity = this.getNodeParameter('quantity', i) as number;
      const additionalFields = this.getNodeParameter('rowAdditionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        variant_id: variantId,
        quantity: formatNumericForApi(quantity),
      };

      if (additionalFields.unitPrice) body.unit_price = formatNumericForApi(additionalFields.unitPrice as number);
      if (additionalFields.discount) body.discount = formatNumericForApi(additionalFields.discount as number);
      if (additionalFields.taxRateId) body.tax_rate_id = additionalFields.taxRateId;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', `/sales_orders/${salesOrderId}/rows`, removeEmptyValues(body));
      break;
    }

    case 'updateRow': {
      const rowId = this.getNodeParameter('rowId', i) as number;
      const updateFields = this.getNodeParameter('rowUpdateFields', i, {}) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.quantity) body.quantity = formatNumericForApi(updateFields.quantity as number);
      if (updateFields.unitPrice) body.unit_price = formatNumericForApi(updateFields.unitPrice as number);
      if (updateFields.discount) body.discount = formatNumericForApi(updateFields.discount as number);
      if (updateFields.taxRateId) body.tax_rate_id = updateFields.taxRateId;
      if (updateFields.notes) body.notes = updateFields.notes;

      responseData = await katanaApiRequest.call(this, 'PATCH', `/sales_order_rows/${rowId}`, removeEmptyValues(body));
      break;
    }

    case 'deleteRow': {
      const rowId = this.getNodeParameter('rowId', i) as number;
      responseData = await katanaApiRequest.call(this, 'DELETE', `/sales_order_rows/${rowId}`);
      break;
    }

    case 'getFulfillments': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      responseData = await katanaApiRequestAllItems.call(this, 'GET', `/sales_orders/${salesOrderId}/fulfillments`);
      break;
    }

    case 'createFulfillment': {
      const salesOrderId = this.getNodeParameter('salesOrderId', i) as number;
      const fulfillmentItems = this.getNodeParameter('fulfillmentItems', i, {}) as IDataObject;
      const additionalFields = this.getNodeParameter('fulfillmentAdditionalFields', i, {}) as IDataObject;

      const body: IDataObject = {
        sales_order_id: salesOrderId,
      };

      if (fulfillmentItems.items && Array.isArray(fulfillmentItems.items)) {
        body.rows = (fulfillmentItems.items as IDataObject[]).map((item) => ({
          sales_order_row_id: item.rowId,
          quantity: formatNumericForApi(item.quantity as number),
        }));
      }

      if (additionalFields.carrier) body.carrier = additionalFields.carrier;
      if (additionalFields.trackingNumber) body.tracking_number = additionalFields.trackingNumber;
      if (additionalFields.shippedDate) body.shipped_date = additionalFields.shippedDate;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      responseData = await katanaApiRequest.call(this, 'POST', '/fulfillments', removeEmptyValues(body));
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return responseData;
}
