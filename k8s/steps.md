# Grafana/prometheus/node_exporter

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install k8s-monitoring prometheus-community/kube-prometheus-stack

---

