/**
 * Katana MRP - Supplier Resource
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
import { buildAddressObject } from '../../utils/helpers';

export const supplierOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['supplier'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new supplier',
				action: 'Create a supplier',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a supplier',
				action: 'Delete a supplier',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a supplier by ID',
				action: 'Get a supplier',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many suppliers',
				action: 'Get many suppliers',
			},
			{
				name: 'Get Products',
				value: 'getProducts',
				description: 'Get products/materials from a supplier',
				action: 'Get supplier products',
			},
			{
				name: 'Get Purchase Orders',
				value: 'getPurchaseOrders',
				description: 'Get purchase orders for a supplier',
				action: 'Get supplier purchase orders',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a supplier',
				action: 'Update a supplier',
			},
		],
		default: 'get',
	},
];

export const supplierFields: INodeProperties[] = [
	// ----------------------------------
	//         supplier: get
	// ----------------------------------
	{
		displayName: 'Supplier ID',
		name: 'supplierId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['get', 'update', 'delete', 'getPurchaseOrders', 'getProducts'],
			},
		},
		description: 'The ID of the supplier',
	},

	// ----------------------------------
	//         supplier: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['supplier'],
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
				resource: ['supplier'],
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
				resource: ['supplier'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to include archived suppliers',
			},
			{
				displayName: 'Created After',
				name: 'created_at_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter suppliers created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'created_at_lte',
				type: 'dateTime',
				default: '',
				description: 'Filter suppliers created before this date',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search by supplier name, code, or email',
			},
			{
				displayName: 'Updated After',
				name: 'updated_at_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter suppliers updated after this date',
			},
		],
	},

	// ----------------------------------
	//         supplier: create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['create'],
			},
		},
		description: 'Supplier name',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'supplierAddress',
				type: 'fixedCollection',
				default: {},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Line 1',
								name: 'line1',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Line 2',
								name: 'line2',
								type: 'string',
								default: '',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
							},
							{
								displayName: 'State/Region',
								name: 'state',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Postal Code',
								name: 'postal_code',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
							},
						],
					},
				],
				description: 'Supplier address',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Supplier code',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Default currency code',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Supplier email address',
			},
			{
				displayName: 'Lead Time (Days)',
				name: 'lead_time',
				type: 'number',
				default: 0,
				description: 'Default lead time in days',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Supplier notes',
			},
			{
				displayName: 'Payment Terms ID',
				name: 'payment_terms_id',
				type: 'number',
				default: 0,
				description: 'Default payment terms ID',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Supplier phone number',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Supplier website URL',
			},
		],
	},

	// ----------------------------------
	//         supplier: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'supplierAddress',
				type: 'fixedCollection',
				default: {},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Line 1',
								name: 'line1',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Line 2',
								name: 'line2',
								type: 'string',
								default: '',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
							},
							{
								displayName: 'State/Region',
								name: 'state',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Postal Code',
								name: 'postal_code',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
							},
						],
					},
				],
				description: 'Supplier address',
			},
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to archive the supplier',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Supplier code',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				description: 'Default currency',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'Lead Time (Days)',
				name: 'lead_time',
				type: 'number',
				default: 0,
				description: 'Lead time in days',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Supplier name',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Supplier notes',
			},
			{
				displayName: 'Payment Terms ID',
				name: 'payment_terms_id',
				type: 'number',
				default: 0,
				description: 'Payment terms ID',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Website URL',
			},
		],
	},

	// ----------------------------------
	//         supplier: getPurchaseOrders
	// ----------------------------------
	{
		displayName: 'Purchase Order Filters',
		name: 'poFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['getPurchaseOrders'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of purchase orders to return',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all purchase orders',
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
		],
	},

	// ----------------------------------
	//         supplier: getProducts
	// ----------------------------------
	{
		displayName: 'Product Filters',
		name: 'productFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['getProducts'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of products to return',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all products',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Material', value: 'material' },
					{ name: 'Product', value: 'product' },
				],
				default: '',
				description: 'Filter by product type',
			},
		],
	},
];

export async function executeSupplierOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === 'get') {
		const supplierId = this.getNodeParameter('supplierId', i) as number;
		responseData = await katanaApiRequest.call(this, 'GET', `/suppliers/${supplierId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

		const query: IDataObject = {};

		if (filters.search) query.search = filters.search;
		if (filters.archived !== undefined) query.archived = filters.archived;
		if (filters.created_at_gte) query['created_at[gte]'] = filters.created_at_gte;
		if (filters.created_at_lte) query['created_at[lte]'] = filters.created_at_lte;
		if (filters.updated_at_gte) query['updated_at[gte]'] = filters.updated_at_gte;

		if (returnAll) {
			responseData = await katanaApiRequestAllItems.call(this, 'GET', '/suppliers', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;
			const response = await katanaApiRequest.call(this, 'GET', '/suppliers', {}, query);
			responseData = response.data || response;
		}
	}

	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const body: IDataObject = {
			name,
		};

		if (additionalFields.code) body.code = additionalFields.code;
		if (additionalFields.email) body.email = additionalFields.email;
		if (additionalFields.phone) body.phone = additionalFields.phone;
		if (additionalFields.currency) body.currency = additionalFields.currency;
		if (additionalFields.payment_terms_id) body.payment_terms_id = additionalFields.payment_terms_id;
		if (additionalFields.lead_time) body.lead_time = additionalFields.lead_time;
		if (additionalFields.website) body.website = additionalFields.website;
		if (additionalFields.notes) body.notes = additionalFields.notes;

		if (additionalFields.supplierAddress) {
			const addressData = additionalFields.supplierAddress as IDataObject;
			if (addressData.address) {
				body.address = buildAddressObject(addressData.address as IDataObject);
			}
		}

		responseData = await katanaApiRequest.call(this, 'POST', '/suppliers', body);
	}

	if (operation === 'update') {
		const supplierId = this.getNodeParameter('supplierId', i) as number;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.code) body.code = updateFields.code;
		if (updateFields.email) body.email = updateFields.email;
		if (updateFields.phone) body.phone = updateFields.phone;
		if (updateFields.currency) body.currency = updateFields.currency;
		if (updateFields.payment_terms_id) body.payment_terms_id = updateFields.payment_terms_id;
		if (updateFields.lead_time) body.lead_time = updateFields.lead_time;
		if (updateFields.website) body.website = updateFields.website;
		if (updateFields.notes) body.notes = updateFields.notes;
		if (updateFields.archived !== undefined) body.archived = updateFields.archived;

		if (updateFields.supplierAddress) {
			const addressData = updateFields.supplierAddress as IDataObject;
			if (addressData.address) {
				body.address = buildAddressObject(addressData.address as IDataObject);
			}
		}

		responseData = await katanaApiRequest.call(this, 'PATCH', `/suppliers/${supplierId}`, body);
	}

	if (operation === 'delete') {
		const supplierId = this.getNodeParameter('supplierId', i) as number;
		responseData = await katanaApiRequest.call(this, 'DELETE', `/suppliers/${supplierId}`);
	}

	if (operation === 'getPurchaseOrders') {
		const supplierId = this.getNodeParameter('supplierId', i) as number;
		const poFilters = this.getNodeParameter('poFilters', i, {}) as IDataObject;

		const query: IDataObject = {
			supplier_id: supplierId,
		};

		if (poFilters.status) query.status = poFilters.status;

		if (poFilters.returnAll) {
			responseData = await katanaApiRequestAllItems.call(this, 'GET', '/purchase_orders', {}, query);
		} else {
			const limit = (poFilters.limit as number) || 50;
			query.limit = limit;
			const response = await katanaApiRequest.call(this, 'GET', '/purchase_orders', {}, query);
			responseData = response.data || response;
		}
	}

	if (operation === 'getProducts') {
		const supplierId = this.getNodeParameter('supplierId', i) as number;
		const productFilters = this.getNodeParameter('productFilters', i, {}) as IDataObject;

		const query: IDataObject = {
			default_supplier_id: supplierId,
		};

		if (productFilters.type) query.type = productFilters.type;

		if (productFilters.returnAll) {
			responseData = await katanaApiRequestAllItems.call(this, 'GET', '/products', {}, query);
		} else {
			const limit = (productFilters.limit as number) || 50;
			query.limit = limit;
			const response = await katanaApiRequest.call(this, 'GET', '/products', {}, query);
			responseData = response.data || response;
		}
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
