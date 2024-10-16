import { cookies } from 'next/headers';
import { getTranslations, getFormatter } from 'next-intl/server';

import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import { BcImage } from '~/components/bc-image';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { CartItem, CartItemFragment } from './_components/cart-item';
import { CartViewed } from './_components/cart-viewed';
import { CheckoutButton } from './_components/checkout-button';
import { ApplepayButton } from './_components/applepay-button';
import { PaypalButton } from './_components/paypal-button';
import { AmazonpayButton } from './_components/amazonpay-button';
import { ContinuetocheckoutButton } from './_components/continueto-checkout';
import { CheckoutSummary, CheckoutSummaryFragment } from './_components/checkout-summary';
import { EmptyCart } from './_components/empty-cart';
import { GeographyFragment } from './_components/shipping-estimator/fragment';
import { SaveCart } from './_components/save-cart';
import { RemoveCart } from './_components/remove-cart';


const CartPageQuery = graphql(
  `
    query CartPageQuery($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          currencyCode
          lineItems {
            ...CartItemFragment
          }
        }
        checkout(entityId: $cartId) {
          ...CheckoutSummaryFragment
        }
      }
      geography {
        ...GeographyFragment
      }
    }
  `,
  [CartItemFragment, CheckoutSummaryFragment, GeographyFragment],
);

export async function generateMetadata() {
  const t = await getTranslations('Cart');

  return {
    title: t('title'),
  };
}


export default async function Cart() {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return <EmptyCart />;
  }

  const t = await getTranslations('Cart');

  const customerId = await getSessionCustomerId();

  const { data } = await client.fetch({
    document: CartPageQuery,
    variables: { cartId },
    customerId,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart, TAGS.checkout],
      },
    },
  });

  const cart = data.site.cart;
  const checkout = data.site.checkout;
  const geography = data.geography;

  if (!cart) {
    return <EmptyCart />;
  }

  const lineItems = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems];
  let cartQty = lineItems?.reduce(function (total, cartItems) { return total + cartItems?.quantity }, 0);
  let cartItemsText = (cartQty > 1) ? " Items" : " Item";
  const deleteIcon = imageManagerImageUrl('delete.png', '20w');
  const downArrow = imageManagerImageUrl('downarrow.png', '20w');
  const agentIcon = imageManagerImageUrl('agent-icon.png', '20w');
  const heartIcon = imageManagerImageUrl('hearticon.png', '20w');
  const applePayIcon = imageManagerImageUrl('applepay.png', '60w');
  const amazonPayIcon = imageManagerImageUrl('amazonpay.png', '125w');
  const paypalIcon = imageManagerImageUrl('fill-11.png', '25w');
  const closeIcon = imageManagerImageUrl('close.png', '25w');
  const format = await getFormatter();
  
  const breadcrumbs: any = [{
    label: "Your Cart",
    href: '#'
  }];
  return (
    <div>
      {/* Cart number for mobile (centered on small devices, above "Your cart" with top padding), hidden on larger screens */}
      <ContinuetocheckoutButton cartId={cartId} />


      <div className="pt-6 text-center lg:hidden">
      <div className="inline-flex items-center gap-2 font-medium text-[20px] leading-[32px] text-[#002A37] tracking-[0.15px]">
          Subtotal{' '}
          {format.number(checkout?.subtotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
          <BcImage
            alt="Remove"
            width={12}
            height={8}
            className="h-[8px] w-[12px]"
            src={downArrow}
          />
        </div>
      </div>

      <div className="pt-8 text-center lg:hidden">
        <div>Cart #12345</div>
      </div>

      {/* Heading section */}
      <ComponentsBreadcrumbs className="mt-10" breadcrumbs={breadcrumbs} />
  
<h1 className="cart-heading pb-6 pt-0 text-center lg:text-left text-[24px] font-normal leading-[32px] lg:pb-4 lg:text-[24px]">
  {`${t('heading')}(${cartQty}${cartItemsText})`}
</h1>

      {/* Cart number for larger screens, SaveCart, and RemoveCart all in one line */}
      <div className="hidden lg:flex lg:items-center lg:space-x-8">
        <SaveCart cartItems={lineItems} saveCartIcon={heartIcon} />
        {/*<RemoveCart cartId={cart.entityId} icon={deleteIcon} deleteIcon={closeIcon} /> */}
        <div className="text-left text-[1rem] font-normal leading-[2rem] tracking-[0.03125rem] text-[#7F7F7F]">
          Cart #12345
        </div>
      </div>

      {/* Your cart section */}
      <div className="save-cart pb-8 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-6">
        {/* Mobile layout for SaveCart and RemoveCart */}
        <div className="flex w-full items-center justify-center gap-4 lg:hidden">
          {/* SaveCart aligned left on small devices */}
          <div className="w-auto text-left cart-save-item">
            <SaveCart cartItems={lineItems} saveCartIcon={heartIcon} />
          </div>
          {/* RemoveCart aligned right on small devices */}
          <div className="w-auto text-right delete-icon-empty-cart-hidden">
            <RemoveCart cartId={cart.entityId} icon={deleteIcon} deleteIcon={closeIcon} />
          </div>
        </div>
      </div>
      <div className="cart-right-side-details px-18 pb-0 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <ul className="col-span-2">
          {lineItems.map((product) => (
            <CartItem
              currencyCode={cart.currencyCode}
              key={product.entityId}
              product={product}
              deleteIcon={deleteIcon}
            />
          ))}
        </ul>

        <div className="cart-right-side col-span-1 col-start-2 lg:col-start-3 border-t border-[#CCCBCB] pt-1 sticky top-0 overflow-hidden min-h-[800px] h-[100px]">

          {checkout && <CheckoutSummary checkout={checkout} geography={geography} />}

          <CheckoutButton cartId={cartId} />
          <ApplepayButton cartId={cartId} icon={applePayIcon} />
          <PaypalButton cartId={cartId} icon={paypalIcon} />
          <AmazonpayButton cartId={cartId} icon={amazonPayIcon} />
          <div className="pt-1"></div>
          <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
            Return Policy
          </p>
          <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
            Shipping Policy
          </p>
          <p className="flex items-center pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
            <BcImage
              alt="Agent Icon"
              width={10}
              height={8}
              className="h-[14px] w-[14px] mr-1"
              src={agentIcon}
            />{' '}
            Talk to an Agent
          </p>
         
        </div>
        </div>
 
      <CartViewed checkout={checkout} currencyCode={cart.currencyCode} lineItems={lineItems} />
    </div>
  );
}

export const runtime = 'edge';
