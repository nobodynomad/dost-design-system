# DOST — страница фургона и дизайн-система

[Скачать страницу одним HTML-файлом](https://github.com/nobodynomad/dost-design-system/releases/latest/download/dost-model-standalone.html). Откройте скачанный файл в браузере. Фотографии, шрифты, меню и вкладки работают без интернета. В автономной копии заявки на звонок не отправляются.

Для просмотра полной версии с приёмом заявок запустите проект на своём компьютере.

```sh
git clone https://github.com/nobodynomad/dost-design-system.git
cd dost-design-system
python3 scripts/preview.py
```

Откройте [страницу фургона](http://127.0.0.1:4173/dost-model.html), [дизайн-систему](http://127.0.0.1:4173/design-system.html) или [шкалу типографики](http://127.0.0.1:4173/typography.html). Заявки сохраняются в локальной базе на компьютере, где запущен сервер. Команда `python3 scripts/export_model.py` обновляет автономный HTML после правок.

Проект основан на [MORPH WordPress Starter Theme](https://github.com/arthursatarov/morph-wp-starter-theme). Инструкции для разработки темы приведены ниже.

## MORPH — WordPress Starter Theme

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

### DOST design system

From the repository root, run `python3 scripts/preview.py` and open `http://127.0.0.1:4173/design-system.html` to view the DOST brand and Morph components without WordPress. The DOST color tokens, Bounded fonts, logos, and patterns are also available in `www/themes/morph/src` for use in the theme.

All pages and components use the local Microsoft Fluent icon set from [Fluenticons](https://github.com/coltongriffith/fluenticons). The 100 selected SVGs, pinned source version, license and rules for adding icons are in `www/themes/morph/src/images/icons`. Use the existing `.icon` component and shared `assets/images/sprite.svg`; the gallery is at `design-system.html#icons`. Regular is the default, with Filled for feedback states. The icons load locally without a CDN dependency.

Open `dost-model.html` to preview the vehicle model page. The brochure button demonstrates the pressed state. Vehicle imagery and specifications in this prototype are for design review. Cabin height is an estimate.

The local model preview accepts callback requests at `POST /api/callback`. To review submitted names and phone numbers on the Mac, run `sqlite3 -header -column ~/.local/share/dost-model/callbacks.sqlite3 'SELECT received_at, name, phone FROM callbacks ORDER BY id DESC'`. The database is outside the web directory.

Open `typography.html` for the shared typography scale. Its examples and measurements read the same styles as the model page and component guide; there is no separate page-specific scale or manually maintained size snapshot.

For every new DOST page, load `www/themes/morph/assets/styles/main.css` and use the existing semantic styles. `h1`, `h2`, `h3`, and body text already map to `display`, `title`, `heading`, and `body`. The reusable classes are `text-display`, `text-title`, `text-heading`, `text-metric`, `text-body`, `text-body-small`, `text-label`, `text-caption`, and `text-control`. Use `text-numeric` for numeric values. Existing Morph buttons, tabs, tables, and form controls use these same roles.

The only source of typography values is `www/themes/morph/src/styles/abstracts/tokens/_typography.scss`. Each role pairs size, weight, unitless line-height, and tracking. Change a role there and rebuild; do not introduce independent font sizes or weights in page styles. Legacy `font-size` tokens are compatibility aliases to this scale.

Bounded intentionally uses Light (300) for body copy and table values because of its dense letterforms; this is an explicit user-approved exception to the general small-text weight recommendation. Regular (400) is used for labels, controls, metrics, and internal headings. Semibold (600) is reserved for the page title and section titles. Desktop, tablet, and mobile typography breakpoints are 1200px and 760px at the default browser font size; sizes are stored in rem and stop growing on large screens.

The page body and eight images in `model-assets/vehicle/` were adapted from the local `volvodsDOST` project. It uses the current Morph/DOST styles, buttons and tabs; the existing header and footer remain in place. Content is capped at 1440px, while the hero background spans the viewport.

After changing theme assets, run `npm run build` and `npm test` in `www/themes/morph`. All three HTML pages load the built theme stylesheet directly. Embedded logo and pattern previews in `design-system.html` still need updating if the brand artwork changes.

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
