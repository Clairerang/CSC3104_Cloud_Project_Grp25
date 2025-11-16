CLUSTER_NAME := senior-care
CONFIG_FILE := ./k3d-config.yaml

MONGODB_INIT_PATH := ../database/mongo-init/01-init-all.js
BACKEND_ENV_PATH := ../backend/config/secrets/.env

.PHONY: create delete restart status

create:
	@echo "Creating k3d cluster: $(CLUSTER_NAME)"
	k3d cluster create --config $(CONFIG_FILE)

delete:
	@echo "Deleting k3d cluster: $(CLUSTER_NAME)"
	k3d cluster delete $(CLUSTER_NAME)

restart: delete create

status:
	@echo "k3d clusters:"
	k3d cluster list
	@echo "\nkubectl nodes:"
	-kubectl get nodes -o wide || echo "Cluster not running"

deploy-all: ui-deploy mongo-deploy hivemq-deploy

deploy-all-delete: ui-deploy-delete mongo-deploy-delete hivemq-deploy-delete

ui-deploy:
	kubectl create namespace senior-care-web

	kubectl apply -f ./frontend/

ui-deploy-delete:
	kubectl delete namespace senior-care-web

api-deploy:
	kubectl create namespace senior-care-api

	kubectl apply -f ./api-gateway/

api-deploy-delete:
	kubectl delete namespace senior-care-api

mongo-deploy:
	kubectl create namespace senior-care-db

	kubectl create configmap mongo-init \
	--from-file=01-init-all.js=$(MONGODB_INIT_PATH) \
	-n senior-care-db \
	--dry-run=client -o yaml | kubectl apply -f -

	kubectl apply -f ./mongodb/

mongo-deploy-delete:
	kubectl delete namespace senior-care-db

hivemq-deploy:
	kubectl create namespace senior-care-hivemq

	kubectl apply -f ./hivemq/

hivemq-deploy-delete:
	kubectl delete namespace senior-care-hivemq

notification-deploy:
	kubectl create namespace senior-care-notification

	kubectl create secret generic backend-env \
	--from-env-file=${BACKEND_ENV_PATH} \
  	-n senior-care-notification

	kubectl apply -f ./notifications/notification-service

notification-deploy-delete:
	kubectl delete namespace senior-care-notification

push-notification-deploy:

	kubectl apply -f ./notifications/push-notification

push-notification-deploy-delete:

	kubectl delete service push-notification-service -n senior-care-notification

	kubectl delete deployment push-notification-service -n senior-care-notification

ai-companion-deploy:
	kubectl create namespace senior-care-ai-companion

	kubectl create secret generic backend-env \
	--from-env-file=${BACKEND_ENV_PATH} \
  	-n senior-care-ai-companion

	kubectl apply -f ./ai-companion

ai-companion-deploy-delete:
	kubectl delete namespace senior-care-ai-companion

games-service-deploy:
	kubectl create namespace senior-care-games

	kubectl apply -f ./games-service

games-service-deploy-delete:
	kubectl delete namespace senior-care-games