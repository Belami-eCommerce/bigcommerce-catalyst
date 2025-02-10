import { getProduct } from './get-product';
import { ExistingResultType } from '~/client/util';

declare global {
  interface Window {
    klaviyo?: KlaviyoEvent[];
  }
}

type KlaviyoEvent =
  | [eventType: 'identify', item: Record<string, unknown>]
  | [eventType: 'trackViewedItem', item: Record<string, unknown>]
  | [eventType: 'track', eventName: string, item: Record<string, unknown>];

type Product = ExistingResultType<typeof getProduct>;

export function KlaviyoTrackAddToCart({ product, user }: { product: Product, user?: { email: string } }) {
  const klaviyo = window.klaviyo || [];

  const addedToCartProductData = {
    Name: product.name,
    ProductID: product.entityId,
    ...(product.defaultImage && { ImageURL: product.defaultImage.url }),
    ...(product.brand && { Brand: product.brand.name }),
    ...(product.prices && { Price: product.prices.price.value }),
  };

  klaviyo.push(['identify', user && user.email ? user : { anonymous: true }]);
  klaviyo.push(['track', 'Catalyst Added to Cart', addedToCartProductData]);
}