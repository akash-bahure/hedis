# Infrastructure

This directory contains all Kubernetes infrastructure as code, managed via **Kustomize** and deployed via **ArgoCD**.

## Directory Layout

```
infra/
└── k8s/
    ├── apps/
    │   ├── core-api/
    │   │   ├── base/               # Base manifests (env-agnostic)
    │   │   └── overlays/
    │   │       ├── dev/            # Dev environment overrides
    │   │       ├── qa/             # QA environment overrides
    │   │       ├── stage/          # Staging environment overrides
    │   │       └── prod/           # Production overrides
    │   └── web/
    │       ├── base/
    │       └── overlays/{dev,qa,stage,prod}/
    ├── environments/
    │   ├── dev/kustomization.yaml   # Composes apps for dev
    │   ├── qa/kustomization.yaml
    │   ├── stage/kustomization.yaml
    │   └── prod/kustomization.yaml
    └── platform/
        ├── openbao/                 # Secrets management (OpenBao/Vault fork)
        └── external-secrets/       # External Secrets Operator
```

## Base vs Overlay Pattern

**Base** manifests define resources that are common across all environments:
- Deployments, Services, StatefulSets, PVCs
- Image names (overridden per environment by Kustomize `images:` patches)

**Overlays** contain environment-specific customizations:
- Namespace
- ConfigMaps (environment variables)
- Ingress rules and TLS certificates
- ExternalSecrets (pointing to the right KV path in OpenBao)
- Image tags
- Replica counts and resource limits (optional patches)

## Platform Components

### OpenBao (Secrets Management)

OpenBao is an open-source fork of HashiCorp Vault used to store secrets.

**Installation** (via ArgoCD Helm app — see `clusters/your-cluster/openbao-app.yaml`):
```bash
helm repo add openbao https://openbao.github.io/openbao
helm install openbao openbao/openbao -n openbao \
  -f infra/k8s/platform/openbao/values.yaml
```

**Initial setup** (run once after install):
```bash
# Initialize
kubectl exec -n openbao openbao-0 -- bao operator init

# Unseal (repeat 3x with different unseal keys)
kubectl exec -n openbao openbao-0 -- bao operator unseal <unseal-key>

# Enable KV v2
kubectl exec -n openbao openbao-0 -- bao secrets enable -path=kv kv-v2

# Enable Kubernetes auth
kubectl exec -n openbao openbao-0 -- bao auth enable kubernetes

# Configure Kubernetes auth
kubectl exec -n openbao openbao-0 -- bao write auth/kubernetes/config \
  kubernetes_host="https://kubernetes.default.svc"

# Create policy for External Secrets Operator
kubectl exec -n openbao openbao-0 -- bao policy write eso-read - <<EOF
path "kv/data/core-api/*" { capabilities = ["read"] }
path "kv/data/ghcr/*"     { capabilities = ["read"] }
EOF

# Create role for the ESO service account
kubectl exec -n openbao openbao-0 -- bao write auth/kubernetes/role/eso-read \
  bound_service_account_names=openbao-auth \
  bound_service_account_namespaces=external-secrets \
  policies=eso-read \
  ttl=1h
```

**Populate secrets** (for each environment):
```bash
# Core API secrets
kubectl exec -n openbao openbao-0 -- bao kv put kv/core-api/dev \
  DJANGO_SECRET_KEY="your-secret-key" \
  POSTGRES_USER="myapp" \
  POSTGRES_PASSWORD="your-password" \
  POSTGRES_DB="myapp" \
  CELERY_FLOWER_USER="admin" \
  CELERY_FLOWER_PASSWORD="your-flower-password" \
  SENTRY_DSN="https://your-sentry-dsn"

# GHCR pull secret
kubectl exec -n openbao openbao-0 -- bao kv put kv/ghcr/dev \
  dockerconfigjson="$(cat ~/.docker/config.json | base64 -w0)"
```

### External Secrets Operator

Automatically syncs secrets from OpenBao into Kubernetes Secrets.

**Installation** (via ArgoCD Helm app):
```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace \
  -f infra/k8s/platform/external-secrets/values.yaml
```

After install, apply the ClusterSecretStore:
```bash
kubectl apply -f infra/k8s/platform/external-secrets/manifests/
```

## Applying Manifests Manually (without ArgoCD)

```bash
# Apply an environment
kubectl apply -k infra/k8s/environments/dev

# Apply just core-api in dev
kubectl apply -k infra/k8s/apps/core-api/overlays/dev
```

## Namespace Convention

| Namespace | Purpose |
|---|---|
| `dev` | Development environment |
| `qa` | QA / testing |
| `stage` | Staging (production mirror) |
| `prod` | Production |
| `argocd` | ArgoCD control plane |
| `openbao` | OpenBao secrets manager |
| `external-secrets` | External Secrets Operator |
| `cert-manager` | cert-manager (TLS automation) |
