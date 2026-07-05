#!/bin/sh
# Synology DSM 7: Outbound-Tailscale für rsync/SSH aktivieren (Kernel-TUN).
# Einmalig als root ausführen, danach Boot-Task anlegen (siehe MPZ-Anleitung Teil D).
set -e
/var/packages/Tailscale/target/bin/tailscale configure-host
synosystemctl restart pkgctl-Tailscale.service
sleep 2
/var/packages/Tailscale/target/bin/tailscale ip -4
/var/packages/Tailscale/target/bin/tailscale status | head -5
