/**
 * Katana MRP Node for n8n
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { logLicensingNotice } from './utils/helpers';

// Import operations and fields from all resources
import {
	salesOrderOperations,
	salesOrderFields,
	executeSalesOrder,
} from './actions/salesOrder';

import {
	manufacturingOrderOperations,
	manufacturingOrderFields,
	executeManufacturingOrder,
} from './actions/manufacturingOrder';

import {
	productOperations,
	productFields,
	executeProduct,
} from './actions/product';

import {
	materialOperations,
	materialFields,
	executeMaterial,
} from './actions/material';

import {
	variantOperations,
	variantFields,
	executeVariant,
} from './actions/variant';

import {
	inventoryOperations,
	inventoryFields,
	executeInventory,
} from './actions/inventory';

import {
	stockAdjustmentOperations,
	stockAdjustmentFields,
	executeStockAdjustment,
} from './actions/stockAdjustment';

import {
	stockTransferOperations,
	stockTransferFields,
	executeStockTransfer,
} from './actions/stockTransfer';

import {
	purchaseOrderOperations,
	purchaseOrderFields,
	executePurchaseOrderOperation,
} from './actions/purchaseOrder';

import {
	customerOperations,
	customerFields,
	executeCustomerOperation,
} from './actions/customer';

import {
	supplierOperations,
	supplierFields,
	executeSupplierOperation,
} from './actions/supplier';

import {
	recipeOperations,
	recipeFields,
	executeRecipeOperation,
} from './actions/recipe';

// Log licensing notice once on module load
logLicensingNotice();

export class KatanaMrp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Katana MRP',
		name: 'katanaMrp',
		icon: 'file:katana.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Katana Cloud Manufacturing API for D2C manufacturing ERP automation',
		defaults: {
			name: 'Katana MRP',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'katanaMrpApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Customer',
						value: 'customer',
						description: 'Manage customers',
					},
					{
						name: 'Inventory',
						value: 'inventory',
						description: 'Track inventory levels and adjustments',
					},
					{
						name: 'Manufacturing Order',
						value: 'manufacturingOrder',
						description: 'Manage manufacturing orders and production',
					},
					{
						name: 'Material',
						value: 'material',
						description: 'Manage raw materials',
					},
					{
						name: 'Product',
						value: 'product',
						description: 'Manage products',
					},
					{
						name: 'Purchase Order',
						value: 'purchaseOrder',
						description: 'Manage purchase orders',
					},
					{
						name: 'Recipe',
						value: 'recipe',
						description: 'Manage bills of materials (recipes)',
					},
					{
						name: 'Sales Order',
						value: 'salesOrder',
						description: 'Manage sales orders and fulfillments',
					},
					{
						name: 'Stock Adjustment',
						value: 'stockAdjustment',
						description: 'Create and view inventory adjustments',
					},
					{
						name: 'Stock Transfer',
						value: 'stockTransfer',
						description: 'Transfer inventory between locations',
					},
					{
						name: 'Supplier',
						value: 'supplier',
						description: 'Manage suppliers',
					},
					{
						name: 'Variant',
						value: 'variant',
						description: 'Manage product variants',
					},
				],
				default: 'salesOrder',
			},
			// Sales Order
			...salesOrderOperations,
			...salesOrderFields,
			// Manufacturing Order
			...manufacturingOrderOperations,
			...manufacturingOrderFields,
			// Product
			...productOperations,
			...productFields,
			// Material
			...materialOperations,
			...materialFields,
			// Variant
			...variantOperations,
			...variantFields,
			// Inventory
			...inventoryOperations,
			...inventoryFields,
			// Stock Adjustment
			...stockAdjustmentOperations,
			...stockAdjustmentFields,
			// Stock Transfer
			...stockTransferOperations,
			...stockTransferFields,
			// Purchase Order
			...purchaseOrderOperations,
			...purchaseOrderFields,
			// Customer
			...customerOperations,
			...customerFields,
			// Supplier
			...supplierOperations,
			...supplierFields,
			// Recipe
			...recipeOperations,
			...recipeFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				switch (resource) {
					case 'salesOrder':
						responseData = await executeSalesOrder.call(this, operation, i);
						break;
					case 'manufacturingOrder':
						responseData = await executeManufacturingOrder.call(this, operation, i);
						break;
					case 'product':
						responseData = await executeProduct.call(this, operation, i);
						break;
					case 'material':
						responseData = await executeMaterial.call(this, operation, i);
						break;
					case 'variant':
						responseData = await executeVariant.call(this, operation, i);
						break;
					case 'inventory':
						responseData = await executeInventory.call(this, operation, i);
						break;
					case 'stockAdjustment':
						responseData = await executeStockAdjustment.call(this, operation, i);
						break;
					case 'stockTransfer':
						responseData = await executeStockTransfer.call(this, operation, i);
						break;
					case 'purchaseOrder':
						responseData = await executePurchaseOrderOperation.call(this, operation, i);
						break;
					case 'customer':
						responseData = await executeCustomerOperation.call(this, operation, i);
						break;
					case 'supplier':
						responseData = await executeSupplierOperation.call(this, operation, i);
						break;
					case 'recipe':
						responseData = await executeRecipeOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				// Convert response data to INodeExecutionData format
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
