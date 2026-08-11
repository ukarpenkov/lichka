# Google Play — App icon

Store listing field: **App icon** (Значок приложения)

## Requirements

- Format: PNG or JPEG
- Size: **512 × 512** px
- File size: ≤ **1 MB**
- Must follow Play design specs and metadata rules
- Do **not** bake rounded corners — Play applies its own mask

## File to upload

```
docs/release/icons/play-store-icon-512.png
```

| Property | Value |
|----------|-------|
| Resolution | 512 × 512 |
| Format | PNG |
| Size | ~12 KB |
| Background | `#FFFFFF` full-bleed |
| Mark | Feather `#2B2E33` + white vein |

## Source

Generated from the same artwork as `design/icons/icon.svg` (launcher / adaptive icon), as a **square full-bleed** asset for Play Console — without the rounded clip used in the SVG preview.

Launcher densities and adaptive layers remain under `design/icons/android/` and `android/app/src/main/res/mipmap-*` (`npm run icons:android`).
