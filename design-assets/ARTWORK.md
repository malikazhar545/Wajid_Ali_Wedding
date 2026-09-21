# Wedding artwork

## Burgundy floral stationery (current public invitation)

Tool: built-in `image_gen`, reference-guided generation. Original: `design-assets/burgundy-florals-source.png`. Website asset: `public/burgundy-florals.webp` (about 541 KiB). WebP conversion preserves the original transparent background; the center alpha was checked as zero. The three wedding stationery images supplied by the user were visual references for the burgundy, ivory and botanical direction, not website content.

Generation brief: Original fine-art watercolor floral artwork for a luxury wedding invitation, with deep burgundy, blush and ivory roses and peonies, sage leaves and restrained antique-gold botanical sprigs. Arrange florals in the upper-left and lower-right corners with generous empty space in the center. Genuinely transparent background and center. Use the attached stationery images as aesthetic references only. No text, lettering, logos or watermark.

The WA monogram, envelope, wax seal and lace border are native HTML/CSS/SVG elements. Invitation text stays selectable HTML, including the Arabic Bismillah. Great Vibes is self-hosted in `public/fonts/` with its SIL Open Font License, alongside Cormorant Garamond and DM Sans.

## Royal garden artwork (existing dashboard)

Generated with the built-in image generation tool. Original: `design-assets/royal-garden-source.png`. Web asset: `public/royal-garden.webp` (174 KB). The web file only changes compression and format. Re-create it with `node tests/prepare-artwork.mjs`.

Final prompt:

Create a luxury Pakistani wedding invitation website background artwork, landscape 3:2 composition. Photorealistic fine art still life, rich deep forest emerald teal (#082d2b) velvet-like matte plaster backdrop. Rightmost 45 percent has an elegant tall scalloped Mughal arch with very fine antique brass edging, surrounded by an abundant but tastefully composed cascade of realistic ivory garden roses, white peonies, tiny white jasmine and dark olive eucalyptus foliage descending from top right and bottom right. A few warm bronze lanterns and candle glow low at bottom right, subtle haze. Left 55 percent is almost entirely empty deep emerald textured negative space, gently darker on the left, for website typography laid on top in code. Florals intentionally mostly at right edges so central right arch interior remains deep emerald and empty. Refined editorial wedding stationery photography, tactile real petals, sophisticated restrained gold, cinematic soft directional lighting, luxury South Asian wedding aesthetic, no people, no text, no writing, no logo, no watermark. The image is a decorative background asset, not a mockup of a website.

Fonts: Cormorant Garamond and DM Sans from Google Fonts. Fonts are hosted locally under `public/fonts/`, with their SIL Open Font License files.
