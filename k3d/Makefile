CLUSTER_NAME := senior-care
CONFIG_FILE := ./k3d-config.yaml

# Paths
MONGODB_INIT_PATH := ../database/mongo-init/01-init-all.js
BACKEND_ENV_PATH := ../backend/config/secrets/.env
FIREBASE_SA_PATH := ../backend/config/secrets/firebase-sa.json

# Namespaces Variables
WEB_NS        := senior-care-web
API_NS        := senior-care-api
DB_NS         := senior-care-db
HIVEMQ_NS     := senior-care-hivemq
NOTIF_NS      := senior-care-notification
AI_NS         := senior-care-ai-companion
GAMES_NS      := senior-care-games

.PHONY: create delete restart status \
        deploy-all deploy-all-delete \
        ui-deploy ui-deploy-delete \
        api-deploy api-deploy-delete \
        mongo-deploy mongo-deploy-delete \
        hivemq-deploy hivemq-deploy-delete \
        notification-deploy notification-deploy-delete \
        push-notification-deploy push-notification-deploy-delete \
        ai-companion-deploy ai-companion-deploy-delete \
        games-service-deploy games-service-deploy-delete


# Helper functions

# Ensure a namespace exists (idempotent)
define ensure-namespace
	@if ! kubectl get namespace $(1) >/dev/null 2>&1; then \
		echo "🔧 Namespace '$(1)' does not exist. Creating..."; \
		kubectl create namespace $(1); \
	else \
		echo "✅ Namespace '$(1)' already exists"; \
	fi
endef

# Safely delete a namespace if it exists
define delete-namespace
	@echo "🧹 Deleting namespace '$(1)' (if it exists)..."; \
	kubectl delete namespace $(1) --ignore-not-found=true
endef

# Wait for all pods in a namespace to be Ready
define wait-for
	@echo "⏳ Waiting for all pods in namespace '$(1)' to be Ready..."
	@kubectl wait --for=condition=ready pod --all -n $(1) --timeout=180s 2>/dev/null || \
		echo "⚠️ Timeout or no pods found in namespace '$(1)'. Continuing..."
endef


# Cluster lifecycle
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
	- kubectl get nodes -o wide || echo "Cluster not running"


# High-level deploy orchestration
deploy-all:
	@$(MAKE) mongo-deploy
	$(call wait-for,$(DB_NS))

	@$(MAKE) hivemq-deploy
	$(call wait-for,$(HIVEMQ_NS))

	@$(MAKE) notification-deploy
	$(call wait-for,$(NOTIF_NS))

# 	@$(MAKE) push-notification-deploy
# 	$(call wait-for,$(NOTIF_NS))

	@$(MAKE) ai-companion-deploy
	$(call wait-for,$(AI_NS))

	@$(MAKE) games-service-deploy
	$(call wait-for,$(GAMES_NS))

	@$(MAKE) api-deploy
	$(call wait-for,$(API_NS))

	@$(MAKE) ui-deploy
	$(call wait-for,$(WEB_NS))


deploy-all-delete:
	$(MAKE) ui-deploy-delete
	$(MAKE) api-deploy-delete
	$(MAKE) games-service-deploy-delete
	$(MAKE) ai-companion-deploy-delete
# 	$(MAKE) push-notification-deploy-delete
	$(MAKE) notification-deploy-delete
	$(MAKE) hivemq-deploy-delete
	$(MAKE) mongo-deploy-delete


# UI / Frontend
ui-deploy:
	$(call ensure-namespace,$(WEB_NS))
	kubectl apply -f ./frontend/

ui-deploy-delete:
	$(call delete-namespace,$(WEB_NS))


# API Gateway
api-deploy:
	$(call ensure-namespace,$(API_NS))
	kubectl apply -f ./api-gateway/

api-deploy-delete:
	$(call delete-namespace,$(API_NS))


# MongoDB
mongo-deploy:
	$(call ensure-namespace,$(DB_NS))

	kubectl create configmap mongo-init \
		--from-file=01-init-all.js=$(MONGODB_INIT_PATH) \
		-n $(DB_NS) \
		--dry-run=client -o yaml | kubectl apply -f -

	kubectl apply -f ./mongodb/

mongo-deploy-delete:
	$(call delete-namespace,$(DB_NS))


# HiveMQ
hivemq-deploy:
	$(call ensure-namespace,$(HIVEMQ_NS))
	kubectl apply -f ./hivemq/

hivemq-deploy-delete:
	$(call delete-namespace,$(HIVEMQ_NS))


# Notification Service (HTTP / gRPC)
notification-deploy:
	$(call ensure-namespace,$(NOTIF_NS))

	# Make backend-env secret idempotent
	kubectl create secret generic backend-env \
		--from-env-file=$(BACKEND_ENV_PATH) \
		-n $(NOTIF_NS) \
		--dry-run=client -o yaml | kubectl apply -f -

	# Make firebase-sa secret idempotent
	kubectl create secret generic firebase-sa \
		--from-file=firebase-sa.json=$(FIREBASE_SA_PATH) \
		-n $(NOTIF_NS) \
		--dry-run=client -o yaml | kubectl apply -f -

	kubectl apply -f ./notifications/notification-service

notification-deploy-delete:
	$(call delete-namespace,$(NOTIF_NS))


# Push Notification Service (Firebase FCM)
# push-notification-deploy:
# 	$(call ensure-namespace,$(NOTIF_NS))

# 	# Make firebase-sa secret idempotent
# 	kubectl create secret generic firebase-sa \
# 		--from-file=firebase-sa.json=$(FIREBASE_SA_PATH) \
# 		-n $(NOTIF_NS) \
# 		--dry-run=client -o yaml | kubectl apply -f -

# 	kubectl apply -f ./notifications/push-notification

# push-notification-deploy-delete:
# 	- kubectl delete -f ./notifications/push-notification -n $(NOTIF_NS) --ignore-not-found=true
# 	- kubectl delete secret firebase-sa -n $(NOTIF_NS) --ignore-not-found=true


# AI Companion
ai-companion-deploy:
	$(call ensure-namespace,$(AI_NS))

	kubectl create secret generic backend-env \
		--from-env-file=$(BACKEND_ENV_PATH) \
		-n $(AI_NS) \
		--dry-run=client -o yaml | kubectl apply -f -

	kubectl apply -f ./ai-companion

ai-companion-deploy-delete:
	$(call delete-namespace,$(AI_NS))


# Games Service
games-service-deploy:
	$(call ensure-namespace,$(GAMES_NS))
	kubectl apply -f ./games-service

games-service-deploy-delete:
	$(call delete-namespace,$(GAMES_NS))
