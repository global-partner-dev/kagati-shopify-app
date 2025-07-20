# Kaghati Shopify V4

A comprehensive Shopify app built with Gadget framework, React, and Shopify Polaris for managing e-commerce operations, inventory, orders, customers, and multi-store management.

## 🚀 Overview

Kaghati Shopify V4 is a full-featured Shopify application that provides comprehensive e-commerce management capabilities. Built on the Gadget framework with React and Shopify Polaris, it offers a modern, scalable solution for managing multiple stores, inventory, orders, customers, and more.

## ✨ Features

### 🏪 Multi-Store Management
- Manage multiple Shopify stores from a single dashboard
- Store-specific settings and configurations
- Centralized inventory and order management

### 📦 Inventory Management
- Real-time inventory tracking across stores
- Stock level monitoring and alerts
- Inventory synchronization with ERP systems
- Bulk inventory operations

### 🛒 Order Management
- Complete order lifecycle management
- Draft order creation and editing
- Order splitting and fulfillment
- Refund processing
- Order assignment to different stores

### 👥 Customer Management
- Customer database management
- Customer support ticket system
- Customer analytics and insights
- Multi-store customer data synchronization

### 📍 Location & Delivery
- Pincode-based delivery management
- Delivery customization options
- Location-based inventory allocation
- Shipping zone management

### 📊 Analytics & Reporting
- Comprehensive reporting dashboard
- Sales analytics
- Inventory reports
- Customer insights
- Performance metrics

### 🔔 Notifications
- Real-time order notifications
- Push notification system
- Email notifications
- Custom notification templates

### ⚙️ Settings & Configuration
- Flexible settings management
- User role management
- Staff management
- System configuration

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Shopify Polaris** - Shopify's design system for consistent UI
- **React Router DOM** - Client-side routing
- **React Toastify** - Toast notifications
- **ApexCharts** - Data visualization and charts
- **React Google Maps API** - Location services

### Backend & Framework
- **Gadget Framework** - Full-stack development platform
- **Shopify App Bridge** - Shopify app integration
- **Node.js** - Server-side runtime

### Development Tools
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **SWC** - Fast JavaScript/TypeScript compiler

### Key Libraries
- **Axios** - HTTP client
- **Date-fns** - Date manipulation
- **PapaParse** - CSV parsing
- **XLSX** - Excel file handling
- **Web Push** - Push notifications
- **JWT** - Authentication tokens

## 📁 Project Structure

```
kaghati-shopify-v4/
├── api/                          # Backend API
│   ├── actions/                  # API actions
│   ├── helper/                   # Helper functions
│   ├── models/                   # Data models
│   └── routes/                   # API routes
├── extensions/                   # Shopify extensions
│   ├── cart-checkout-validation1/ # Cart validation extension
│   └── delivery-customization/   # Delivery customization
├── web/                         # Frontend application
│   ├── components/              # React components
│   │   ├── Module/             # Modular components
│   │   └── ...                 # Various UI components
│   ├── routes/                 # Application routes
│   │   ├── Pages/             # Main application pages
│   │   └── ExternalPages/     # External/public pages
│   ├── contexts/              # React contexts
│   ├── util/                  # Utility functions
│   └── assets/               # Static assets
├── public/                    # Public assets
├── accessControl/            # Access control configurations
├── settings.gadget.ts        # Gadget framework settings
├── shopify.app.toml          # Shopify app configuration
├── package.json              # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Shopify Partner account
- Gadget account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kaghati-shopify-v4
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   - Set up your Gadget environment
   - Configure Shopify app credentials
   - Set up database connections

4. **Start development server**
   ```bash
   yarn dev
   ```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn deploy` - Deploy to production
- `yarn shopify` - Shopify CLI commands
- `yarn info` - Display app information

## 🔧 Configuration

### Shopify App Configuration
The app is configured through `shopify.app.toml` with the following features:
- Embedded app mode
- Comprehensive API scopes for full e-commerce functionality
- Webhook support for real-time updates
- POS integration capabilities

### Gadget Framework Settings
Configured in `settings.gadget.ts` with:
- Shopify connection with full API access
- Authentication methods (Google OAuth)
- Enabled Shopify models for comprehensive data sync

## 📱 Extensions

### Cart Checkout Validation
- Validates cart items during checkout
- Custom validation rules
- Error handling and user feedback

### Delivery Customization
- Custom delivery options
- Location-based delivery rules
- Flexible delivery scheduling

## 🔐 Authentication & Security

- **Shopify OAuth** - Secure Shopify store authentication
- **Google OAuth** - Additional authentication method
- **Role-based access control** - Granular permissions
- **JWT tokens** - Secure API communication

## 📊 Data Models

The application includes comprehensive data models for:
- **Stores** - Multi-store management
- **Products** - Product catalog management
- **Orders** - Order processing and fulfillment
- **Customers** - Customer relationship management
- **Inventory** - Stock management
- **Notifications** - Communication system
- **Settings** - Configuration management

## 🌐 API Integration

### Shopify API
- Full Shopify Admin API integration
- Real-time data synchronization
- Webhook handling for live updates
- Bulk operations support

### ERP Integration
- Custom ERP system integration
- Inventory synchronization
- Order processing
- Customer data sync

## 🚀 Deployment

### Development
```bash
yarn dev
```

### Production Build
```bash
yarn build
yarn deploy
```

### Environment Variables
- `GADGET_PUBLIC_SHOPIFY_APP_URL` - Shopify app URL
- `SHOPIFY_API_KEY` - Shopify API credentials
- Database connection strings
- External service API keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Contact the development team

## 🔄 Version History

- **v4.0.0** - Current version with comprehensive e-commerce features
- Multi-store management
- Advanced inventory system
- Real-time notifications
- Enhanced reporting

---

**Built with ❤️ using Gadget, React, and Shopify Polaris** 