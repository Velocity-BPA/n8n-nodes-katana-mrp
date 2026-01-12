/**
 * Unit tests for Katana MRP helpers
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import {
	formatNumericForApi,
	buildAddressObject,
	removeEmptyValues,
} from '../../nodes/KatanaMrp/utils/helpers';

describe('Katana MRP Helpers', () => {
	describe('formatNumericForApi', () => {
		it('should convert number to string', () => {
			expect(formatNumericForApi(42)).toBe('42');
		});

		it('should preserve decimal places', () => {
			expect(formatNumericForApi(3.14159)).toBe('3.14159');
		});

		it('should handle zero', () => {
			expect(formatNumericForApi(0)).toBe('0');
		});

		it('should handle negative numbers', () => {
			expect(formatNumericForApi(-10)).toBe('-10');
		});

		it('should handle large numbers', () => {
			expect(formatNumericForApi(1000000)).toBe('1000000');
		});
	});

	describe('buildAddressObject', () => {
		it('should build a complete address object', () => {
			const input = {
				line1: '123 Main St',
				line2: 'Suite 100',
				city: 'Portland',
				state: 'OR',
				postalCode: '97201',
				country: 'US',
			};

			const result = buildAddressObject(input);

			expect(result).toEqual({
				line1: '123 Main St',
				line2: 'Suite 100',
				city: 'Portland',
				state: 'OR',
				postal_code: '97201',
				country: 'US',
			});
		});

		it('should handle partial address', () => {
			const input = {
				line1: '123 Main St',
				city: 'Portland',
			};

			const result = buildAddressObject(input);

			expect(result).toBeDefined();
			expect(result?.line1).toBe('123 Main St');
			expect(result?.city).toBe('Portland');
		});

		it('should handle empty input', () => {
			const result = buildAddressObject({});
			expect(result).toBeUndefined();
		});
	});

	describe('removeEmptyValues', () => {
		it('should remove undefined values', () => {
			const input = {
				name: 'Test',
				value: undefined,
				count: 5,
			};

			const result = removeEmptyValues(input);

			expect(result).toEqual({
				name: 'Test',
				count: 5,
			});
		});

		it('should remove null values', () => {
			const input = {
				name: 'Test',
				value: null,
				count: 5,
			};

			const result = removeEmptyValues(input);

			expect(result).toEqual({
				name: 'Test',
				count: 5,
			});
		});

		it('should remove empty strings', () => {
			const input = {
				name: 'Test',
				value: '',
				count: 5,
			};

			const result = removeEmptyValues(input);

			expect(result).toEqual({
				name: 'Test',
				count: 5,
			});
		});

		it('should preserve zero values', () => {
			const input = {
				name: 'Test',
				count: 0,
			};

			const result = removeEmptyValues(input);

			expect(result).toEqual({
				name: 'Test',
				count: 0,
			});
		});

		it('should preserve false values', () => {
			const input = {
				name: 'Test',
				active: false,
			};

			const result = removeEmptyValues(input);

			expect(result).toEqual({
				name: 'Test',
				active: false,
			});
		});
	});
});
