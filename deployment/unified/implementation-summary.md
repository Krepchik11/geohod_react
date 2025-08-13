# Unified Deployment Implementation Summary

This document summarizes the implementation plan for the unified deployment approach that resolves the port conflict issue between dev and prod environments.

## Problem Statement

Both dev and prod environments attempt to bind to ports 80 and 443 on the host server, which creates a conflict since only one process can bind to each port.

## Solution Overview

The recommended solution is to use a single nginx instance with multiple server blocks that handles both domains (`dev.geohod.ru` and `app.geohod.ru`) on the same server.

## Implementation Files to Create

### 1. Nginx Configuration (`deployment/unified/nginx.conf`)

A unified nginx configuration that includes:
- Shared http configuration block with common settings
- Separate server blocks for `dev.geohod.ru` (port 80 redirect to 443)
- Separate server blocks for `app.geohod.ru` (port 80 redirect to 443)
- Separate HTTPS server blocks for both domains with their respective SSL certificates
- Different root directories for each environment

### 2. Podman Compose File (`deployment/unified/podman-compose.yml`)

A single podman-compose file that:
- Runs one nginx instance
- Mounts both certificate volumes
- Mounts both frontend build directories (dist folders)
- Exposes ports 80 and 443 to the host
- Connects to both dev and prod networks

### 3. Certificate Management Script (`deployment/unified/certbot.sh`)

A unified certbot script that:
- Handles certificate creation for both domains
- Uses separate certificate volumes for each domain
- Maintains the existing separation of certificates

### 4. Installation Script (`deployment/unified/install.sh`)

An updated installation script that:
- Sets up both networks if they don't exist
- Runs the unified certbot script
- Installs and starts the unified systemd service

### 5. Systemd Service File (`deployment/unified/frontend-app-unified.service`)

A unified systemd service that:
- Manages the single deployment
- Uses the unified podman-compose file

### 6. Setup Documentation (`deployment/unified/setup.md`)

Updated documentation that:
- Explains the unified deployment process
- Provides instructions for setting up the unified deployment

## Implementation Steps

1. Create the unified directory: `deployment/unified/`
2. Create all the configuration files listed above
3. Test the unified deployment in isolation
4. Update CI/CD pipelines to use the unified deployment
5. Migrate traffic from the separate deployments to the unified deployment
6. Decommission the separate deployments once the unified deployment is stable

## Benefits of This Approach

1. Resolves port conflicts completely
2. More efficient resource usage
3. Easier to manage and monitor
4. Standard practice in web hosting
5. Maintains environment separation at the application level
6. Simplified certificate management

## Migration Process

1. Implement the unified deployment alongside existing deployments
2. Test both domains work correctly in the unified setup
3. Once validated, switch DNS or load balancer to point to the new setup
4. Decommission the old separate deployments

This approach maintains the benefits of having separate environments while resolving the port conflict issue in a standard, professional way.