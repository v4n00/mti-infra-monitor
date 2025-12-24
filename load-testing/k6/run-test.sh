#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ $# -eq 0 ]; then
    echo "Error: No test name provided."
    echo ""
    exit 1
fi

TEST_NAME="$1"
TEST_FILE="${TEST_NAME}.js"

if [ ! -f "$SCRIPT_DIR/$TEST_FILE" ]; then
    echo "Error: Test file '$TEST_FILE' not found in $SCRIPT_DIR"
    echo ""
    exit 1
fi

echo "Running k6 test: $TEST_NAME"
echo "Test file: $TEST_FILE"
echo "========================================"

CONFIGMAP_NAME="k6-test-${TEST_NAME}"
TESTRUN_NAME="load-test-${TEST_NAME}"

echo "Checking for existing resources..."

if kubectl get testrun "$TESTRUN_NAME" &> /dev/null; then
    echo "Deleting existing TestRun: $TESTRUN_NAME"
    kubectl delete testrun "$TESTRUN_NAME"
    sleep 1
fi

if kubectl get configmap "$CONFIGMAP_NAME" &> /dev/null; then
    echo "Deleting existing ConfigMap: $CONFIGMAP_NAME"
    kubectl delete configmap "$CONFIGMAP_NAME"
    sleep 1
fi

echo "Creating ConfigMap: $CONFIGMAP_NAME"
kubectl create configmap "$CONFIGMAP_NAME" \
    --from-file="$TEST_FILE=$SCRIPT_DIR/$TEST_FILE"

echo "Creating TestRun: $TESTRUN_NAME"
cat <<EOF | kubectl apply -f -
apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: $TESTRUN_NAME
spec:
  parallelism: 1
  script:
    configMap:
      name: $CONFIGMAP_NAME
      file: $TEST_FILE
EOF

echo "========================================"
echo "TestRun created successfully!"
echo ""
echo "To monitor the test:"
echo "kubectl get testruns"
echo "kubectl logs -f job/$TESTRUN_NAME-1"