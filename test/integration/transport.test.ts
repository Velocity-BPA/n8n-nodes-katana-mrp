/**
 * Integration tests for Katana MRP transport layer
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { buildFilterQuery } from '../../nodes/KatanaMrp/transport/katanaApi';

describe('Katana MRP Transport Layer', () => {
	describe('buildFilterQuery', () => {
		it('should build query with date filters', () => {
			const filters = {
				created_at: {
					gte: '2024-01-01T00:00:00Z',
					lte: '2024-12-31T23:59:59Z',
				},
			};

			const result = buildFilterQuery(filters);

			expect(result['created_at[gte]']).toBe('2024-01-01T00:00:00Z');
			expect(result['created_at[lte]']).toBe('2024-12-31T23:59:59Z');
		});

		it('should handle status filter', () => {
			const filters = {
				status: 'NOT_SHIPPED',
			};

			const result = buildFilterQuery(filters);

			expect(result.status).toBe('NOT_SHIPPED');
		});

		it('should handle customer_id filter', () => {
			const filters = {
				customer_id: 12345,
			};

			const result = buildFilterQuery(filters);

			expect(result.customer_id).toBe(12345);
		});

		it('should handle multiple filters', () => {
			const filters = {
				status: 'IN_PROGRESS',
				location_id: 100,
				updated_at: {
					gte: '2024-06-01T00:00:00Z',
				},
			};

			const result = buildFilterQuery(filters);

			expect(result.status).toBe('IN_PROGRESS');
			expect(result.location_id).toBe(100);
			expect(result['updated_at[gte]']).toBe('2024-06-01T00:00:00Z');
		});

		it('should ignore empty filters', () => {
			const filters = {
				status: '',
				customer_id: null,
				valid_filter: 'test',
			};

			const result = buildFilterQuery(filters);

			expect(result.status).toBeUndefined();
			expect(result.customer_id).toBeUndefined();
			expect(result.valid_filter).toBe('test');
		});
	});

	// Note: Full API integration tests require a valid Katana API key
	// and should be run manually against a test environment
	describe('API Request Functions (Mocked)', () => {
		it('should export katanaApiRequest function', async () => {
			const { katanaApiRequest } = await import('../../nodes/KatanaMrp/transport/katanaApi');
			expect(typeof katanaApiRequest).toBe('function');
		});

		it('should export katanaApiRequestAllItems function', async () => {
			const { katanaApiRequestAllItems } = await import('../../nodes/KatanaMrp/transport/katanaApi');
			expect(typeof katanaApiRequestAllItems).toBe('function');
		});
	});
});

describe('Katana MRP Node Exports', () => {
	it('should export KatanaMrp node class', async () => {
		const { KatanaMrp } = await import('../../nodes/KatanaMrp/KatanaMrp.node');
		expect(KatanaMrp).toBeDefined();
		expect(typeof KatanaMrp).toBe('function');
	});

	it('should export KatanaMrpTrigger node class', async () => {
		const { KatanaMrpTrigger } = await import('../../nodes/KatanaMrp/KatanaMrpTrigger.node');
		expect(KatanaMrpTrigger).toBeDefined();
		expect(typeof KatanaMrpTrigger).toBe('function');
	});

	it('should have correct node description', async () => {
		const { KatanaMrp } = await import('../../nodes/KatanaMrp/KatanaMrp.node');
		const node = new KatanaMrp();
		
		expect(node.description.displayName).toBe('Katana MRP');
		expect(node.description.name).toBe('katanaMrp');
		expect(node.description.credentials).toHaveLength(1);
		expect(node.description.credentials?.[0].name).toBe('katanaMrpApi');
	});

	it('should have all 12 resources defined', async () => {
		const { KatanaMrp } = await import('../../nodes/KatanaMrp/KatanaMrp.node');
		const node = new KatanaMrp();
		
		const resourceProperty = node.description.properties.find((p: { name: string }) => p.name === 'resource');
		expect(resourceProperty).toBeDefined();
		
		const options = resourceProperty?.options as Array<{ value: string }>;
		expect(options).toHaveLength(12);
		
		const resourceValues = options.map(o => o.value);
		expect(resourceValues).toContain('salesOrder');
		expect(resourceValues).toContain('manufacturingOrder');
		expect(resourceValues).toContain('product');
		expect(resourceValues).toContain('material');
		expect(resourceValues).toContain('variant');
		expect(resourceValues).toContain('inventory');
		expect(resourceValues).toContain('stockAdjustment');
		expect(resourceValues).toContain('stockTransfer');
		expect(resourceValues).toContain('purchaseOrder');
		expect(resourceValues).toContain('customer');
		expect(resourceValues).toContain('supplier');
		expect(resourceValues).toContain('recipe');
	});
});
