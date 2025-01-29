import { ProductFormFragment } from '~/app/[locale]/(default)/product/[slug]/_components/product-form/fragment';
import { graphql } from '~/client/graphql';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';
import { PricingFragment } from './pricing';

export const ProductItemFragment = graphql(
  `
    fragment ProductItemFragment on Product {
      entityId
      name
      sku
      mpn
      defaultImage {
        url(width: 1000)
        altText
        isDefault
      }
      images {
        edges {
          node {
            url(width: 1000)
            altText
            isDefault
          }
        }
      }
      path
      categories(first: 1) {
        edges {
          node {
            ...BreadcrumbsFragment
          }
        }
      }
      brand {
        name
        path
      }
      variants {
        edges {
          node {
            entityId
            sku
            mpn
            defaultImage {
              url(width: 1000)
              altText
              isDefault
            }
          }
        }
      }
      ...PricingFragment
      ...ProductFormFragment
    }
  `,
  [BreadcrumbsFragment, PricingFragment, ProductFormFragment],
);
