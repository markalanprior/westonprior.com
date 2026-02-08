# Deploying an App to the VPS!

  

This guide explains how to deploy an app from GitHub to your Hetzner VPS using GitHub Actions, Docker Compose, and one global Caddyfile.

  

The VPS IP is **157.180.64.82**.

Unless otherwise stated, all apps will use the domain markalanprior.com, so the full URL should be <appname>.markalanprior.com
  

---

  

## Summary of the Deployment Flow

  

1. Prepare the VPS

2. Configure GitHub Secrets

3. Choose a free port

4. Create the GitHub Actions workflow

5. Create the docker compose file

6. Update the global Caddyfile

7. Push code and test

  

---

  

# 1. Prepare the VPS

  

## 1.1 Create the destination folder

  

```bash

mkdir -p /home/mark/APP_NAME

```

  

**Critical Step:** Ensure `mark` owns the directory:

```bash

sudo chown -R mark:mark /home/mark/APP_NAME

```

  

## 1.2 Choose a Free Port for the App

  

### A List all active ports

  

```bash

ss -tulpn

```

  

### B Choose a port in the 4000 to 4999 range

  

Check availability:

  

```bash

ss -tulpn | grep 4000

```

  

If no output, the port is free.

If busy, try 4001, 4002, and so on.

  

### C Record your choice

  

**Tip:** Keep a list of used ports (e.g., in a `PORTS.md` file) to avoid collisions later.

  

This port will be used in both docker compose and the Caddyfile.

  

---

  

## 1.3 Get the deploy keypair from the VPS

  

### A Select Key

  

You will use the following key:

  

/home/mark/.ssh/id_ed25519

  

It is already authorized as "deploy"

  

### C. Print the private key

  

```bash

cat /home/mark/.ssh/id_ed25519

```

  

Copy the entire private key block (including BEGIN and END lines).

This will become your `VPS_SSH_KEY` GitHub secret.

  

---

  

# 2. CURSOR LOCAL: Create the GitHub Actions deploy workflow file deploy.yml

  

Cursor must generate this file: `.github/workflows/deploy.yml`

  

The workflow must follow these rules to avoid common permission and pathing errors:

  

## 2.1 Metadata and triggers

  

Run on push to main (or master).

Allow manual workflow dispatch.

  

## 2.2 Job setup

  

Use `ubuntu-latest`.

  

## 2.3 Step 1: Checkout

  

Use `actions/checkout@v4`.

  

## 2.4 Step 2: Prepare files (Exclude .git)

  

To avoid "permission denied" errors on .git objects, move files to a temp folder and exclude .git.

  

```yaml

      - name: Prepare files for deployment

        run: |

          mkdir -p deploy-temp

          rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.github' --exclude='*.log' --exclude='.DS_Store' ./ deploy-temp/

```

  

## 2.5 Step 3: Upload app files to the VPS

  

Use `appleboy/scp-action@master` with `strip_components: 1` to upload the contents of `deploy-temp` directly to the target folder.

  

```yaml

      - name: Upload app files to VPS

        uses: appleboy/scp-action@master

        with:

          host: ${{ secrets.VPS_HOST }}

          username: ${{ secrets.VPS_USER }}

          key: ${{ secrets.VPS_SSH_KEY }}

          source: "deploy-temp/"

          target: ${{ secrets.VPS_APP_PATH }}

          overwrite: true

          strip_components: 1

```

  

## 2.6 Step 4: SSH into the VPS and deploy

  

Use `appleboy/ssh-action@master`. Pass the secret path as an env var.

  

```yaml

      - name: SSH into VPS and deploy

        uses: appleboy/ssh-action@master

        with:

          host: ${{ secrets.VPS_HOST }}

          username: ${{ secrets.VPS_USER }}

          key: ${{ secrets.VPS_SSH_KEY }}

          envs: VPS_APP_PATH

          script: |

            cd $VPS_APP_PATH

            docker compose down

            docker compose up -d --build

        env:

          VPS_APP_PATH: ${{ secrets.VPS_APP_PATH }}

```

  

## 2.7 YAML rules

  

Two space indentation.

No tabs.

Filename must be `deploy.yml`.

  

---

  

# 3. CURSOR LOCAL: Create docker-compose.yml

  

Cursor must generate `docker-compose.yml` in the project root with these rules:

  

- Service name must match the repo or app directory.

- Build from the current directory.

- Expose exactly one port:

  

```yaml

services:

  app-name:

    build:

      context: .

      dockerfile: Dockerfile

    ports:

      - "PORT:3000"

    restart: always

    # Uncomment if using env vars:

    # env_file:

    #   - .env

```

  

- **Do NOT** include `version: '3.8'` (obsolete).

- **Do NOT** include `env_file:` unless you are certain an .env file exists on the VPS (see Section 3.1).

- Ask the user for port (from Section 1).

- No ports 80 or 443.

- No Caddy config.

- No volumes unless required.

  

## 3.1 Managing Environment Variables (Optional)

  

If your app needs secrets (DB URLs, API Keys):

  

1.  SSH into the VPS.

2.  Create the file manually:

    ```bash

    nano /home/mark/APP_NAME/.env

    ```

3.  Add your variables (`KEY=value`).

4.  Uncomment the `env_file` section in `docker-compose.yml`.

  

---

  

# 4. CURSOR LOCAL: Commit and Push latest code to Github

  

The first push will fail if secrets aren't set, which is expected.

  

---

  

# 5. GITHUB: Configure Secrets

  

Add these secrets to your GitHub repo settings:

  

**VPS_HOST**

`157.180.64.82`

  

**VPS_USER**

`mark`

  

**VPS_APP_PATH**

`/home/mark/APP_NAME`

  

**VPS_SSH_KEY**

Paste the private key from step 1.3.

  

---

  

# 6. VPS: Update the Global Caddyfile

  

All routing lives in:

`/etc/caddy/Caddyfile`

  

## 6.1 Open the file

  

```bash

nano /etc/caddy/Caddyfile

```

  

## 6.2 Add a routing block

  

Choose one of the following patterns:

  

**Option A: Standard (handle www and root same way)**

  

```caddy

markalanprior.com, www.markalanprior.com {

    reverse_proxy 127.0.0.1:PORT

}

```

  

**Option B: Redirect www to root (Recommended)**

  

```caddy

www.markalanprior.com {

    redir https://markalanprior.com{uri}

}

  

markalanprior.com {

    reverse_proxy 127.0.0.1:PORT

}

```

  

Replace the domain and PORT.

  

## 6.3 Reload Caddy

  

```bash

systemctl reload caddy

```

  

---

  

# 7. Push Code and Test

  

## 7.1 Push code to Git again

  

This triggers `deploy.yml`.

  

## 7.2 Verify GitHub Actions succeeded

  

You should see green steps.

  

## 7.3 Verify the container

  

```bash

# Check status

docker ps

  

# Follow logs

docker compose logs -f

```

  

## 7.4 Test your domain

  

```bash

curl -I https://yourapp.example.com

```

  

# 8. Configure Cloudflare DNS!

  

## 8.1 Create an A record

  

In Cloudflare DNS settings:

  

Type: A

Name: app (or subdomain)

Value: 157.180.64.82

Proxy status: DNS only (gray cloud) initially, then orange cloud.

  

## 8.2 Verify DNS resolution

  

```bash

nslookup yourapp.example.com

```

  

You should see 157.180.64.82 returned.