/**
 * Katana MRP Trigger Node for n8n
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	IPollFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import { katanaApiRequestAllItems } from './transport/katanaApi';
import { logLicensingNotice } from './utils/helpers';

// Log licensing notice once on module load
logLicensingNotice();

export class KatanaMrpTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Katana MRP Trigger',
		name: 'katanaMrpTrigger',
		icon: 'file:katana.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts a workflow when Katana MRP events occur',
		defaults: {
			name: 'Katana MRP Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'katanaMrpApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Trigger Mode',
				name: 'triggerMode',
				type: 'options',
				options: [
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Receive events via webhook (requires webhook setup in Katana)',
					},
					{
						name: 'Polling',
						value: 'polling',
						description: 'Poll for changes (useful when webhooks cannot be configured)',
					},
				],
				default: 'webhook',
				description: 'How to receive events from Katana',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						triggerMode: ['webhook'],
					},
				},
				options: [
					{
						name: 'Inventory Adjusted',
						value: 'inventory.adjusted',
						description: 'When inventory is adjusted',
					},
					{
						name: 'Manufacturing Order Created',
						value: 'manufacturing_order.created',
						description: 'When a manufacturing order is created',
					},
					{
						name: 'Manufacturing Order Status Changed',
						value: 'manufacturing_order.status_changed',
						description: 'When a manufacturing order status changes',
					},
					{
						name: 'Manufacturing Order Updated',
						value: 'manufacturing_order.updated',
						description: 'When a manufacturing order is updated',
					},
					{
						name: 'Product Created',
						value: 'product.created',
						description: 'When a product is created',
					},
					{
						name: 'Product Updated',
						value: 'product.updated',
						description: 'When a product is updated',
					},
					{
						name: 'Purchase Order Created',
						value: 'purchase_order.created',
						description: 'When a purchase order is created',
					},
					{
						name: 'Purchase Order Received',
						value: 'purchase_order.received',
						description: 'When a purchase order is received',
					},
					{
						name: 'Purchase Order Updated',
						value: 'purchase_order.updated',
						description: 'When a purchase order is updated',
					},
					{
						name: 'Sales Order Created',
						value: 'sales_order.created',
						description: 'When a sales order is created',
					},
					{
						name: 'Sales Order Deleted',
						value: 'sales_order.deleted',
						description: 'When a sales order is deleted',
					},
					{
						name: 'Sales Order Updated',
						value: 'sales_order.updated',
						description: 'When a sales order is updated',
					},
					{
						name: 'Stock Transfer Completed',
						value: 'stock_transfer.completed',
						description: 'When a stock transfer is completed',
					},
				],
				default: 'sales_order.created',
				description: 'The event to listen for',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				displayOptions: {
					show: {
						triggerMode: ['polling'],
					},
				},
				options: [
					{
						name: 'Customer',
						value: 'customers',
					},
					{
						name: 'Manufacturing Order',
						value: 'manufacturing_orders',
					},
					{
						name: 'Product',
						value: 'products',
					},
					{
						name: 'Purchase Order',
						value: 'purchase_orders',
					},
					{
						name: 'Sales Order',
						value: 'sales_orders',
					},
					{
						name: 'Stock Transfer',
						value: 'stock_transfers',
					},
					{
						name: 'Supplier',
						value: 'suppliers',
					},
				],
				default: 'sales_orders',
				description: 'The resource to poll for changes',
			},
			{
				displayName: 'Poll Interval',
				name: 'pollInterval',
				type: 'number',
				displayOptions: {
					show: {
						triggerMode: ['polling'],
					},
				},
				default: 5,
				description: 'How often to poll (in minutes)',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						triggerMode: ['polling'],
					},
				},
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'string',
						default: '',
						description: 'Filter by status (e.g., NOT_SHIPPED, IN_PROGRESS)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Katana webhooks are configured manually in the Katana UI
				// We just return true as we can't programmatically check
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Katana webhooks are configured manually in Katana Settings → Webhooks
				// Log the webhook URL for the user to configure
				const webhookUrl = this.getNodeWebhookUrl('default');
				console.log(`Configure this webhook URL in Katana Settings → Webhooks: ${webhookUrl}`);
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Katana webhooks are deleted manually in the Katana UI
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const event = this.getNodeParameter('event', '') as string;

		// Verify the event matches what we're listening for
		if (body.event && body.event !== event) {
			return {
				workflowData: [],
			};
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray(body),
			],
		};
	}

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const triggerMode = this.getNodeParameter('triggerMode', 0) as string;

		if (triggerMode !== 'polling') {
			return null;
		}

		const resource = this.getNodeParameter('resource', 0) as string;
		const filters = this.getNodeParameter('filters', 0, {}) as IDataObject;

		// Get the last poll time from workflow static data
		const workflowStaticData = this.getWorkflowStaticData('node');
		const lastPollTime = workflowStaticData.lastPollTime as string | undefined;
		const now = new Date().toISOString();

		const query: IDataObject = {
			limit: 100,
		};

		// Only get records updated since last poll
		if (lastPollTime) {
			query['updated_at[gte]'] = lastPollTime;
		}

		// Apply additional filters
		if (filters.status) {
			query.status = filters.status;
		}

		try {
			const response = await katanaApiRequestAllItems.call(
				this,
				'GET',
				`/${resource}`,
				{},
				query,
			);

			// Update the last poll time
			workflowStaticData.lastPollTime = now;

			if (!response || response.length === 0) {
				return null;
			}

			// Filter out records that haven't actually changed since last poll
			const newRecords = lastPollTime
				? response.filter((record: IDataObject) => {
						const updatedAt = record.updated_at as string;
						return updatedAt && new Date(updatedAt) > new Date(lastPollTime);
					})
				: response;

			if (newRecords.length === 0) {
				return null;
			}

			return [this.helpers.returnJsonArray(newRecords)];
		} catch (error) {
			// On first run or error, just save the current time
			workflowStaticData.lastPollTime = now;
			throw error;
		}
	}
}
