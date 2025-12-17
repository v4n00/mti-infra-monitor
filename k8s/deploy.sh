#!/bin/bash
set -e

# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo add grafana https://grafana.github.io/helm-charts
# helm repo update

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_HOME="$(dirname "$SCRIPT_DIR")"
K8S_HOME="${PROJECT_HOME}/k8s"

if [ "$1" == "--clean" ]; then
    if [ ! -f $K8S_HOME/monitor/components/alertmanager-config ]; then
        echo "Please create the alertmanager-config file at $K8S_HOME/monitor/components/alertmanager-config"
        exit 1
    fi

    cp $K8S_HOME/monitor/components/alertmanager-secret.yaml.example $K8S_HOME/monitor/components/alertmanager-secret.yaml
    ALERTMANAGER_CONFIG_BASE64=$(base64 -w 0 $K8S_HOME/monitor/components/alertmanager-config)
    sed -i "s|#BASE64_ENCODED_CONTENT_OF_ALERTMANAGER-CONFIG#|$ALERTMANAGER_CONFIG_BASE64|g" "$K8S_HOME/monitor/components/alertmanager-secret.yaml"

    minikube delete
    minikube start --kubernetes-version=v1.34.0 --driver=docker
    minikube addons enable metrics-server
    minikube addons enable ingress
    $PROJECT_HOME/docker/build.sh --all
fi

kubectl apply -f $K8S_HOME/app/
helm install k8s-monitoring prometheus-community/kube-prometheus-stack -f $K8S_HOME/monitor/helm/prometheus-grafana-values.yaml
helm install loki grafana/loki -f $K8S_HOME/monitor/helm/loki-values.yaml
kubectl apply -f $K8S_HOME/monitor/port-forward/
kubectl apply -f $K8S_HOME/monitor/service-monitor/
kubectl apply -f $K8S_HOME/monitor/components/