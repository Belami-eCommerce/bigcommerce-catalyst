import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getChannelIdFromSite } from '~/get-site-details';

export const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    couponAmount {
      currencyCode
      formatted
      value
    }
    discountedAmount {
      currencyCode
      formatted
      value
    }
    discounts {
      discountedAmount {
        currencyCode
        formatted
        value
      }
      entityId
    }
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
    url
  }
`);

export const DigitalItemFragment = graphql(`
  fragment DigitalItemFragment on CartDigitalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    couponAmount {
      currencyCode
      formatted
      value
    }
    discountedAmount {
      currencyCode
      formatted
      value
    }
    discounts {
      discountedAmount {
        currencyCode
        formatted
        value
      }
      entityId
    }
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
    url
  }
`);

const CartPageQuery = graphql(
  `
    query CartPageQuery($cartId: String) {
      site {
        cart(entityId: $cartId) {
          entityId
          currencyCode
          lineItems {
            physicalItems {
              ...PhysicalItemFragment
            }
            digitalItems {
              ...DigitalItemFragment
            }
            totalQuantity
          }
        }
        checkout(entityId: $cartId) {
          subtotal {
            currencyCode
            value
          }
        }
      }
    }
  `,
  [PhysicalItemFragment, DigitalItemFragment],
);

export const getCart = async (cartId: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: CartPageQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart, TAGS.checkout],
      },
    },
    channelId: await getChannelIdFromSite(),
  });

  return data;
};
