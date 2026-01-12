# n8n-nodes-katana-mrp

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Katana Cloud Manufacturing (Katana MRP), enabling D2C manufacturing ERP automation within n8n workflows. This integration provides access to Katana's manufacturing, inventory management, production planning, and order fulfillment capabilities for small to mid-sized manufacturers.

![n8n](https://img.shields.io/badge/n8n-community%20node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **12 Resource Categories** with 70+ operations for complete Katana MRP automation
- **Sales Order Management** - Create, update, fulfill, and track sales orders with line items
- **Manufacturing Orders** - Manage production workflows, BOM consumption, and completion tracking
- **Inventory Control** - Real-time stock levels, adjustments, and multi-location transfers
- **Purchase Orders** - Supplier ordering, receiving, and procurement workflows
- **Product & Variant Management** - SKUs, pricing, and product variants
- **Recipe/BOM Management** - Bill of materials with ingredients and operations
- **Customer & Supplier Management** - Contact information and relationship tracking
- **Trigger Node** - Webhook and polling support for real-time event notifications
- **Rate Limiting** - Built-in compliance with Katana's API limits (5 req/sec, 300/min)
- **Cursor-based Pagination** - Efficient handling of large data sets

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-katana-mrp`
5. Click **Install**
6. Restart n8n

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-katana-mrp

# Restart n8n
```

### Development Installation

```bash
# Clone or extract the package
cd n8n-nodes-katana-mrp

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-katana-mrp

# Restart n8n
n8n start
```

## Credentials Setup

### Katana API Key

| Field | Description |
|-------|-------------|
| **API Key** | Your Katana API key for authentication |

### Obtaining API Credentials

1. Log in to your Katana account at [katanamrp.com](https://katanamrp.com)
2. Navigate to **Settings** → **API** → **API keys**
3. Click **"+ Add new API key"**
4. Copy the generated API key
5. In n8n, create new **Katana API** credentials
6. Paste your API key

> **Note**: API access requires a Katana Professional or Professional Plus plan.

## Resources & Operations

### Sales Order

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a sales order by ID |
| Get Many | List all sales orders with filters |
| Create | Create a new sales order |
| Update | Update sales order details |
| Delete | Delete a sales order |
| Get Rows | Get line items for an order |
| Add Row | Add a line item to an order |
| Update Row | Update a line item |
| Delete Row | Remove a line item |
| Get Fulfillments | Get fulfillments for an order |
| Create Fulfillment | Create a fulfillment |

### Manufacturing Order

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a manufacturing order by ID |
| Get Many | List all manufacturing orders |
| Create | Create a manufacturing order |
| Update | Update manufacturing order |
| Delete | Delete a manufacturing order |
| Get Recipe Rows | Get BOM/recipe rows |
| Get Operation Rows | Get operation steps |
| Update Production | Update production quantities |
| Complete | Mark as complete |
| Cancel | Cancel manufacturing order |

### Product

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a product by ID |
| Get Many | List all products |
| Create | Create a new product |
| Update | Update product details |
| Delete | Delete a product |
| Get Variants | Get product variants |
| Get Recipe | Get product recipe/BOM |
| Get Operations | Get manufacturing operations |

### Material

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a material by ID |
| Get Many | List all materials |
| Create | Create a new material |
| Update | Update material details |
| Delete | Delete a material |
| Get Inventory | Get inventory levels |
| Get Suppliers | Get material suppliers |

### Variant

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a variant by ID |
| Get Many | List all variants |
| Create | Create a variant |
| Update | Update variant details |
| Delete | Delete a variant |
| Get Inventory | Get variant inventory |
| Get Recipe | Get variant-specific recipe |

### Inventory

| Operation | Description |
|-----------|-------------|
| Get | Get inventory for a product/material |
| Get Many | List all inventory records |
| Get Summary | Get inventory summary |
| Get By Location | Get inventory by location |
| Adjust | Make inventory adjustment |

### Stock Adjustment

| Operation | Description |
|-----------|-------------|
| Get | Retrieve adjustment by ID |
| Get Many | List all adjustments |
| Create | Create a stock adjustment |
| Get Rows | Get adjustment line items |

### Stock Transfer

| Operation | Description |
|-----------|-------------|
| Get | Retrieve transfer by ID |
| Get Many | List all transfers |
| Create | Create a stock transfer |
| Update | Update transfer |
| Complete | Complete transfer |
| Cancel | Cancel transfer |

### Purchase Order

| Operation | Description |
|-----------|-------------|
| Get | Retrieve a PO by ID |
| Get Many | List all purchase orders |
| Create | Create a purchase order |
| Update | Update purchase order |
| Delete | Delete purchase order |
| Get Rows | Get PO line items |
| Add Row | Add line item |
| Receive | Receive items |
| Cancel | Cancel PO |

### Customer

| Operation | Description |
|-----------|-------------|
| Get | Retrieve customer by ID |
| Get Many | List all customers |
| Create | Create a customer |
| Update | Update customer details |
| Delete | Delete a customer |
| Get Orders | Get customer's orders |
| Get Addresses | Get addresses |

### Supplier

| Operation | Description |
|-----------|-------------|
| Get | Retrieve supplier by ID |
| Get Many | List all suppliers |
| Create | Create a supplier |
| Update | Update supplier details |
| Delete | Delete a supplier |
| Get Purchase Orders | Get supplier's POs |
| Get Products | Get supplier's products |

### Recipe (Bill of Materials)

| Operation | Description |
|-----------|-------------|
| Get | Get recipe for product/variant |
| Create | Create recipe |
| Update | Update recipe |
| Delete | Delete recipe |
| Add Ingredient | Add ingredient |
| Update Ingredient | Update ingredient |
| Remove Ingredient | Remove ingredient |
| Get Operations | Get operations |
| Add Operation | Add operation |

## Trigger Node

The **Katana MRP Trigger** node supports both webhook and polling modes for real-time event notifications.

### Supported Events

- `sales_order.created` / `sales_order.updated` / `sales_order.deleted`
- `manufacturing_order.created` / `manufacturing_order.updated` / `manufacturing_order.status_changed`
- `purchase_order.created` / `purchase_order.updated` / `purchase_order.received`
- `inventory.adjusted`
- `stock_transfer.completed`
- `product.created` / `product.updated`

### Webhook Mode

Configure webhooks in Katana → Settings → Webhooks, and register the n8n webhook URL.

### Polling Mode

For environments where webhooks cannot be configured, the trigger node supports polling with configurable intervals using `updated_at` filtering.

## Usage Examples

### Create a Sales Order

```json
{
  "resource": "salesOrder",
  "operation": "create",
  "customerId": 12345,
  "additionalFields": {
    "orderNo": "SO-001",
    "deliveryDate": "2024-12-31",
    "additionalInfo": "Rush order"
  }
}
```

### Create a Manufacturing Order

```json
{
  "resource": "manufacturingOrder",
  "operation": "create",
  "variantId": 67890,
  "plannedQuantity": "100",
  "additionalFields": {
    "scheduledStartDate": "2024-01-15",
    "dueDate": "2024-01-20",
    "notes": "Priority production run"
  }
}
```

### Adjust Inventory

```json
{
  "resource": "inventory",
  "operation": "adjust",
  "variantId": 11111,
  "adjustmentType": "add",
  "quantity": "50",
  "additionalFields": {
    "locationId": 100,
    "reason": "Received from supplier"
  }
}
```

## Katana MRP Concepts

### Products vs Materials

- **Products**: Finished goods that are sold to customers
- **Materials**: Raw materials or components used in manufacturing

### Variants

Products can have multiple variants representing different options (size, color, etc.). Each variant has its own SKU, pricing, and inventory.

### Manufacturing Orders

Manufacturing orders track the production of products, including:
- Planned vs actual quantities
- BOM/recipe consumption
- Operation steps and timing
- Status tracking (Not Started → In Progress → Done)

### Recipes (BOM)

Recipes define the bill of materials for producing a product, including:
- Ingredients (materials and their quantities)
- Operations (manufacturing steps and time)

## Error Handling

The node provides detailed error messages for common scenarios:

| Error | Description |
|-------|-------------|
| **401 Unauthorized** | Invalid API key |
| **403 Forbidden** | API access requires Professional plan |
| **404 Not Found** | Requested resource does not exist |
| **422 Validation Error** | Invalid data provided |
| **429 Rate Limited** | Exceeded 5 req/sec or 300 req/min |

## Security Best Practices

1. **Store API keys securely** using n8n's credential system
2. **Use environment variables** for sensitive configuration
3. **Limit API key permissions** in Katana when possible
4. **Monitor API usage** to detect unusual activity
5. **Rotate API keys** periodically

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use

Permitted for personal, educational, research, and internal business use.

### Commercial Use

Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Katana API Docs](https://developer.katanamrp.com/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-katana-mrp/issues)
- **n8n Community**: [community.n8n.io](https://community.n8n.io/)

## Acknowledgments

- [Katana MRP](https://katanamrp.com/) for their comprehensive manufacturing ERP platform
- [n8n](https://n8n.io/) for the excellent workflow automation platform
- The n8n community for inspiration and support
