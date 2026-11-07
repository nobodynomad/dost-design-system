# DOST icons — Microsoft Fluent

The project uses 100 local SVGs from [Fluenticons](https://github.com/coltongriffith/fluenticons), the viewer for Microsoft's Fluent UI System Icons. All drawings use the original 24 × 24 canvas.

- Catalog commit: `6d610e8f06e418039450c0a86978cef99cb09b69`.
- Microsoft source commit: `9cf8af0f95a555918a60b8147a2f33a6a1248442`.
- Matching `@fluentui/svg-icons` version: `1.1.341`.
- License: [Microsoft MIT license](LICENSE).
- Source filenames: `public/icons/ic_fluent_{name}_24_{style}.svg`. Local names replace underscores with hyphens and omit the prefix and size, e.g. `engine-regular.svg`. Drawings are copied unchanged.

Use Regular for navigation, actions and specifications. Use Filled for feedback states or deliberate filled examples. Colors inherit DOST's existing icon styles; do not recolor the source SVG or add another icon family.

The model uses `vehicle-truck-cube` for payload, `box` for cargo volume, `engine` for the engine, `leaf-one` for emissions and `shield-checkmark` for warranty. Fluent has no Facebook, Instagram or YouTube logos: the footer pairs `people-community`, `camera` and `video-clip` with visible platform names.

Run `npm run build` in `www/themes/morph` to generate `assets/images/sprite.svg`. Use the existing `.icon` component and `icon--sm` (16px), `icon--md` (20px), or `icon--lg` (24px). The specification cards use the existing 32px size. The WordPress `morph_print_sprite_icon()` helper uses the same sprite.

For a new icon, copy the required original SVG from the catalog, use the filename convention above, add its example to the icon gallery in `design-system.html`, then rebuild and run the tests. Keep existing IDs compatible with the component scripts. Do not draw substitutes or embed a separate sprite in a page.
