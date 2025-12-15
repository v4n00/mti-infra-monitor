#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_HOME="$(dirname "$SCRIPT_DIR")"

if [ "$1" == "--clean" ]; then
    minikube delete
    minikube start --kubernetes-version=v1.34.0 --driver=docker
    $PROJECT_HOME/docker/build.sh --all
fi

kubectl apply -f app/
helm install k8s-monitoring prometheus-community/kube-prometheus-stack -f monitor/helm/prometheus-grafana-values.yaml
helm install loki grafana/loki -f monitor/helm/loki-values.yaml
kubectl apply -f monitor/port-forward/
kubectl apply -f monitor/service-monitor/
kubectl apply -f monitor/components/