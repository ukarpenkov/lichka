import { icons as pixelSet } from '@iconify-json/streamline-pixel';

/**
 * Selectable Streamline Pixel icons for chat avatars.
 * Stored as icon id in `chats.avatar_path` (same slot as legacy emoji).
 */
export const DEFAULT_CHAT_ICON = 'social-rewards-certified-ribbon';

/** Icons shown in the chat avatar picker (order = grid order). */
export const CHAT_AVATAR_ICONS: readonly string[] = [
  // Russian list
  'transportation-plane',
  'pet-animals-cat',
  'pet-animals-dog',
  'school-science-graduation-cap',
  'school-science-bag',
  'health-drug-medicine',
  'ecology-clean-car-cable-charge',
  'shopping-shipping-bag-1',
  'map-navigation-compass-direction',
  'entertainment-events-hobbies-board-game-dice',
  'entertainment-events-hobbies-game-machines-arcade-1',
  'ecology-growth-plant',
  'building-real-eastate-house-1',
  'interface-essential-information-circle-1',
  'interface-essential-key',
  // Figma / Streamline Pixel names
  'coding-apps-websites-mobile',
  'coding-apps-websites-database',
  'coding-apps-websites-finder',
  'content-files-newspaper',
  'email-mailbox-close',
  'photography-photo-image',
  'technology-robot-ai-signal-1',
  'transportation-bicycle',
  'travel-wayfinding-beach-coconut-tree',
  'health-laboratory-test-blood-sugar',
  'health-injection',
  'beauty-barber-light-sign',
  'food-drink-pizza',
  'food-drink-desert-cupcake',
  'shopping-shipping-bag-2',
  'shopping-shipping-delivery-person-motorcycle',
  'shopping-shipping-cart',
  'money-payments-accounting-bill-money-1',
  'money-payments-cash-payment-coin',
  'computers-devices-electronics-earpod-sound',
  'computer-old-electronics',
  'computers-devices-electronics-chipset',
  'business-money-coin-currency',
  'business-products-magic-rabbit',
  'business-product-startup-1',
  'business-products-climb-top',
  'business-products-deal-handshake',
  'design-drawing-board',
  'music-walkman-cassette',
  'video-movies-set-equipment',
  'phone-incoming-call',
  'internet-network-wifi-monitor',
  'content-files-notepad',
  'coding-apps-websites-programming-hold-code',
] as const;

/** True when avatar_path is a Streamline Pixel icon id (not a file path / emoji). */
export function isChatIconAvatar(path: string): boolean {
  return path in pixelSet.icons;
}
