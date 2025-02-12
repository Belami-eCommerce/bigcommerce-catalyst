import { getFormatter, getTranslations } from 'next-intl/server';

import { FragmentOf, graphql } from '~/client/graphql';

import { CouponCode } from './coupon-code';
import { CouponCodeFragment } from './coupon-code/fragment';
import { ShippingEstimator } from './shipping-estimator';
import { GeographyFragment, ShippingEstimatorFragment } from './shipping-estimator/fragment';
import { getShippingCountries } from './shipping-estimator/get-shipping-countries';

const MoneyFieldsFragment = graphql(`
  fragment MoneyFields on Money {
    currencyCode
    value
  }
`);

export const CheckoutSummaryFragment = graphql(
  `
    fragment CheckoutSummaryFragment on Checkout {
      ...ShippingEstimatorFragment
      ...CouponCodeFragment
      subtotal {
        ...MoneyFields
      }
      grandTotal {
        ...MoneyFields
      }
      taxTotal {
        ...MoneyFields
      }
      cart {
        currencyCode
        discountedAmount {
          ...MoneyFields
        }
      }
    }
  `,
  [MoneyFieldsFragment, ShippingEstimatorFragment, CouponCodeFragment],
);

interface Props {
  checkout: FragmentOf<typeof CheckoutSummaryFragment>;
  geography: FragmentOf<typeof GeographyFragment>;
}

export const CheckoutSummary = async ({ checkout, geography }: Props) => {
  const t = await getTranslations('Cart.CheckoutSummary');
  const format = await getFormatter();

  const { cart, grandTotal, subtotal, taxTotal } = checkout;

  const shippingCountries = await getShippingCountries({ geography });

  return (
    <>
      <ShippingEstimator checkout={checkout} shippingCountries={shippingCountries} />
      
      <div className="flex justify-between">
      <span className="text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-left text-[#353535]">
  {t('subTotal')}
</span>

        <span className="text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-left text-[#353535]">
          {format.number(subtotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
        </span>
      </div>

      {cart?.discountedAmount && (
        <div className="flex justify-between">
          <span className="text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-left text-[#353535]">{t('discounts')}</span>
          <span className="text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-left text-[#008BB7]">
            -
            {format.number(cart.discountedAmount.value, {
              style: 'currency',
              currency: cart.currencyCode,
            })}
          </span>
        </div>
      )}

      <CouponCode checkout={checkout} />

      {taxTotal && (
        <div className="flex justify-between">
          <span className="text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-left text-[#353535]">{t('tax')}</span>
          <span className="text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-left text-[#353535]">
            {format.number(taxTotal.value, {
              style: 'currency',
              currency: cart?.currencyCode,
            })}
          </span>
        </div>
      )}

<div className="flex justify-between py-4 text-[1.25rem] font-medium leading-[2rem] tracking-[0.009375rem] text-left text-[#353535] lg:text-[1.25rem]">
        {t('grandTotal')}
        <span className="text-[1.25rem] font-medium leading-[2rem] tracking-[0.009375rem] text-left text-[#353535] lg:text-[1.25rem]">
          {format.number(grandTotal?.value || 0, {
            style: 'currency',
            currency: cart?.currencyCode,
          })}
        </span>
      </div>
    </>
  );
};
