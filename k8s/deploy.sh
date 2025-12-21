#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_HOME="$(dirname "$SCRIPT_DIR")"
KUBERNETES_VERSION="v1.34.0"
K8S_HOME="${PROJECT_HOME}/k8s"
CERT_MANAGER_VERSION="v1.19.2"
OPEN_TELEMETRY_VERSION="80.6.0"
K8S_MONITORING_VERSION="35.3.1"
K6_VERSION="4.1.1"
LOKI_VERSION="6.49.0"
TEMPO_VERSION="1.24.1"

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
    minikube addons enable ingress
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

# otel
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/${CERT_MANAGER_VERSION}/cert-manager.yaml 
sleep 10
helm install opentelemetry-operator open-telemetry/opentelemetry-operator --version ${OPEN_TELEMETRY_VERSION}
kubectl apply -f $K8S_HOME/monitor/components/otel-instrumentation.yaml

# app and monitoring
kubectl apply -f $K8S_HOME/app/
helm install k8s-monitoring prometheus-community/kube-prometheus-stack -f $K8S_HOME/monitor/helm/prometheus-grafana-values.yaml --version ${K8S_MONITORING_VERSION}
helm install loki grafana/loki -f $K8S_HOME/monitor/helm/loki-values.yaml --version ${LOKI_VERSION}
helm install tempo grafana/tempo -f $K8S_HOME/monitor/helm/tempo-values.yaml --version ${TEMPO_VERSION}
helm install k6-operator grafana/k6-operator --version ${K6_VERSION}
kubectl apply -f $K8S_HOME/monitor/datasource/
kubectl apply -f $K8S_HOME/monitor/port-forward/
kubectl apply -f $K8S_HOME/monitor/service-monitor/
kubectl apply -f $K8S_HOME/monitor/components/