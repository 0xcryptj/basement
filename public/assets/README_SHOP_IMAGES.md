# Shop Product Images

This directory should contain product images for the shop.

## Required Images (512x512px recommended)

Create these images and place them in the `/public/assets/` folder:

- `arcade-pass.png` - 🎮 Arcade Pass product image
- `vip-badge.png` - 👑 VIP Membership badge
- `credits.png` - 💰 Game Credits coin/token image
- `nft-avatar.png` - 🎨 NFT Avatar example
- `bundle.png` - 🎁 Premium Bundle package image
- `lucky-ticket.png` - 🎰 Lucky Block Ticket image

## Temporary Solution

Currently, the ProductCard component displays emoji icons as placeholders.
The first emoji from the product name is shown as a large icon.

## Image Guidelines

### Size
- Recommended: 512x512px
- Minimum: 256x256px
- Format: PNG with transparency

### Style
- Match the retro/cyberpunk aesthetic of The Basement
- Use neon colors: blues, purples, pinks
- Add glow effects if possible
- Keep it simple and recognizable

### Examples

**Arcade Pass:**
- Gaming controller with neon glow
- Ticket stub with arcade theme
- Retro arcade cabinet icon

**VIP Badge:**
- Crown with VIP text
- Premium membership card
- Gold/platinum badge

**Game Credits:**
- Coin stack with ETH or token symbol
- Digital wallet icon
- Chip/token with numbers

**NFT Avatar:**
- Pixelated character
- Profile picture frame
- Generative art preview

**Bundle:**
- Gift box with items inside
- Package with ribbon
- Collection of product icons

**Lucky Ticket:**
- Golden ticket
- Jackpot slot machine
- Lucky clover or dice

## AI Image Generation Prompts

If using AI tools (DALL-E, Midjourney, etc.):

```
"Neon cyberpunk arcade pass ticket, retro gaming aesthetic, 
purple and blue glow, transparent background, 512x512"

"VIP crown badge icon, gold and purple neon glow, 
cyberpunk retro style, transparent PNG, 512x512"

"Stack of neon cryptocurrency coins, blue and purple glow, 
retro arcade aesthetic, transparent background, 512x512"

"Cyberpunk NFT avatar pixelated character, neon colors, 
retro gaming style, transparent PNG, 512x512"

"Premium bundle gift box, neon glow, cyberpunk retro arcade theme, 
purple and blue, transparent background, 512x512"

"Golden lucky jackpot ticket, neon glow, retro arcade style, 
purple and gold, transparent PNG, 512x512"
```

## Using Your Own Images

1. Create or download images
2. Resize to 512x512px
3. Save as PNG with transparency
4. Place in `/public/assets/` folder
5. Images will be automatically used by the shop

No code changes needed - the ProductCard component will automatically load images from the configured paths!

