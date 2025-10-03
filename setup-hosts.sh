#!/bin/bash

# Script to add Dorfkiste domains to /etc/hosts

echo "Adding Dorfkiste domains to /etc/hosts..."

# Check if entries already exist
if grep -q "dorfkiste.org" /etc/hosts; then
    echo "⚠️  Dorfkiste entries already exist in /etc/hosts"
    echo "Current entries:"
    grep "dorfkiste.org" /etc/hosts
    exit 0
fi

# Add entries
echo "" | sudo tee -a /etc/hosts > /dev/null
echo "# Dorfkiste local development" | sudo tee -a /etc/hosts > /dev/null
echo "127.0.0.1 dorfkiste.org www.dorfkiste.org dev.dorfkiste.org" | sudo tee -a /etc/hosts > /dev/null

echo "✅ Successfully added Dorfkiste domains to /etc/hosts"

# Flush DNS cache on macOS
echo "Flushing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

echo ""
echo "✅ Setup complete! You can now access:"
echo "   • http://dorfkiste.org"
echo "   • http://www.dorfkiste.org"
echo "   • http://dev.dorfkiste.org"
echo ""
echo "Traefik Dashboard: http://localhost:8080"
