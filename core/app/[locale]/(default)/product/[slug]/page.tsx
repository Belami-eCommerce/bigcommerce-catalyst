import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { LocaleType } from '~/i18n/routing';

import Promotion from '../../../../../components/ui/pdp/belami-promotion-banner-pdp';
import { SimilarProducts } from '../../../../../components/ui/pdp/belami-similar-products-pdp';

import { Description } from './_components/description';
import { Details } from './_components/details';
import { Gallery } from './_components/gallery';
import { ProductViewed } from './_components/product-viewed';
import { RelatedProducts } from './_components/related-products';
import { Reviews } from './_components/reviews';
import { Warranty } from './_components/warranty';
import { getProduct } from './page-data';
import { ReviewSummary } from './_components/review-summary';
import { imageManagerImageUrl } from '~/lib/store-assets';

interface Props {
  params: { slug: string; locale: LocaleType };
  searchParams: Record<string, string | string[] | undefined>;
}

function getOptionValueIds({ searchParams }: { searchParams: Props['searchParams'] }) {
  const { slug, ...options } = searchParams;

  return Object.keys(options)
    .map((option) => ({
      optionEntityId: Number(option),
      valueEntityId: Number(searchParams[option]),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const productId = Number(params.slug);
  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
  });

  if (!product) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: pageTitle || product.name,
    description: metaDescription || `${product.plainTextDescription.slice(0, 150)}...`,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: url
      ? {
          images: [
            {
              url,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function Product({ params: { locale, slug }, searchParams }: Props) {
  const bannerIcon = imageManagerImageUrl('example-1.png', '50w');
  const galleryExpandIcon = imageManagerImageUrl('vector.jpg', '20w'); // Set galleryExpandIcon here

  unstable_setRequestLocale(locale);

  const t = await getTranslations('Product');

  const productId = Number(slug);

  const optionValueIds = getOptionValueIds({ searchParams });

  const product = await getProduct({
    entityId: productId,
    optionValueIds,
    useDefaultOptionSelections: optionValueIds.length === 0 ? true : undefined,
  });

  if (!product) {
    return notFound();
  }

  const category = removeEdgesAndNodes(product.categories).at(0);
  if (category?.breadcrumbs?.edges) {
    category.breadcrumbs.edges.push({ node: { name: product?.sku, path: '#' } });
  }

  return (
    <>
      {category && <Breadcrumbs category={category} />}
      <div className="main-product-details">
        <h2 className="product-name mb-3 text-center text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] sm:text-center md:mt-6 lg:text-left xl:mt-0 xl:text-[1.5rem] xl:font-normal xl:leading-[2rem]">
          {product.name}
        </h2>

        <div className="items-center space-x-1 text-center lg:text-left xl:text-left">
          <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
            SKU: <span>{product.sku}</span>
          </span>
          <span className="OpenSans text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.25px] text-black lg:text-left xl:text-[0.875rem] xl:leading-[1.5rem] xl:tracking-[0.25px]">
            by{' '}
            <span className="products-underline border-b border-black">{product.brand?.name}</span>
          </span>
        </div>

        <ReviewSummary data={product} />
      </div>
      <div className="mb-4 mt-4 lg:grid lg:grid-cols-2 lg:gap-8 xl:mb-12">
        <Gallery
          noImageText={t('noGalleryText')}
          product={product}
          bannerIcon={bannerIcon}
          galleryExpandIcon={galleryExpandIcon} // Pass galleryExpandIcon to Gallery component
        />
        <Details product={product} />
        <div className="lg:col-span-2">
          <Description product={product} />
          <RelatedProducts productId={product.entityId} />
          <SimilarProducts />
          <Promotion />
          <Warranty product={product} />
          <Suspense fallback={t('loading')} />
          <Suspense fallback={t('loading')}>
            <Reviews productId={product.entityId} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={t('loading')}>
        <RelatedProducts productId={product.entityId} />
      </Suspense>

      <ProductViewed product={product} />
    </>
  );
}

export const runtime = 'edge';
