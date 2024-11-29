import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { useFormatter, useTranslations } from 'next-intl';
import { PricingFragment } from '~/client/fragments/pricing';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf, graphql } from '~/client/graphql';
import CertificationsAndRatings from '~/components/ui/pdp/belami-certification-rating-pdp';
import { Payment } from '~/components/ui/pdp/belami-payment-pdp';
import { RequestQuote } from '~/components/ui/pdp/belami-request-a-quote-pdp';
import { ShippingReturns } from '~/components/ui/pdp/belami-shipping-returns-pdp';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { FreeDelivery } from './belami-product-free-shipping-pdp';
import { ProductForm } from './product-form';
import { ProductFormFragment } from './product-form/fragment';
import { ProductSchema, ProductSchemaFragment } from './product-schema';
import { ReviewSummary, ReviewSummaryFragment } from './review-summary';
import { Coupon } from './belami-product-coupon-pdp';
import { BcImage } from '~/components/bc-image';
import ProductDetailDropdown from '~/components/ui/pdp/belami-product-details-pdp';

export const DetailsFragment = graphql(
  `
    fragment DetailsFragment on Product {
      ...ReviewSummaryFragment
      ...ProductSchemaFragment
      ...ProductFormFragment
      ...ProductItemFragment
      entityId
      name
      sku
      upc
      minPurchaseQuantity
      maxPurchaseQuantity
      condition
      weight {
        value
        unit
      }
      availabilityV2 {
        description
      }
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      brand {
        name
      }
      ...PricingFragment
    }
  `,
  [
    ReviewSummaryFragment,
    ProductSchemaFragment,
    ProductFormFragment,
    ProductItemFragment,
    PricingFragment,
  ],
);

interface Props {
  product: FragmentOf<typeof DetailsFragment>;
  collectionValue?: string;
  dropdownSheetIcon?: string;
}

