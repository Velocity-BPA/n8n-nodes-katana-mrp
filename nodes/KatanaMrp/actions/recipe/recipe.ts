/**
 * Katana MRP - Recipe (Bill of Materials) Resource
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

export const recipeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['recipe'],
			},
		},
		options: [
			{
				name: 'Add Ingredient',
				value: 'addIngredient',
				description: 'Add an ingredient to a recipe',
				action: 'Add ingredient to recipe',
			},
			{
				name: 'Add Operation',
				value: 'addOperation',
				description: 'Add an operation to a recipe',
				action: 'Add operation to recipe',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a recipe for a variant',
				action: 'Create a recipe',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a recipe',
				action: 'Delete a recipe',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a recipe by variant ID',
				action: 'Get a recipe',
			},
			{
				name: 'Get Operations',
				value: 'getOperations',
				description: 'Get operations for a recipe',
				action: 'Get recipe operations',
			},
			{
				name: 'Remove Ingredient',
				value: 'removeIngredient',
				description: 'Remove an ingredient from a recipe',
				action: 'Remove ingredient from recipe',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a recipe',
				action: 'Update a recipe',
			},
			{
				name: 'Update Ingredient',
				value: 'updateIngredient',
				description: 'Update an ingredient in a recipe',
				action: 'Update recipe ingredient',
			},
		],
		default: 'get',
	},
];

export const recipeFields: INodeProperties[] = [
	// ----------------------------------
	//         recipe: get, update, delete
	// ----------------------------------
	{
		displayName: 'Variant ID',
		name: 'variantId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['get', 'update', 'delete', 'addIngredient', 'updateIngredient', 'removeIngredient', 'getOperations', 'addOperation'],
			},
		},
		description: 'The ID of the variant that has the recipe',
	},

	// ----------------------------------
	//         recipe: create
	// ----------------------------------
	{
		displayName: 'Variant ID',
		name: 'variantId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['create'],
			},
		},
		description: 'The ID of the variant to create the recipe for',
	},
	{
		displayName: 'Ingredients',
		name: 'ingredients',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Ingredients',
				name: 'items',
				values: [
					{
						displayName: 'Material/Variant ID',
						name: 'material_id',
						type: 'number',
						default: 0,
						description: 'The ID of the material or variant',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						description: 'Required quantity per unit produced',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'Notes for this ingredient',
					},
				],
			},
		],
		description: 'Ingredients for the recipe',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the recipe',
			},
			{
				displayName: 'Operations',
				name: 'operations',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Operations',
						name: 'items',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Operation name',
							},
							{
								displayName: 'Time (Minutes)',
								name: 'time',
								type: 'number',
								default: 0,
								description: 'Time required in minutes',
							},
							{
								displayName: 'Cost',
								name: 'cost',
								type: 'number',
								default: 0,
								description: 'Cost per operation',
							},
							{
								displayName: 'Notes',
								name: 'notes',
								type: 'string',
								default: '',
								description: 'Operation notes',
							},
						],
					},
				],
				description: 'Manufacturing operations',
			},
			{
				displayName: 'Quantity Produced',
				name: 'quantity_produced',
				type: 'number',
				default: 1,
				description: 'Quantity produced per recipe run',
			},
		],
	},

	// ----------------------------------
	//         recipe: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Recipe notes',
			},
			{
				displayName: 'Quantity Produced',
				name: 'quantity_produced',
				type: 'number',
				default: 1,
				description: 'Quantity produced per recipe run',
			},
		],
	},

	// ----------------------------------
	//         recipe: addIngredient
	// ----------------------------------
	{
		displayName: 'Material/Variant ID',
		name: 'materialId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['addIngredient'],
			},
		},
		description: 'The ID of the material or variant to add',
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		required: true,
		default: 1,
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['addIngredient'],
			},
		},
		description: 'Required quantity per unit produced',
	},
	{
		displayName: 'Ingredient Options',
		name: 'ingredientOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['addIngredient'],
			},
		},
		options: [
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for this ingredient',
			},
		],
	},

	// ----------------------------------
	//         recipe: updateIngredient
	// ----------------------------------
	{
		displayName: 'Ingredient ID',
		name: 'ingredientId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['updateIngredient', 'removeIngredient'],
			},
		},
		description: 'The ID of the ingredient row',
	},
	{
		displayName: 'Update Ingredient Fields',
		name: 'updateIngredientFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['updateIngredient'],
			},
		},
		options: [
			{
				displayName: 'Material/Variant ID',
				name: 'material_id',
				type: 'number',
				default: 0,
				description: 'New material or variant ID',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Notes for this ingredient',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 0,
				description: 'Required quantity',
			},
		],
	},

	// ----------------------------------
	//         recipe: addOperation
	// ----------------------------------
	{
		displayName: 'Operation Name',
		name: 'operationName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['addOperation'],
			},
		},
		description: 'Name of the operation',
	},
	{
		displayName: 'Operation Options',
		name: 'operationOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['recipe'],
				operation: ['addOperation'],
			},
		},
		options: [
			{
				displayName: 'Cost',
				name: 'cost',
				type: 'number',
				default: 0,
				description: 'Cost per operation',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Operation notes',
			},
			{
				displayName: 'Time (Minutes)',
				name: 'time',
				type: 'number',
				default: 0,
				description: 'Time required in minutes',
			},
		],
	},
];

export async function executeRecipeOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === 'get') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		responseData = await katanaApiRequest.call(this, 'GET', `/variants/${variantId}/recipe`);
	}

	if (operation === 'create') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		const ingredients = this.getNodeParameter('ingredients', i) as IDataObject;
		const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (ingredients.items && Array.isArray(ingredients.items)) {
			body.ingredients = (ingredients.items as IDataObject[]).map((item) => ({
				material_id: item.material_id,
				quantity: formatNumericForApi(item.quantity as number),
				notes: item.notes || undefined,
			}));
		}

		if (additionalOptions.quantity_produced) {
			body.quantity_produced = formatNumericForApi(additionalOptions.quantity_produced as number);
		}
		if (additionalOptions.notes) body.notes = additionalOptions.notes;

		if (additionalOptions.operations) {
			const operationsData = additionalOptions.operations as IDataObject;
			if (operationsData.items && Array.isArray(operationsData.items)) {
				body.operations = (operationsData.items as IDataObject[]).map((item) => ({
					name: item.name,
					time: item.time || undefined,
					cost: item.cost ? formatNumericForApi(item.cost as number) : undefined,
					notes: item.notes || undefined,
				}));
			}
		}

		responseData = await katanaApiRequest.call(this, 'POST', `/variants/${variantId}/recipe`, body);
	}

	if (operation === 'update') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.quantity_produced) {
			body.quantity_produced = formatNumericForApi(updateFields.quantity_produced as number);
		}
		if (updateFields.notes) body.notes = updateFields.notes;

		responseData = await katanaApiRequest.call(this, 'PATCH', `/variants/${variantId}/recipe`, body);
	}

	if (operation === 'delete') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		responseData = await katanaApiRequest.call(this, 'DELETE', `/variants/${variantId}/recipe`);
	}

	if (operation === 'addIngredient') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		const materialId = this.getNodeParameter('materialId', i) as number;
		const quantity = this.getNodeParameter('quantity', i) as number;
		const ingredientOptions = this.getNodeParameter('ingredientOptions', i, {}) as IDataObject;

		const body: IDataObject = {
			material_id: materialId,
			quantity: formatNumericForApi(quantity),
		};

		if (ingredientOptions.notes) body.notes = ingredientOptions.notes;

		responseData = await katanaApiRequest.call(this, 'POST', `/variants/${variantId}/recipe/ingredients`, body);
	}

	if (operation === 'updateIngredient') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		const ingredientId = this.getNodeParameter('ingredientId', i) as number;
		const updateIngredientFields = this.getNodeParameter('updateIngredientFields', i, {}) as IDataObject;

		const body: IDataObject = {};

		if (updateIngredientFields.material_id) body.material_id = updateIngredientFields.material_id;
		if (updateIngredientFields.quantity) {
			body.quantity = formatNumericForApi(updateIngredientFields.quantity as number);
		}
		if (updateIngredientFields.notes !== undefined) body.notes = updateIngredientFields.notes;

		responseData = await katanaApiRequest.call(this, 'PATCH', `/variants/${variantId}/recipe/ingredients/${ingredientId}`, body);
	}

	if (operation === 'removeIngredient') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		const ingredientId = this.getNodeParameter('ingredientId', i) as number;
		responseData = await katanaApiRequest.call(this, 'DELETE', `/variants/${variantId}/recipe/ingredients/${ingredientId}`);
	}

	if (operation === 'getOperations') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		responseData = await katanaApiRequestAllItems.call(this, 'GET', `/variants/${variantId}/recipe/operations`);
	}

	if (operation === 'addOperation') {
		const variantId = this.getNodeParameter('variantId', i) as number;
		const operationName = this.getNodeParameter('operationName', i) as string;
		const operationOptions = this.getNodeParameter('operationOptions', i, {}) as IDataObject;

		const body: IDataObject = {
			name: operationName,
		};

		if (operationOptions.time) body.time = operationOptions.time;
		if (operationOptions.cost) body.cost = formatNumericForApi(operationOptions.cost as number);
		if (operationOptions.notes) body.notes = operationOptions.notes;

		responseData = await katanaApiRequest.call(this, 'POST', `/variants/${variantId}/recipe/operations`, body);
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
