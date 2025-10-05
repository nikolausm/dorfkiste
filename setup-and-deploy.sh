#!/bin/bash
# Complete setup and deployment script for Dorfkiste on fresh Debian server
# Usage: ./setup-and-deploy.sh

echo "🚀 Dorfkiste - Complete Server Setup and Deployment"
echo "===================================================="
echo ""

SERVER="root@194.164.199.151"
PASSWORD="F6EpKT8a"
DOMAIN="dorfkiste.com"

echo "📋 This script will:"
echo "  1. Install Docker and Docker Compose"
echo "  2. Create dorfkiste user account"
echo "  3. Clone the repository"
echo "  4. Deploy the application"
echo ""

# Create expect script for automated SSH
cat > /tmp/deploy_dorfkiste.exp << 'EXPECTEOF'
#!/usr/bin/expect -f
set timeout 600

set server [lindex $argv 0]
set password [lindex $argv 1]

spawn ssh -o StrictHostKeyChecking=accept-new $server

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "# " {
        # We're logged in as root
        send "echo '=== Starting Dorfkiste Setup ==='\r"
        expect "# "

        # Update system
        send "echo '📦 Updating system packages...'\r"
        expect "# "
        send "apt-get update && apt-get upgrade -y\r"
        expect "# " { sleep 2 }

        # Install required packages
        send "echo '📦 Installing required packages...'\r"
        expect "# "
        send "apt-get install -y ca-certificates curl gnupg git\r"
        expect "# " { sleep 2 }

        # Install Docker
        send "echo '🐳 Installing Docker...'\r"
        expect "# "
        send "install -m 0755 -d /etc/apt/keyrings\r"
        expect "# "
        send "curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc\r"
        expect "# "
        send "chmod a+r /etc/apt/keyrings/docker.asc\r"
        expect "# "
        send "echo \"deb \[arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc\] https://download.docker.com/linux/debian \$(. /etc/os-release && echo \$VERSION_CODENAME) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null\r"
        expect "# "
        send "apt-get update\r"
        expect "# " { sleep 2 }
        send "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\r"
        expect "# " { sleep 5 }

        # Start Docker
        send "echo '🚀 Starting Docker service...'\r"
        expect "# "
        send "systemctl start docker\r"
        expect "# "
        send "systemctl enable docker\r"
        expect "# "

        # Create dorfkiste user
        send "echo '👤 Creating dorfkiste user...'\r"
        expect "# "
        send "useradd -m -s /bin/bash dorfkiste || echo 'User already exists'\r"
        expect "# "
        send "echo 'dorfkiste:Passw0rt!' | chpasswd\r"
        expect "# "
        send "usermod -aG docker dorfkiste\r"
        expect "# "

        # Clone repository as dorfkiste user
        send "echo '📥 Cloning repository...'\r"
        expect "# "
        send "su - dorfkiste -c 'cd ~ && rm -rf dorfkiste && git clone https://github.com/nikolausm/dorfkiste.git'\r"
        expect "# " { sleep 3 }

        # Create .env file
        send "echo '⚙️  Creating environment configuration...'\r"
        expect "# "
        send "su - dorfkiste -c 'cd ~/dorfkiste && cat > .env << ENVEOF\n"
        send "# Backend Configuration\n"
        send "ASPNETCORE_ENVIRONMENT=Production\n"
        send "ASPNETCORE_URLS=http://+:5000\n"
        send "ConnectionStrings__DefaultConnection=Data Source=/app/data/dorfkiste.db\n"
        send "\n"
        send "# JWT Configuration\n"
        send "Jwt__Secret=your-super-secret-jwt-key-change-this-in-production-min-32-chars\n"
        send "Jwt__Issuer=dorfkiste-api\n"
        send "Jwt__Audience=dorfkiste-frontend\n"
        send "Jwt__ExpirationMinutes=10080\n"
        send "\n"
        send "# OpenAI Configuration\n"
        send "OpenAI__ApiKey=your-openai-api-key-here\n"
        send "\n"
        send "# Frontend Configuration\n"
        send "NEXT_PUBLIC_API_URL=https://dorfkiste.com/api\n"
        send "ENVEOF\n"
        send "'\r"
        expect "# "

        # Create data directory
        send "echo '📁 Creating data directory...'\r"
        expect "# "
        send "su - dorfkiste -c 'mkdir -p ~/dorfkiste/data'\r"
        expect "# "

        # Create acme.json for SSL
        send "echo '🔒 Setting up SSL certificate storage...'\r"
        expect "# "
        send "su - dorfkiste -c 'touch ~/dorfkiste/acme.json && chmod 600 ~/dorfkiste/acme.json'\r"
        expect "# "

        # Build and start containers
        send "echo '🔨 Building Docker containers...'\r"
        expect "# "
        send "su - dorfkiste -c 'cd ~/dorfkiste && docker compose build'\r"
        expect "# " { sleep 30 }

        send "echo '🚀 Starting application...'\r"
        expect "# "
        send "su - dorfkiste -c 'cd ~/dorfkiste && docker compose up -d'\r"
        expect "# " { sleep 10 }

        # Show status
        send "echo ''\r"
        expect "# "
        send "echo '=== Container Status ==='\r"
        expect "# "
        send "su - dorfkiste -c 'cd ~/dorfkiste && docker compose ps'\r"
        expect "# "

        send "echo ''\r"
        expect "# "
        send "echo '✅ Setup complete!'\r"
        expect "# "
        send "echo ''\r"
        expect "# "
        send "echo '🌐 Your application should be available at:'\r"
        expect "# "
        send "echo '   https://dorfkiste.com'\r"
        expect "# "
        send "echo ''\r"
        expect "# "
        send "echo '📝 Important notes:'\r"
        expect "# "
        send "echo '   1. Update OpenAI API key in .env file'\r"
        expect "# "
        send "echo '   2. Update JWT secret in .env file'\r"
        expect "# "
        send "echo '   3. SSL certificate will be obtained automatically'\r"
        expect "# "
        send "echo ''\r"
        expect "# "

        send "exit\r"
    }
}

expect eof
EXPECTEOF

chmod +x /tmp/deploy_dorfkiste.exp

echo "🔧 Running automated setup..."
/tmp/deploy_dorfkiste.exp "$SERVER" "$PASSWORD"

echo ""
echo "✨ Deployment complete!"
echo ""
echo "🔑 Next steps:"
echo "  1. SSH into server: ssh dorfkiste@194.164.199.151 (password: Passw0rt!)"
echo "  2. Edit .env file: nano ~/dorfkiste/.env"
echo "  3. Add your OpenAI API key"
echo "  4. Restart containers: cd ~/dorfkiste && docker compose restart"
echo ""