export const Details = ({ product, collectionValue , dropdownSheetIcon}: Props) => {
  const t = useTranslations('Product.Details');
  const format = useFormatter();

  const customFields = removeEdgesAndNodes(product.customFields);
  const closeIcon = imageManagerImageUrl('close.png', '14w');
  const fanPopup = imageManagerImageUrl('grey-image.png', '150w');
  const blankAddImg = imageManagerImageUrl('notneeded-1.jpg', '150w');

  const showPriceRange =
    product.prices?.priceRange?.min?.value !== product.prices?.priceRange?.max?.value;

  const certificationIcon = imageManagerImageUrl('vector-7-.png', '20w');
  const multipleOptionIcon = imageManagerImageUrl('vector-5-.png', '20w');

  return (
    <div>
      <div className="div-product-details">
        <h1 className="product-name mb-3 text-center text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] sm:text-center md:mt-6 lg:mt-0 lg:text-left xl:mt-0 xl:text-[1.5rem] xl:font-normal xl:leading-[2rem]">
          {product.name}
        </h1>

        {/* Brand and Product Information */}
        <div className="items-center space-x-1 text-center lg:text-left xl:text-left">
          <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
            SKU: <span>{product.sku}</span>
          </span>
          <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
            by{' '}
            <span className="products-underline border-b border-black">{product.brand?.name}</span>
          </span>

          {collectionValue && (
            <>
              <span className="product-collection OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
                from the{' '}
                <span className="products-underline border-b border-black">{collectionValue}</span>
              </span>
            </>
          )}
        </div>

        <ReviewSummary data={product} />
      </div>

      {product.prices && (
        <div className="product-price mt-2 flex gap-2 text-center text-2xl font-bold lg:mt-6 lg:text-left lg:text-3xl">
          {showPriceRange ? (
            <span className="span1-product-price">
              {format.number(product.prices.priceRange.min.value, {
                style: 'currency',
                currency: product.prices.price.currencyCode,
              })}{' '}
              -{' '}
              {format.number(product.prices.priceRange.max.value, {
                style: 'currency',
                currency: product.prices.price.currencyCode,
              })}
            </span>
          ) : (
            <>
              {product.prices.price?.value !== undefined && (
                <span className="span2-product-price text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] text-[#008bb7]">
                  <span>
                    {format.number(product.prices.price.value, {
                      style: 'currency',
                      currency: product.prices.price.currencyCode,
                    })}
                  </span>
                  <br />
                </span>
              )}
              {product.prices.saved?.value !== undefined &&
              product.prices.basePrice?.value !== undefined ? (
                <>
                  <span className="span3-product-price text-[1rem] text-[#002a37] font-normal leading-[2rem] tracking-[0.15px]">
                    <span className="line-through">
                      {format.number(product.prices.basePrice.value, {
                        style: 'currency',
                        currency: product.prices.price.currencyCode,
                      })}
                    </span>
                  </span>
                  <span className="span4-product-price text-[1rem] font-normal leading-[2rem] tracking-[0.15px]">
                    {t('Prices.now')}{' '}
                    {format.number(product.prices.saved.value, {
                      style: 'currency',
                      currency: product.prices.price.currencyCode,
                    })}
                  </span>
                </>
              ) : (
                product.prices.price.value && <span className="span5-product-price"></span>
              )}
            </>
          )}
        </div>
      )}
      {/* coupon */}
      <Coupon />

      {/* Free Delivery */}
      <FreeDelivery />

      {/* Product Form */}
      <ProductForm data={product} multipleOptionIcon={multipleOptionIcon} blankAddImg={blankAddImg} fanPopup={fanPopup} closeIcon={closeIcon} />

      <div className="div-product-description my-12 hidden">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">{t('additionalDetails')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {Boolean(product.sku) && (
            <div>
              <h3 className="font-semibold">{t('sku')}</h3>
              <p>{product.sku}</p>
            </div>
          )}
          {Boolean(product.upc) && (
            <div>
              <h3 className="font-semibold">{t('upc')}</h3>
              <p>{product.upc}</p>
            </div>
          )}
          {Boolean(product.minPurchaseQuantity) && (
            <div>
              <h3 className="font-semibold">{t('minPurchase')}</h3>
              <p>{product.minPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.maxPurchaseQuantity) && (
            <div>
              <h3 className="font-semibold">{t('maxPurchase')}</h3>
              <p>{product.maxPurchaseQuantity}</p>
            </div>
          )}
          {Boolean(product.availabilityV2.description) && (
            <div>
              <h3 className="font-semibold">{t('availability')}</h3>
              <p>{product.availabilityV2.description}</p>
            </div>
          )}
          {Boolean(product.condition) && (
            <div>
              <h3 className="font-semibold">{t('condition')}</h3>
              <p>{product.condition}</p>
            </div>
          )}
          {Boolean(product.weight) && (
            <div>
              <h3 className="font-semibold">{t('weight')}</h3>
              <p>
                {product.weight?.value} {product.weight?.unit}
              </p>
            </div>
          )}
          {Boolean(customFields) &&
            customFields.map((customField) => (
              <div key={customField.entityId}>
                <h3 className="font-semibold">{customField.name}</h3>
                <p>{customField.value}</p>
              </div>
            ))}
        </div>
      </div>
      
      <ProductSchema product={product}/>

      <div className="apple-pay mt-4 xl:hidden">
        <button className="flex w-[100%] items-center justify-center rounded bg-[#353535] p-4 text-white">
          <BcImage
            alt="GPay icon"
            src={imageManagerImageUrl('apple-xxl.png', '20w')}
            height={20}
            width={20}
            className="mr-4 inline"
          />
          Pay with Google
        </button>
      </div>

      {/* Payment Section */}
      <Payment />

      {/* Request a Quote */}
      <RequestQuote />

      {/* Certifications & Ratings */}
      <CertificationsAndRatings certificationIcon={certificationIcon} product={product} />

      {/* Dropdown */}
      <ProductDetailDropdown product={product} dropdownSheetIcon={dropdownSheetIcon} />

      {/* Shipping & Returns */}
      <ShippingReturns />
    </div>
  );
};