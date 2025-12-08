# MORPH — WordPress Starter Theme

A Docker-based local development environment for WordPress with Composer dependency management.

## Features

- 🐳 **Docker Compose** setup with WordPress, MariaDB, and phpMyAdmin
- 📦 **Composer** integration for plugin and theme management
- 🔧 **WP-CLI** support for command-line operations
- 🎨 **Morph Theme** - Pre-installed starter theme with component library
- 🧩 Ready-to-use UI components built with modern web standards
- 🎯 Pre-configured with essential plugins (ACF Pro, Polylang, etc.)
- 🚀 Optimized PHP configuration for development
- 📁 Clean project structure with separated wp-content components

## Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Composer](https://getcomposer.org/) (for plugin management)

## Project Structure

```
.
├── config/
│   └── php.ini                 # Custom PHP configuration
├── www/
│   ├── core/                   # WordPress core files (auto-generated)
│   ├── themes/                 # Custom themes
│   ├── plugins/                # Plugins (managed by Composer)
│   └── uploads/                # Media uploads
├── docker-compose.yml          # Docker services configuration
├── composer.json               # PHP dependencies
└── .env                        # Environment variables (create from _env.example)
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-directory>
```

### 2. Create environment file

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` and set your preferred values.

### 3. Install dependencies

Install WordPress plugins via Composer:

```bash
composer install
```

**Note:** For ACF Pro, you need to set up authentication. Create `auth.json`:

```json
{
  "http-basic": {
    "connect.advancedcustomfields.com": {
      "username": "YOUR_ACF_LICENSE_KEY",
      "password": "http://your-site.com"
    }
  }
}
```

### 4. Start Docker containers

```bash
docker-compose up -d
```

### 5. Install WordPress

Visit `http://localhost:8080` and follow the WordPress installation wizard, or use WP-CLI:

```bash
docker-compose run --rm wpcli core install \
  --url="http://localhost:8080" \
  --title="Morph Site" \
  --admin_user="admin" \
  --admin_password="admin" \
  --admin_email="admin@example.com"
```

## Usage

### Access Points

- **WordPress Site:** http://localhost:8000
- **phpMyAdmin:** http://localhost:8080 (only in dev profile)

### Start/Stop Containers

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Start with phpMyAdmin
docker-compose --profile dev up -d
```

### WP-CLI Commands

Execute WP-CLI commands using:

```bash
docker-compose run --rm wpcli <command>
```

Examples:

```bash
# List plugins
docker-compose run --rm wpcli plugin list

# Activate theme
docker-compose run --rm wpcli theme activate morph

# Export database
docker-compose run --rm wpcli db export backup.sql

# Update WordPress
docker-compose run --rm wpcli core update
```

### Managing Plugins

Add new plugins to `composer.json`:

```json
"require": {
  "wpackagist-plugin/plugin-name": "^version"
}
```

Then run:

```bash
composer update
```

## Pre-installed Plugins

- **ACF Pro** - Advanced Custom Fields
- **ACF Extended** - Extended functionality for ACF
- **Polylang** - Multilingual support
- **Cyr2Lat** - Cyrillic to Latin transliteration
- **Classic Editor** - Classic WordPress editor
- **Query Monitor** (dev only) - Debugging tool

## Morph Theme

The project includes the **Morph** starter theme - a comprehensive design system and component library built with modern web standards.

### Current Status

🚧 **In Active Development** - The design system and component library are being actively developed. Some components are production-ready, while others are still in progress.

## Development

### PHP Configuration

Custom PHP settings are in `config/php.ini`:

- Upload limit: 512MB
- Error display: Enabled
- Error reporting: E_ALL

### WordPress Debug Mode

Configure debug settings in `.env`:

```env
WP_DEBUG=true
WP_DEBUG_DISPLAY=true
```

### Database Access

Access MariaDB directly:

```bash
docker-compose exec db mysql -u wordpress -p
```

Or use phpMyAdmin at http://localhost:8080

## Backup & Restore

### Backup Database

```bash
docker-compose run --rm wpcli db export backup.sql
```

### Restore Database

```bash
docker-compose run --rm wpcli db import backup.sql
```

### Backup Files

```bash
tar -czf backup-files.tar.gz www/uploads www/themes
```

## Troubleshooting

### Port Already in Use

If ports 8000 or 8080 are already in use, change them in `.env`:

```env
WP_PORTS=8090:80
PMA_PORTS=8091:80
```

### File Permission Issues

Fix ownership if you encounter permission errors:

```bash
sudo chown -R www-data:www-data www/
```

### Reset Everything

To completely reset the installation:

```bash
docker-compose down -v
rm -rf www/core/*
composer install
docker-compose up -d
```

## License

This project structure is open source. WordPress and its plugins/themes have their own licenses.

---

**Note:** This is a development environment. Do not use in production without proper security hardening.
