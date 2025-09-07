#!/bin/bash

# METACHROME.io Production Deployment Script
# This script sets up the production environment for the crypto trading platform

echo "🚀 Starting METACHROME.io Production Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create production environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating production environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your production values before continuing."
    echo "   Required: DATABASE_URL, JWT_SECRET, SESSION_SECRET"
    read -p "Press Enter after updating .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if database URL is set
if ! grep -q "DATABASE_URL=" .env || grep -q "your-database-url" .env; then
    echo "❌ Please set a valid DATABASE_URL in .env file"
    exit 1
fi

# Push database schema
echo "🗄️  Setting up database..."
npm run db:push

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Create systemd service file for production
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/metachrome.service > /dev/null <<EOF
[Unit]
Description=METACHROME.io Crypto Trading Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable metachrome
sudo systemctl start metachrome

# Setup nginx configuration
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/metachrome.io > /dev/null <<EOF
server {
    listen 80;
    server_name metachrome.io www.metachrome.io;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/metachrome.io /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL with Let's Encrypt (optional)
read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " setup_ssl
if [ "$setup_ssl" = "y" ]; then
    if command -v certbot &> /dev/null; then
        sudo certbot --nginx -d metachrome.io -d www.metachrome.io
    else
        echo "⚠️  Certbot not installed. Please install certbot to setup SSL."
    fi
fi

# Setup firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create backup script
echo "💾 Creating backup script..."
sudo tee /usr/local/bin/metachrome-backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/metachrome"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
pg_dump \$DATABASE_URL > \$BACKUP_DIR/database_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz $(pwd)

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

sudo chmod +x /usr/local/bin/metachrome-backup.sh

# Setup daily backup cron job
echo "0 2 * * * /usr/local/bin/metachrome-backup.sh" | sudo crontab -

# Final status check
echo "🔍 Checking service status..."
sudo systemctl status metachrome --no-pager

echo ""
echo "✅ METACHROME.io deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update DNS records to point to this server"
echo "2. Test the application at http://your-server-ip"
echo "3. Monitor logs: sudo journalctl -u metachrome -f"
echo "4. Check service status: sudo systemctl status metachrome"
echo ""
echo "🔧 Management Commands:"
echo "- Start: sudo systemctl start metachrome"
echo "- Stop: sudo systemctl stop metachrome"
echo "- Restart: sudo systemctl restart metachrome"
echo "- Logs: sudo journalctl -u metachrome -f"
echo "- Backup: sudo /usr/local/bin/metachrome-backup.sh"
echo ""
echo "🌐 Your METACHROME.io platform is now running in production!"
