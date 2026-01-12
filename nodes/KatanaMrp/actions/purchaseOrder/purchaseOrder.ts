/**
 * Katana MRP - Purchase Order Resource
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { katanaApiRequest, katanaApiRequestAllItems } from '../../transport/katanaApi';
import { formatNumericForApi } from '../../utils/helpers';

export const purchaseOrderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
			},
		},
		options: [
			{
				name: 'Add Row',
				value: 'addRow',
				description: 'Add a line item to a purchase order',
				action: 'Add a line item to a purchase order',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a purchase order',
				action: 'Cancel a purchase order',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new purchase order',
				action: 'Create a purchase order',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a purchase order',
				action: 'Delete a purchase order',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a purchase order by ID',
				action: 'Get a purchase order',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many purchase orders',
				action: 'Get many purchase orders',
			},
			{
				name: 'Get Rows',
				value: 'getRows',
				description: 'Get line items for a purchase order',
				action: 'Get purchase order line items',
			},
			{
				name: 'Receive',
				value: 'receive',
				description: 'Receive items from a purchase order',
				action: 'Receive items from a purchase order',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a purchase order',
				action: 'Update a purchase order',
			},
		],
		default: 'get',
	},
];

export const purchaseOrderFields: INodeProperties[] = [
	// ----------------------------------
	//         purchaseOrder: get
	// ----------------------------------
	{
		displayName: 'Purchase Order ID',
		name: 'purchaseOrderId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['get', 'update', 'delete', 'getRows', 'addRow', 'receive', 'cancel'],
			},
		},
		description: 'The ID of the purchase order',
	},

	// ----------------------------------
	//         purchaseOrder: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
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
				resource: ['purchaseOrder'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_at_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter purchase orders created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'created_at_lte',
				type: 'dateTime',
				default: '',
				description: 'Filter purchase orders created before this date',
			},
			{
				displayName: 'Expected After',
				name: 'expected_arrival_date_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter by expected arrival date after',
			},
			{
				displayName: 'Expected Before',
				name: 'expected_arrival_date_lte',
				type: 'dateTime',
				default: '',
				description: 'Filter by expected arrival date before',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: 0,
				description: 'Filter by receiving location ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'CANCELLED' },
					{ name: 'Partially Received', value: 'PARTIALLY_RECEIVED' },
					{ name: 'Pending', value: 'PENDING' },
					{ name: 'Received', value: 'RECEIVED' },
				],
				default: '',
				description: 'Filter by purchase order status',
			},
			{
				displayName: 'Supplier ID',
				name: 'supplier_id',
				type: 'number',
				default: 0,
				description: 'Filter by supplier ID',
			},
			{
				displayName: 'Updated After',
				name: 'updated_at_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter purchase orders updated after this date',
			},
		],
	},

	// ----------------------------------
	//         purchaseOrder: create
	// ----------------------------------
	{
		displayName: 'Supplier ID',
		name: 'supplierId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
		description: 'The ID of the supplier',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Currency code (e.g., USD, EUR)',
			},
			{
				displayName: 'Expected Arrival Date',
				name: 'expected_arrival_date',
				type: 'dateTime',
				default: '',
				description: 'Expected arrival date for the order',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: 0,
				description: 'Receiving location ID',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the purchase order',
			},
			{
				displayName: 'PO Number',
				name: 'po_no',
				type: 'string',
				default: '',
				description: 'Custom purchase order number',
			},
			{
				displayName: 'Rows',
				name: 'rows',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Line Items',
						name: 'items',
						values: [
							{
								displayName: 'Variant ID',
								name: 'variant_id',
								type: 'number',
								default: 0,
								description: 'The variant/material ID',
							},
							{
								displayName: 'Quantity',
								name: 'quantity',
								type: 'number',
								default: 1,
								description: 'Quantity to order',
							},
							{
								displayName: 'Unit Price',
								name: 'unit_price',
								type: 'number',
								default: 0,
								description: 'Unit price for the item',
							},
							{
								displayName: 'Notes',
								name: 'notes',
								type: 'string',
								default: '',
								description: 'Notes for this line item',
							},
						],
					},
				],
				description: 'Line items for the purchase order',
			},
		],
	},

	// ----------------------------------
	//         purchaseOrder: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'Currency code',
			},
			{
				displayName: 'Expected Arrival Date',
				name: 'expected_arrival_date',
				type: 'dateTime',
				default: '',
				description: 'Expected arrival date',
			},
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: 0,
				description: 'Receiving location ID',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the purchase order',
			},
			{
				displayName: 'PO Number',
				name: 'po_no',
				type: 'string',
				default: '',
				description: 'Purchase order number',
			},
			{
				displayName: 'Supplier ID',
				name: 'supplier_id',
				type: 'number',
				default: 0,
				description: 'Supplier ID',
			},
		],
	},

	// ----------------------------------
	//         purchaseOrder: addRow
	// ----------------------------------
	{
		displayName: 'Variant ID',
		name: 'variantId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['addRow'],
			},
		},
		description: 'The variant/material ID to add',
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		required: true,
		default: 1,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['addRow'],
			},
		},
		description: 'Quantity to order',
	},
	{
		displayName: 'Row Options',
		name: 'rowOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['addRow'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for this line item',
			},
			{
				displayName: 'Unit Price',
				name: 'unit_price',
				type: 'number',
				default: 0,
				description: 'Unit price for the item',
			},
		],
	},

	// ----------------------------------
	//         purchaseOrder: receive
	// ----------------------------------
	{
		displayName: 'Receive Items',
		name: 'receiveItems',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['receive'],
			},
		},
		options: [
			{
				displayName: 'Items',
				name: 'items',
				values: [
					{
						displayName: 'Row ID',
						name: 'row_id',
						type: 'number',
						default: 0,
						description: 'The purchase order row ID',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						description: 'Quantity received',
					},
					{
						displayName: 'Batch Number',
						name: 'batch_number',
						type: 'string',
						default: '',
						description: 'Batch/lot number for received items',
					},
					{
						displayName: 'Expiry Date',
						name: 'expiry_date',
						type: 'dateTime',
						default: '',
						description: 'Expiry date for received items',
					},
				],
			},
		],
		description: 'Items to receive from the purchase order',
	},
	{
		displayName: 'Receive Options',
		name: 'receiveOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['receive'],
			},
		},
		options: [
			{
				displayName: 'Location ID',
				name: 'location_id',
				type: 'number',
				default: 0,
				description: 'Location to receive items into',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for the receipt',
			},
			{
				displayName: 'Received Date',
				name: 'received_date',
				type: 'dateTime',
				default: '',
				description: 'Date items were received',
			},
		],
	},
];

export async function executePurchaseOrderOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === 'get') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		responseData = await katanaApiRequest.call(this, 'GET', `/purchase_orders/${purchaseOrderId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = {};

		if (filters.supplier_id) query.supplier_id = filters.supplier_id;
		if (filters.location_id) query.location_id = filters.location_id;
		if (filters.status) query.status = filters.status;
		if (filters.created_at_gte) query['created_at[gte]'] = filters.created_at_gte;
		if (filters.created_at_lte) query['created_at[lte]'] = filters.created_at_lte;
		if (filters.updated_at_gte) query['updated_at[gte]'] = filters.updated_at_gte;
		if (filters.expected_arrival_date_gte) query['expected_arrival_date[gte]'] = filters.expected_arrival_date_gte;
		if (filters.expected_arrival_date_lte) query['expected_arrival_date[lte]'] = filters.expected_arrival_date_lte;

		if (returnAll) {
			responseData = await katanaApiRequestAllItems.call(this, 'GET', '/purchase_orders', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;
			const response = await katanaApiRequest.call(this, 'GET', '/purchase_orders', {}, query);
			responseData = response.data || response;
		}
	}

	if (operation === 'create') {
		const supplierId = this.getNodeParameter('supplierId', i) as number;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			supplier_id: supplierId,
		};

		if (additionalFields.po_no) body.po_no = additionalFields.po_no;
		if (additionalFields.currency) body.currency = additionalFields.currency;
		if (additionalFields.expected_arrival_date) body.expected_arrival_date = additionalFields.expected_arrival_date;
		if (additionalFields.location_id) body.location_id = additionalFields.location_id;
		if (additionalFields.notes) body.notes = additionalFields.notes;

		if (additionalFields.rows) {
			const rowsData = additionalFields.rows as IDataObject;
			if (rowsData.items && Array.isArray(rowsData.items)) {
				body.rows = (rowsData.items as IDataObject[]).map((item) => ({
					variant_id: item.variant_id,
					quantity: formatNumericForApi(item.quantity as number),
					unit_price: item.unit_price ? formatNumericForApi(item.unit_price as number) : undefined,
					notes: item.notes || undefined,
				}));
			}
		}

		responseData = await katanaApiRequest.call(this, 'POST', '/purchase_orders', body);
	}

	if (operation === 'update') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.po_no) body.po_no = updateFields.po_no;
		if (updateFields.supplier_id) body.supplier_id = updateFields.supplier_id;
		if (updateFields.currency) body.currency = updateFields.currency;
		if (updateFields.expected_arrival_date) body.expected_arrival_date = updateFields.expected_arrival_date;
		if (updateFields.location_id) body.location_id = updateFields.location_id;
		if (updateFields.notes) body.notes = updateFields.notes;

		responseData = await katanaApiRequest.call(this, 'PATCH', `/purchase_orders/${purchaseOrderId}`, body);
	}

	if (operation === 'delete') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		responseData = await katanaApiRequest.call(this, 'DELETE', `/purchase_orders/${purchaseOrderId}`);
	}

	if (operation === 'getRows') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		responseData = await katanaApiRequestAllItems.call(this, 'GET', `/purchase_orders/${purchaseOrderId}/rows`);
	}

	if (operation === 'addRow') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		const variantId = this.getNodeParameter('variantId', i) as number;
		const quantity = this.getNodeParameter('quantity', i) as number;
		const rowOptions = this.getNodeParameter('rowOptions', i, {}) as IDataObject;

		const body: IDataObject = {
			variant_id: variantId,
			quantity: formatNumericForApi(quantity),
		};

		if (rowOptions.unit_price) body.unit_price = formatNumericForApi(rowOptions.unit_price as number);
		if (rowOptions.notes) body.notes = rowOptions.notes;

		responseData = await katanaApiRequest.call(this, 'POST', `/purchase_orders/${purchaseOrderId}/rows`, body);
	}

	if (operation === 'receive') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		const receiveItems = this.getNodeParameter('receiveItems', i) as IDataObject;
		const receiveOptions = this.getNodeParameter('receiveOptions', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (receiveItems.items && Array.isArray(receiveItems.items)) {
			body.items = (receiveItems.items as IDataObject[]).map((item) => {
				const receiveItem: IDataObject = {
					row_id: item.row_id,
					quantity: formatNumericForApi(item.quantity as number),
				};
				if (item.batch_number) receiveItem.batch_number = item.batch_number;
				if (item.expiry_date) receiveItem.expiry_date = item.expiry_date;
				return receiveItem;
			});
		}

		if (receiveOptions.location_id) body.location_id = receiveOptions.location_id;
		if (receiveOptions.received_date) body.received_date = receiveOptions.received_date;
		if (receiveOptions.notes) body.notes = receiveOptions.notes;

		responseData = await katanaApiRequest.call(this, 'POST', `/purchase_orders/${purchaseOrderId}/receive`, body);
	}

	if (operation === 'cancel') {
		const purchaseOrderId = this.getNodeParameter('purchaseOrderId', i) as number;
		responseData = await katanaApiRequest.call(this, 'POST', `/purchase_orders/${purchaseOrderId}/cancel`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
