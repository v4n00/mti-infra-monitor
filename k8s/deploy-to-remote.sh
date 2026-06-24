#!/bin/bash

set -e
set -o pipefail

MINIKUBE_VERSION=1.36.0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [ -z "$1" ]; then
  echo "Error: Missing target IP address."
  echo "Usage: $0 <server_ip>"
  exit 1
fi

TARGET_IP="$1"

rm -f /tmp/mti-infra-monitor.tar.gz
tar czfv /tmp/mti-infra-monitor.tar.gz -C "${PROJECT_ROOT}/.." "$(basename "${PROJECT_ROOT}")"
ssh "root@${TARGET_IP}" "rm -f /root/mti-infra-monitor.tar.gz"
scp /tmp/mti-infra-monitor.tar.gz "root@${TARGET_IP}:/root"

ssh "root@${TARGET_IP}" << 'EOF'
yum install -y docker pnpm kubectl helm git -y

systemctl enable --now docker
usermod -aG docker $USER

MINIKUBE_VERSION=1.36.0
MINIKUBE_RPM="minikube-${MINIKUBE_VERSION}-0.x86_64.rpm"
curl -fLO "https://storage.googleapis.com/minikube/releases/v${MINIKUBE_VERSION}/${MINIKUBE_RPM}"
rpm -Uvh "${MINIKUBE_RPM}"
rm -f "${MINIKUBE_RPM}"

kubectl completion bash | tee /etc/bash_completion.d/kubectl > /dev/null
chmod a+r /etc/bash_completion.d/kubectl
echo 'alias k=kubectl' >> ~/.bashrc
echo 'complete -o default -F __start_kubectl k' >> ~/.bashrc
source ~/.bashrc

cd /root/ || exit 1
tar zxfv /root/mti-infra-monitor.tar.gz
cd /root/mti-infra-monitor || exit 1
./k8s/deploy.sh --clean

EOF

ssh -L 32000:192.168.49.2:32000 -L 32001:192.168.49.2:32001 -L 32002:192.168.49.2:32002 -L 32003:192.168.49.2:32003 root@${TARGET_IP}
