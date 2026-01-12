/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Log licensing notice once per node load
 */
let licensingNoticeLogged = false;

export function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licensingNoticeLogged = true;
  }
}

/**
 * Convert API response to n8n execution data format
 */
export function toExecutionData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
  if (Array.isArray(data)) {
    return data.map((item) => ({ json: item }));
  }
  return [{ json: data }];
}

/**
 * Remove empty values from an object
 */
export function removeEmptyValues(obj: IDataObject): IDataObject {
  const result: IDataObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = removeEmptyValues(value as IDataObject);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Parse numeric string to number or return undefined
 */
export function parseNumericString(value: string | undefined): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Format a number as a string for API requests (Katana expects string numbers)
 */
export function formatNumericForApi(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return String(value);
}

/**
 * Build address object from individual fields
 */
export function buildAddressObject(
  addressFields: IDataObject,
  prefix: string = '',
): IDataObject | undefined {
  const address: IDataObject = {};
  const fieldMapping: Record<string, string> = {
    line1: 'line1',
    line2: 'line2',
    city: 'city',
    state: 'state',
    postalCode: 'postal_code',
    country: 'country',
  };

  for (const [nodeField, apiField] of Object.entries(fieldMapping)) {
    const fullKey = prefix ? `${prefix}${nodeField.charAt(0).toUpperCase()}${nodeField.slice(1)}` : nodeField;
    const value = addressFields[fullKey];
    if (value !== undefined && value !== null && value !== '') {
      address[apiField] = value;
    }
  }

  return Object.keys(address).length > 0 ? address : undefined;
}

/**
 * Extract additional fields from node parameters
 */
export function extractAdditionalFields(
  additionalFields: IDataObject,
  fieldMapping?: Record<string, string>,
): IDataObject {
  const result: IDataObject = {};

  for (const [key, value] of Object.entries(additionalFields)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const apiKey = fieldMapping?.[key] || key;
    result[apiKey] = value;
  }

  return result;
}

/**
 * Parse ingredients array from node parameters
 */
export function parseIngredients(ingredients: IDataObject[]): IDataObject[] {
  return ingredients.map((ingredient) => ({
    material_id: ingredient.materialId,
    quantity: formatNumericForApi(ingredient.quantity as string | number),
    notes: ingredient.notes,
  }));
}

/**
 * Parse operations array from node parameters
 */
export function parseOperations(operations: IDataObject[]): IDataObject[] {
  return operations.map((operation) => ({
    name: operation.name,
    time: operation.time,
    notes: operation.notes,
  }));
}

/**
 * Parse line items array for orders
 */
export function parseOrderRows(rows: IDataObject[]): IDataObject[] {
  return rows.map((row) => ({
    variant_id: row.variantId,
    quantity: formatNumericForApi(row.quantity as string | number),
    unit_price: formatNumericForApi(row.unitPrice as string | number),
    discount: formatNumericForApi(row.discount as string | number),
    tax_rate_id: row.taxRateId,
    notes: row.notes,
  }));
}

/**
 * Parse stock adjustment rows
 */
export function parseAdjustmentRows(rows: IDataObject[]): IDataObject[] {
  return rows.map((row) => ({
    variant_id: row.variantId,
    quantity: formatNumericForApi(row.quantity as string | number),
    batch_sn: row.batchSn,
    notes: row.notes,
  }));
}

/**
 * Parse stock transfer rows
 */
export function parseTransferRows(rows: IDataObject[]): IDataObject[] {
  return rows.map((row) => ({
    variant_id: row.variantId,
    quantity: formatNumericForApi(row.quantity as string | number),
    batch_sn: row.batchSn,
  }));
}

/**
 * Parse purchase order rows
 */
export function parsePurchaseOrderRows(rows: IDataObject[]): IDataObject[] {
  return rows.map((row) => ({
    variant_id: row.variantId,
    quantity: formatNumericForApi(row.quantity as string | number),
    unit_price: formatNumericForApi(row.unitPrice as string | number),
    expected_arrival_date: row.expectedArrivalDate,
    notes: row.notes,
  }));
}
