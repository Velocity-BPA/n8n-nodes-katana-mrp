/**
 * Katana MRP - Customer Resource
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

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new customer',
				action: 'Create a customer',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a customer',
				action: 'Delete a customer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a customer by ID',
				action: 'Get a customer',
			},
			{
				name: 'Get Addresses',
				value: 'getAddresses',
				description: 'Get addresses for a customer',
				action: 'Get customer addresses',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many customers',
				action: 'Get many customers',
			},
			{
				name: 'Get Orders',
				value: 'getOrders',
				description: 'Get sales orders for a customer',
				action: 'Get customer orders',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a customer',
				action: 'Update a customer',
			},
		],
		default: 'get',
	},
];

export const customerFields: INodeProperties[] = [
	// ----------------------------------
	//         customer: get
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get', 'update', 'delete', 'getOrders', 'getAddresses'],
			},
		},
		description: 'The ID of the customer',
	},

	// ----------------------------------
	//         customer: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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
				resource: ['customer'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to include archived customers',
			},
			{
				displayName: 'Created After',
				name: 'created_at_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter customers created after this date',
			},
			{
				displayName: 'Created Before',
				name: 'created_at_lte',
				type: 'dateTime',
				default: '',
				description: 'Filter customers created before this date',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search by customer name, code, or email',
			},
			{
				displayName: 'Updated After',
				name: 'updated_at_gte',
				type: 'dateTime',
				default: '',
				description: 'Filter customers updated after this date',
			},
		],
	},

	// ----------------------------------
	//         customer: create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		description: 'Customer name',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Billing Address',
				name: 'billingAddress',
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
				description: 'Billing address for the customer',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Customer code',
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
				description: 'Customer email address',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Customer notes',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Customer phone number',
			},
			{
				displayName: 'Shipping Address',
				name: 'shippingAddress',
				type: 'fixedCollection',
				default: {},
				options: [
					{
						displayName: 'Address',
						name: 'address',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Shipping address name/label',
							},
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
				description: 'Default shipping address for the customer',
			},
			{
				displayName: 'Tax Rate ID',
				name: 'tax_rate_id',
				type: 'number',
				default: 0,
				description: 'Default tax rate ID',
			},
		],
	},

	// ----------------------------------
	//         customer: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				default: false,
				description: 'Whether to archive the customer',
			},
			{
				displayName: 'Billing Address',
				name: 'billingAddress',
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
				description: 'Billing address',
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Customer code',
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
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Customer name',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Customer notes',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
			{
				displayName: 'Tax Rate ID',
				name: 'tax_rate_id',
				type: 'number',
				default: 0,
				description: 'Tax rate ID',
			},
		],
	},

	// ----------------------------------
	//         customer: getOrders
	// ----------------------------------
	{
		displayName: 'Order Filters',
		name: 'orderFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['getOrders'],
			},
		},
		options: [
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all orders',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of orders to return',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Cancelled', value: 'CANCELLED' },
					{ name: 'Not Shipped', value: 'NOT_SHIPPED' },
					{ name: 'Partially Shipped', value: 'PARTIALLY_SHIPPED' },
					{ name: 'Shipped', value: 'SHIPPED' },
				],
				default: '',
				description: 'Filter by order status',
			},
		],
	},
];

export async function executeCustomerOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === 'get') {
		const customerId = this.getNodeParameter('customerId', i) as number;
		responseData = await katanaApiRequest.call(this, 'GET', `/customers/${customerId}`);
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
			responseData = await katanaApiRequestAllItems.call(this, 'GET', '/customers', {}, query);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			query.limit = limit;
			const response = await katanaApiRequest.call(this, 'GET', '/customers', {}, query);
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
		if (additionalFields.tax_rate_id) body.tax_rate_id = additionalFields.tax_rate_id;
		if (additionalFields.notes) body.notes = additionalFields.notes;

		if (additionalFields.billingAddress) {
			const billingData = additionalFields.billingAddress as IDataObject;
			if (billingData.address) {
				body.billing_address = buildAddressObject(billingData.address as IDataObject);
			}
		}

		if (additionalFields.shippingAddress) {
			const shippingData = additionalFields.shippingAddress as IDataObject;
			if (shippingData.address) {
				body.shipping_addresses = [buildAddressObject(shippingData.address as IDataObject)];
			}
		}

		responseData = await katanaApiRequest.call(this, 'POST', '/customers', body);
	}

	if (operation === 'update') {
		const customerId = this.getNodeParameter('customerId', i) as number;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.code) body.code = updateFields.code;
		if (updateFields.email) body.email = updateFields.email;
		if (updateFields.phone) body.phone = updateFields.phone;
		if (updateFields.currency) body.currency = updateFields.currency;
		if (updateFields.tax_rate_id) body.tax_rate_id = updateFields.tax_rate_id;
		if (updateFields.notes) body.notes = updateFields.notes;
		if (updateFields.archived !== undefined) body.archived = updateFields.archived;

		if (updateFields.billingAddress) {
			const billingData = updateFields.billingAddress as IDataObject;
			if (billingData.address) {
				body.billing_address = buildAddressObject(billingData.address as IDataObject);
			}
		}

		responseData = await katanaApiRequest.call(this, 'PATCH', `/customers/${customerId}`, body);
	}

	if (operation === 'delete') {
		const customerId = this.getNodeParameter('customerId', i) as number;
		responseData = await katanaApiRequest.call(this, 'DELETE', `/customers/${customerId}`);
	}

	if (operation === 'getOrders') {
		const customerId = this.getNodeParameter('customerId', i) as number;
		const orderFilters = this.getNodeParameter('orderFilters', i, {}) as IDataObject;

		const query: IDataObject = {
			customer_id: customerId,
		};

		if (orderFilters.status) query.status = orderFilters.status;

		if (orderFilters.returnAll) {
			responseData = await katanaApiRequestAllItems.call(this, 'GET', '/sales_orders', {}, query);
		} else {
			const limit = (orderFilters.limit as number) || 50;
			query.limit = limit;
			const response = await katanaApiRequest.call(this, 'GET', '/sales_orders', {}, query);
			responseData = response.data || response;
		}
	}

	if (operation === 'getAddresses') {
		const customerId = this.getNodeParameter('customerId', i) as number;
		responseData = await katanaApiRequest.call(this, 'GET', `/customers/${customerId}/addresses`);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
