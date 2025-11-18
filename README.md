# Senior Care Platform – Testing Instructions

This document provides the exact steps required to start, deploy, and test the Senior Care Platform using a local **k3d-managed Kubernetes cluster**.

---

## 1. Purpose

These instructions define how the system should be tested—from environment setup to full functional verification of each module.

---

## 2. System Overview

The Senior Care Platform consists of the following microservices deployed on Kubernetes:

- **MongoDB** – database  
- **HiveMQ** – MQTT broker  
- **Notification Services** – in-app and push notifications  
- **AI Companion** – chatbot interaction  
- **Game Services** – engagement activities  
- **API Gateway** – central API router  
- **Frontend** – React web UI

---

## 3. Prerequisites

Ensure the test machine has:

- **Linux OS** (Arch-based preferred; supports linux/amd64 images)  
- **Docker** installed and running  
- **k3d** installed  
- **kubectl** installed  
- **make** installed  
- **Docker Buildx** (optional, only for building with `docker-bake.hcl`)  
- Internet access (to pull images)  
- Access to the project repository  

---

## 4. Initial Setup

### 4.1 Clone the Repository
```bash
git clone https://github.com/Clairerang/CSC3104_Cloud_Project_Grp25.git
cd CSC3104_Cloud_Project_Grp25/k3d
```

### 4.2 Verify Docker & k3d
```bash
docker ps
k3d version
```

## 5. Creating the Kubernetes Cluster

### 5.1 Create the cluster
```bash
make create
```

If make create fails (port in use / old cluster):
```bash
k3d cluster list
k3d cluster delete <cluster_name>
make create
```

### 5.2 Verify cluster
```bash
kubectl get nodes
kubectl get pods -A
```
Expected: All nodes Ready; only system pods running.

## 6. Deploy Application Components
Deploy all services
```bash
make deploy-all
```

## 7. Accessing the Frontend UI
Get node's ip
```bash
kubectl get nodes -A -owide
```
Open the app:
```bash
http://<node_ip>:30000
```
Expected: UI loads successfully.

## 8. Cleanup After Testing
```bash
make delete
# or
k3d cluster delete <cluster_name>

```
Verify:
```bash
k3d cluster list
```
Expected: No remaining clusters.