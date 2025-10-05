#!/bin/bash

# Script to add Dorfkiste domains to /etc/hosts

echo "Adding Dorfkiste domains to /etc/hosts..."

# Check if entries already exist
if grep -q "dorfkiste.com" /etc/hosts; then
    echo "⚠️  Dorfkiste entries already exist in /etc/hosts"
    echo "Current entries:"
    grep "dorfkiste.com" /etc/hosts
    exit 0
fi

# Add entries
echo "" | sudo tee -a /etc/hosts > /dev/null
echo "# Dorfkiste local development" | sudo tee -a /etc/hosts > /dev/null
echo "127.0.0.1 dorfkiste.com www.dorfkiste.com dev.dorfkiste.com" | sudo tee -a /etc/hosts > /dev/null

echo "✅ Successfully added Dorfkiste domains to /etc/hosts"

# Flush DNS cache on macOS
echo "Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

echo ""
echo "✅ Setup complete! You can now access:"
echo "   • http://dorfkiste.com"
echo "   • http://www.dorfkiste.com"
echo "   • http://dev.dorfkiste.com"
echo ""
echo "Traefik Dashboard: http://localhost:8080"
