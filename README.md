# METACHROME.io - Crypto Trading Platform

A comprehensive cryptocurrency trading platform with MetaMask integration, admin-controlled trading outcomes, and binary options trading.

## 🚀 Features

### ✅ **Implemented Features**

- **MetaMask Integration**: Full wallet connection and authentication
- **Binary Options Trading**: Time-based contracts (30s, 60s, 120s, etc.)
- **Admin Control System**: Two-tier admin system (admin vs super_admin)
- **Per-Member Controls**: Individual user trading outcome control (win/normal/lose)
- **Real-time Price Data**: Live cryptocurrency price feeds
- **Secure Authentication**: JWT tokens, password hashing, rate limiting
- **Mobile Responsive**: Works on desktop and mobile devices
- **Deposit/Withdraw**: Blockchain transaction support
- **Admin Dashboard**: Complete user and trade management

### 📊 **Trading Features**

- **30s Options**: Min $100, 10% profit
- **60s Options**: Min $1000, 15% profit  
- **120s Options**: Min $5000, 20% profit
- **Admin Controls**: Win/Normal/Lose modes per user
- **Real-time Execution**: Automatic trade settlement
- **Balance Management**: USDT, BTC, ETH support

### 🔐 **Security Features**

- Password hashing with bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention

## 🛠️ **Installation & Setup**

### Prerequisites

- Node.js 18+
- PostgreSQL database
- MetaMask browser extension

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd CryptoTradeX
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

### Production Deployment

1. **Run the deployment script**
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

2. **Configure your environment variables in .env**

3. **Update DNS records to point to your server**

## 🔧 **Configuration**

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/metachrome_db

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
BCRYPT_ROUNDS=12

# External APIs
BINANCE_API_KEY=your-binance-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
BSC_RPC_URL=https://bsc-dataseed.binance.org/

# CORS
ALLOWED_ORIGINS=https://metachrome.io,https://www.metachrome.io
```

## 👥 **User Roles**

### Super Admin
- Full system access
- User management
- Balance management
- Admin creation
- System settings

### Admin  
- User trading controls
- Trade monitoring
- Basic user management

### User
- Trading interface
- Wallet management
- Transaction history

## 🎯 **Admin Controls**

### Trading Control Types

- **Normal**: Follows real market conditions
- **Win**: User always wins trades
- **Lose**: User always loses trades

### Per-User Settings
- Individual control per member
- Real-time control switching
- Trade outcome manipulation
- Balance management

## 📱 **API Endpoints**

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/login` - User login
- `POST /api/auth/metamask` - MetaMask authentication

### Trading
- `POST /api/trades/options` - Create options trade
- `GET /api/trades/active` - Get active trades
- `POST /api/trades/:id/cancel` - Cancel trade

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/controls` - Set user controls
- `PUT /api/admin/balances/:userId/:symbol` - Update balance

## 🔒 **Security Considerations**

### Production Security
- Use strong JWT secrets
- Enable HTTPS with SSL certificates
- Configure firewall rules
- Regular security updates
- Database backups
- Rate limiting
- Input validation

### MetaMask Security
- Signature verification
- Network validation
- Transaction confirmation
- Address validation

## 📊 **Monitoring & Maintenance**

### Service Management
```bash
# Start service
sudo systemctl start metachrome

# Stop service
sudo systemctl stop metachrome

# Restart service
sudo systemctl restart metachrome

# View logs
sudo journalctl -u metachrome -f
```

### Backup
```bash
# Manual backup
sudo /usr/local/bin/metachrome-backup.sh

# Automated daily backups are configured via cron
```

## 🐛 **Troubleshooting**

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

2. **Database Connection**
   - Verify DATABASE_URL
   - Check PostgreSQL service
   - Ensure database exists

3. **MetaMask Issues**
   - Check network configuration
   - Verify contract addresses
   - Ensure sufficient gas fees

## 📈 **Performance Optimization**

- Database indexing
- Redis caching (optional)
- CDN for static assets
- Load balancing for high traffic
- Database connection pooling

## 🤝 **Support**

For technical support and questions:
- Check the troubleshooting section
- Review server logs
- Contact development team

## 📄 **License**

This project is proprietary software. All rights reserved.

---

**METACHROME.io** - Professional Crypto Trading Platform
