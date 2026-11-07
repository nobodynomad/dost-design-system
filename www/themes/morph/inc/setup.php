<?php
/**
 * Theme Setup and Core Functionality
 *
 * @package MORPH
 * @since 0.0.1
 */

// Prevent direct file access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*=======================================================
Table of Contents
–––––––––––––––––––––––––––––––––––––––––––––––––––––––––
	1.0 THEME SETTINGS
		1.1 Register menus
		1.2 Theme support
		1.3 Head cleanup / optimization
	2.0 THEME ASSETS
		2.1 Enqueue styles/scripts
		2.2 Preload local hosted fonts
		2.3 Enqueue Google fonts
=======================================================*/

/*=======================================================
	1.0 THEME SETTINGS
=======================================================*/

/* 1.1 REGISTER MENUS
/––––––––––––––––––––––––-------------*/
/**
 * Registers navigation menus.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_register_menus() {
	register_nav_menus(
		array(
			'header_menu' => esc_html__( 'Header menu', 'morph' ),
			'footer_menu' => esc_html__( 'Footer menu', 'morph' ),
		)
	);
}
add_action( 'after_setup_theme', 'morph_register_menus' );

/* 1.2 THEME SUPPORT
/––––––––––––––––––––––––-------------*/
/**
 * Adds theme support for various WordPress features.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_theme_support() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);
}
add_action( 'after_setup_theme', 'morph_theme_support' );

/* 1.3 HEAD CLEANUP / OPTIMIZATION
/––––––––––––––––––––––––-------------*/
/**
 * Removes unnecessary elements from wp_head for optimization.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_wphead_cleanup() {
	// Remove the generator meta tag
	remove_action( 'wp_head', 'wp_generator' );
	// Remove wlwmanifest link
	remove_action( 'wp_head', 'wlwmanifest_link' );
	// Remove RSD API connection
	remove_action( 'wp_head', 'rsd_link' );
	// Remove wp shortlink support
	remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	// Remove next/previous links (this is not affecting blog-posts)
	remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10 );
	// Remove generator name from RSS
	add_filter( 'the_generator', '__return_false' );
	// Disable emoji support
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	// Disable automatic feeds
	remove_action( 'wp_head', 'feed_links_extra', 3 );
	remove_action( 'wp_head', 'feed_links', 2 );
	// Remove rest API link
	remove_action( 'wp_head', 'rest_output_link_wp_head', 10 );
	// Remove oEmbed link
	remove_action( 'wp_head', 'wp_oembed_add_discovery_links', 10 );
	remove_action( 'wp_head', 'wp_oembed_add_host_js' );
}
add_action( 'after_setup_theme', 'morph_wphead_cleanup' );

/*=======================================================
	2.0 THEME ASSETS
=======================================================*/

/* 2.1 ENQUEUE STYLES/SCRIPTS
/––––––––––––––––––––––––-------------*/
/**
 * Enqueues theme styles and scripts.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_enqueue_scripts() {
	// jQuery
	wp_deregister_script( 'jquery' );
	wp_register_script( 'jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js', [], '3.7.1' );
	wp_enqueue_script( 'jquery' );

	// Theme scripts/styles
	wp_enqueue_script( 'morph', MORPH_SCRIPTS_URI . '/main.js', [], MORPH_THEME_VERSION, true );
	wp_enqueue_style( 'morph', MORPH_STYLES_URI . '/main.css', [], MORPH_THEME_VERSION, 'all' );
}
add_action( 'wp_enqueue_scripts', 'morph_enqueue_scripts' );

/* 2.2 PRELOAD LOCAL HOSTED FONTS
/––––––––––––––––––––––––-------------*/
/**
 * Preloads local hosted fonts for better performance.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_preload_local_fonts() {
	$fonts = [
		// 'Inter' => [ 'woff2' ],
	];

	if ( empty( $fonts ) ) {
		return;
	}

	foreach ( $fonts as $name => $formats ) {
		foreach ( $formats as $format ) {
			$font_url = MORPH_FONTS_URI . '/' . $name . '.' . $format;

			printf(
				'<link rel="preload" href="%s" as="font" type="font/%s" crossorigin>' . PHP_EOL,
				esc_url( $font_url ),
				esc_attr( $format )
			);
		}
	}
}
add_action( 'wp_head', 'morph_preload_local_fonts', 1 );

/* 2.3 ENQUEUE GOOGLE FONTS
/––––––––––––––––––––––––-------------*/
/**
 * Returns an array of Google Fonts to load.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return array Array of Google Font family strings.
 */
function morph_get_google_fonts() {
	return [
		'JetBrains+Mono:ital,wght@0,100..800;1,100..800',
	];
}

/**
 * Adds preconnect links for Google Fonts domains.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_preconnect_google_fonts() {
	$fonts = morph_get_google_fonts();

	if ( empty( $fonts ) ) {
		return;
	}

	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . PHP_EOL;
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . PHP_EOL;
}
add_action( 'wp_head', 'morph_preconnect_google_fonts', 1 );

/**
 * Enqueues Google Fonts stylesheet.
 *
 * @package MORPH
 * @since 0.0.1
 *
 * @return void
 */
function morph_enqueue_google_fonts() {
	$fonts = morph_get_google_fonts();

	if ( empty( $fonts ) ) {
		return;
	}

	$fonts_url = 'https://fonts.googleapis.com/css2?family=' . implode( '&family=', $fonts ) . '&display=swap';

	wp_enqueue_style( 'morph-google-fonts', $fonts_url, [], null );
}
add_action( 'wp_enqueue_scripts', 'morph_enqueue_google_fonts' );
