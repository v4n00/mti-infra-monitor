#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_HOME="$(dirname "$SCRIPT_DIR")"

BUILD_BACKEND=false
BUILD_FRONTEND=false
BUILD_SEEDER=false
DEPLOY=false
BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Build and optionally deploy Docker images for the e-commerce application."
    echo ""
    echo "Options:"
    echo "  -b, --backend     Build backend image"
    echo "  -f, --frontend    Build frontend image"
    echo "  -s, --seeder      Build seeder image"
    echo "  -a, --all         Build all images (default if no build options specified)"
    echo "  -d, --deploy      Deploy built components to Kubernetes"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --all                    # Build all images"
    echo "  $0 --backend --frontend     # Build backend and frontend only"
    echo "  $0 --all --deploy           # Build all and deploy to Kubernetes"
    echo "  $0 --seeder --deploy        # Build seeder only and deploy it"
    echo "  $0 --backend --deploy       # Build backend only and deploy it"
    echo ""
    echo "  Can be called from any directory, script automatically finds project root."
    exit 1
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--backend)
            BUILD_BACKEND=true
            shift
            ;;
        -f|--frontend)
            BUILD_FRONTEND=true
            shift
            ;;
        -s|--seeder)
            BUILD_SEEDER=true
            shift
            ;;
        -a|--all)
            BUILD_BACKEND=true
            BUILD_FRONTEND=true
            BUILD_SEEDER=true
            shift
            ;;
        -d|--deploy)
            DEPLOY=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

if [[ "$BUILD_BACKEND" == "false" && "$BUILD_FRONTEND" == "false" && "$BUILD_SEEDER" == "false" ]]; then
    BUILD_BACKEND=true
    BUILD_FRONTEND=true
    BUILD_SEEDER=true
fi

echo "🚀 Starting build process at $BUILD_DATE"
echo "📁 Project home: $PROJECT_HOME"
echo "📁 Script location: $SCRIPT_DIR"
echo "Build options: Backend=$BUILD_BACKEND, Frontend=$BUILD_FRONTEND, Seeder=$BUILD_SEEDER, Deploy=$DEPLOY"
eval $(minikube -p minikube docker-env) # Use minikube's Docker daemon

# backend
if [[ "$BUILD_BACKEND" == "true" ]]; then
    echo "📦 Building backend image..."
    docker build --build-arg BUILD_DATE="$BUILD_DATE" -t ecommerce-backend -f "$SCRIPT_DIR/Dockerfile.backend" "$PROJECT_HOME/backend"
    echo "✅ Backend image built successfully"
fi

# frontend
if [[ "$BUILD_FRONTEND" == "true" ]]; then
    echo "📦 Building frontend image..."
    docker build -t ecommerce-frontend -f "$SCRIPT_DIR/Dockerfile.frontend" "$PROJECT_HOME/frontend"
    echo "✅ Frontend image built successfully"
fi

# seeder
if [[ "$BUILD_SEEDER" == "true" ]]; then
    echo "📦 Building seeder image..."
    docker build -t ecommerce-seeder -f "$SCRIPT_DIR/Dockerfile.seeder" "$PROJECT_HOME/backend"
    echo "✅ Seeder image built successfully"
fi

echo "🎉 All requested images built successfully at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# deploy
if [[ "$DEPLOY" == "true" ]]; then
    echo "🚀 Deploying to Kubernetes..."

    if ! command -v kubectl &> /dev/null; then
        echo "❌ kubectl not found. Please install kubectl to deploy to Kubernetes."
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        echo "❌ Not connected to a Kubernetes cluster. Please configure kubectl."
        exit 1
    fi

    echo "📦 Applying Kubernetes manifests..."

    kubectl apply -f "$PROJECT_HOME/k8s/app/postgres.yaml"
    echo "✅ PostgreSQL deployed"

    # seeder
    if [[ "$BUILD_SEEDER" == "true" ]]; then
        kubectl apply -f "$PROJECT_HOME/k8s/app/seeder-job.yaml"
        echo "✅ Database seeder job deployed"

        echo "⏳ Waiting for seeder job to complete..."
        kubectl wait --for=condition=complete job/db-seeder --timeout=300s || echo "⚠️  Seeder job may still be running"
    fi

    # backend
    if [[ "$BUILD_BACKEND" == "true" ]]; then
        kubectl apply -f "$PROJECT_HOME/k8s/app/backend.yaml"
        kubectl rollout restart deployment backend
        echo "✅ Backend deployed"
    fi

    # frontend
    if [[ "$BUILD_FRONTEND" == "true" ]]; then
        kubectl apply -f "$PROJECT_HOME/k8s/app/frontend.yaml"
        kubectl rollout restart deployment frontend
        echo "✅ Frontend deployed"
    fi

    kubectl apply -f "$PROJECT_HOME/k8s/app/ingress.yaml"
    echo "✅ Ingress deployed"

    echo "🎉 Deployment completed successfully!"
fi
