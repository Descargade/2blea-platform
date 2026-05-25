#!/usr/bin/env bash
set -euo pipefail

# 2bleA — VPS Initial Provisioning
# Run ONCE on a fresh Ubuntu 22.04/24.04 VPS as root
# Usage: curl -fsSL https://raw.githubusercontent.com/.../bootstrap.sh | bash
# Or: bash infra/scripts/bootstrap.sh

echo "================================================"
echo "  2bleA — VPS Bootstrap"
echo "================================================"

# --- System updates ---
apt update && apt upgrade -y
apt install -y \
    curl wget git ufw fail2ban \
    apt-transport-https ca-certificates software-properties-common \
    htop neofetch

# --- Docker ---
if ! command -v docker &>/dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable --now docker
fi

# --- Docker Compose ---
if ! command -v docker compose &>/dev/null; then
    echo "📦 Installing Docker Compose..."
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p "$DOCKER_CONFIG/cli-plugins"
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
    chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
fi

# --- Firewall ---
echo "🔒 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# --- Fail2Ban ---
echo "🔒 Configuring fail2ban..."
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local 2>/dev/null || true
cat > /etc/fail2ban/jail.d/sshd.local <<'F2B'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
F2B
systemctl restart fail2ban

# --- Swap (for small VPS) ---
if [ "$(free -m | awk '/^Mem:/{print $2}')" -lt 2048 ]; then
    echo "💾 Adding swap (2GB)..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    sysctl -p
fi

# --- App directory ---
mkdir -p /opt/2blea

echo "================================================"
echo "  ✅ VPS Bootstrap Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Clone repo: git clone <repo> /opt/2blea"
echo "  2. Create env:  cp .env.production.example /opt/2blea/.env.production"
echo "  3. Edit env:    nano /opt/2blea/.env.production"
echo "  4. Deploy:      bash /opt/2blea/infra/scripts/deploy.sh --build --migrate"
echo "  5. Setup SSL:   certbot --nginx -d 2blea.com -d www.2blea.com"
echo ""
