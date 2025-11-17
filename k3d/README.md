# k3d Local Kubernetes Cluster Setup

This repository contains the setup instructions and configuration files for a **local kubernetes cluster** using [k3d](https://k3d.io/). It is designed to provide an **easy and reproducible environment** for development and testing microservices within a single VM.

## Overview

This setup includes:
* **Pre-configured VM** with Docker, k3d, and kubectl installed
* **Makefile** with automation commands
* **k3d cluster configuration** (ports, agents, registries)
* **Deployment manifests** for all microservices
* **Standardised startup procedure & debugging guide**

## File Structure

```plaintext
.
├── k3d/
│   ├── Makefile
│   ├── k3d-config.yaml
│   ├── README.md
│   ├── ai-companion/        # AI Companion microservice manifests
│   ├── api-gateway/         # API Gateway manifests
│   ├── frontend/            # Frontend deployment manifests
│   ├── games-service/       # Game Services manifests
│   ├── hivemq/              # HiveMQ broker manifests
│   ├── mongodb/             # MongoDB manifests
│   └── notifications/       # Notification Services manifests
└── README.md                # Project root documentation
```

## VM Information

The VM ova can be found in the OneDrive, the file name is `csc3104-cloud-proj.ova`. Download the file and imported into VirtualBox or any compatible hypervisor. The credentials to log in can be found in the table below.

| Detail | Description |
|--------|--------------|
| **VM Platform** | VirtualBox |
| **Username** | cadmin |
| **Password** | cadmin3104 |
| **OS** | Ubuntu Server (preloaded with Docker, k3d, kubectl) |

Note: To code and push your codes to github using Visual Studio Code in this VM, you will need to download `code` package.

## VM Installation for Apple Users

1. brew install qemu

2. Convert the VDI to QCOW2
```bash
qemu-img convert -f vdi -O qcow2 /path/to/your/file.vdi /path/to/output/file.qcow2
```
3. Import to UTM (Install the UTM from the website)

4. Select Create New VM > Emulate > Others

5. Under Hardware, Default Configurations > CPU Core (set to 8)

6. Under Others, Boot Device (Drive Image) > Import the converted file > Uncheck UEFI Boot

7. Press Continue and Start Up

8. Loading should take no more than 3mins under a 8 core set up. There will be slight lags here and there it is normal for Mac Users


## Kubernetes Cluster Setup

### Start the cluster
1. Clone the repository
```bash
git clone https://github.com/Clairerang/CSC3104_Cloud_Project_Grp25.git
```

2. Change directory to `k3d`
```bash
cd k3d
```

3. Create the cluster
```bash
make create
```

This uses the `k3d-config.yaml` file to create the cluster.

### Check cluster status

```bash
kubectl get nodes
kubectl get pods -A
```

---

## Deployment Order (VERY IMPORTANT)

To avoid dependency and connection issues, deploy services in the following order — **wait for each to be fully Running before deploying the next**:

1. **MongoDB / HiveMQ**
2. **Notification Services**
3. **AI Companion Service**
4. **Game Services**
5. **API Gateway**
6. **Frontend Application**

Refer to Makefile for spin up commands
---

## Debugging & Useful Commands

### View logs

```bash
kubectl logs <pod_name> -n <namespace>
```

### Exec into a pod

```bash
kubectl exec -it <pod_name> -n <namespace> -- sh
```

For MongoDB:

```bash
kubectl exec -it <mongo_pod> -n <namespace> -- mongosh
```

### Watch pod changes

```bash
watch kubectl get pods -n <namespace>
```

---

## Building Container Images (Linux/ARM Support)

Before using `docker buildx`, ensure the builder is installed and created.

### Build & Push Using buildx bake

```bash
docker buildx bake <target_name> --no-cache --push
```

This is required for building **multi-architecture images**, especially when deploying to ARM-based Kubernetes nodes.

---
## Quick Start
1. Clone the repository
```bash
git clone https://github.com/Clairerang/CSC3104_Cloud_Project_Grp25.git
```
2. Change directory to `k3d`
```bash
cd k3d
```
3. Create the cluster
```bash
make create
```
This will use the provided `k3d-config.yaml` to spin up the cluster.

4. Verify cluster status
```bash
make status
# or manually
kubectl get nodes
kubectl get pods -A
```

## Example Commands
Create the cluster
```bash
make create
```
Check cluster status
```bash
make status
```
Restart the cluster
```bash
make restart
```
Delete the cluster
```bash
make delete
```