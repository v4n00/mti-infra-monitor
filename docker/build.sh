#!/bin/bash
docker build -t ecommerce-backend -f ./Dockerfile.backend ../backend
docker build -t ecommerce-frontend -f ./Dockerfile.frontend ../frontend
echo "Images built."
