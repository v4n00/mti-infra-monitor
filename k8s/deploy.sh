#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_HOME="$(dirname "$SCRIPT_DIR")"
KUBERNETES_VERSION="v1.34.0"
K8S_HOME="${PROJECT_HOME}/k8s"
CERT_MANAGER_VERSION="v1.19.2"
OPEN_TELEMETRY_VERSION="0.102.0"
K8S_MONITORING_VERSION="80.6.0"
K6_VERSION="4.1.1"
LOKI_VERSION="6.49.0"
TEMPO_VERSION="1.24.1"
GATEWAY_API_VERSION="v1.4.1"
NGINX_FABRIC_VERSION="2.3.0"

if [ "$1" == "--clean" ]; then
    if [ ! -f $K8S_HOME/monitor/components/alertmanager-config ]; then
        echo "Please create the alertmanager-config file at $K8S_HOME/monitor/components/alertmanager-config"
        exit 1
    fi

    cp $K8S_HOME/monitor/components/alertmanager-secret.yaml.example $K8S_HOME/monitor/components/alertmanager-secret.yaml
    ALERTMANAGER_CONFIG_BASE64=$(base64 -w 0 $K8S_HOME/monitor/components/alertmanager-config)
    sed -i "s|#BASE64_ENCODED_CONTENT_OF_ALERTMANAGER-CONFIG#|$ALERTMANAGER_CONFIG_BASE64|g" "$K8S_HOME/monitor/components/alertmanager-secret.yaml"

    minikube delete
    minikube start --kubernetes-version=${KUBERNETES_VERSION} --driver=docker
    minikube addons enable metrics-server
    $PROJECT_HOME/docker/build.sh --all
fi

# helm charts
if ! helm repo list | grep -q "open-telemetry"; then
    helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
fi
if ! helm repo list | grep -q "prometheus-community"; then
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
fi
if ! helm repo list | grep -q "grafana"; then
    helm repo add grafana https://grafana.github.io/helm-charts
fi
helm repo update

kubectl create namespace monitoring

# otel
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/${CERT_MANAGER_VERSION}/cert-manager.yaml 
kubectl wait --namespace cert-manager --for=condition=available deployment --all --timeout=300s
helm install opentelemetry-operator open-telemetry/opentelemetry-operator --version ${OPEN_TELEMETRY_VERSION} --wait --namespace monitoring
kubectl apply -f $K8S_HOME/monitor/components/otel-instrumentation.yaml

# gateway
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/${GATEWAY_API_VERSION}/standard-install.yaml
kubectl kustomize https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/standard | kubectl apply -f -
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric -f $K8S_HOME/monitor/helm/nginx-gateway-fabric-values.yaml --version ${NGINX_FABRIC_VERSION} --create-namespace --namespace nginx-gateway
kubectl wait --timeout=5m -n nginx-gateway deployment/ngf-nginx-gateway --for=condition=Available

# app and monitoring
kubectl apply -f $K8S_HOME/app/
helm install k8s-monitoring prometheus-community/kube-prometheus-stack -f $K8S_HOME/monitor/helm/prometheus-grafana-values.yaml --version ${K8S_MONITORING_VERSION} --namespace monitoring
helm install loki grafana/loki -f $K8S_HOME/monitor/helm/loki-values.yaml --version ${LOKI_VERSION} --namespace monitoring
helm install tempo grafana/tempo -f $K8S_HOME/monitor/helm/tempo-values.yaml --version ${TEMPO_VERSION} --namespace monitoring
helm install k6-operator grafana/k6-operator --version ${K6_VERSION}
kubectl apply -f $K8S_HOME/monitor/datasource/
kubectl apply -f $K8S_HOME/monitor/port-forward/
kubectl apply -f $K8S_HOME/monitor/service-monitor/
kubectl apply -f $K8S_HOME/monitor/components/

minikube service -n nginx-gateway app-gateway-nginx
echo "Deployment complete!"
echo "Minikube IP: $(minikube ip)"
