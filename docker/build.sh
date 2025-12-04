#!/bin/bash
docker build --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" -t ecommerce-backend -f ./Dockerfile.backend ../backend
docker build -t ecommerce-frontend -f ./Dockerfile.frontend ../frontend
docker build -t ecommerce-seeder -f ./Dockerfile.seeder ../backend
echo "Images built at $(date -u +%Y-%m-%dT%H:%M:%SZ)."
