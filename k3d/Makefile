CLUSTER_NAME := senior-care
CONFIG_FILE := ./k3d-config.yaml

MONGODB_INIT_PATH := ../database/mongo-init/01-init-all.js

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

	kubectl apply -f ./api-gateway/
	sleep 60
	kubectl apply -f ./frontend/

ui-deploy-delete:
	kubectl delete namespace senior-care-web

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