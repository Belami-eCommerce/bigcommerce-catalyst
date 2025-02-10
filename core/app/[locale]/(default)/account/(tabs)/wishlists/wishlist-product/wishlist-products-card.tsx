'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { useFormatter } from 'next-intl';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { addToCart } from '~/components/product-card/add-to-cart/form/_actions/add-to-cart';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { GetVariantsByProductId } from '~/components/management-apis';
import { useCommonContext } from '~/components/common-context/common-provider';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { calculateProductPrice } from '~/components/common-functions';
import { ProductPrice } from '~/belami/components/search/product-price';

interface OptionValue {
  entityId: number;
  label: string;
  isDefault: boolean;
}

interface ProductOption {
  __typename: string;
  entityId: number;
  displayName: string;
  isRequired: boolean;
  isVariantOption: boolean;
  values: OptionValue[];
}

interface ProductVariant {
  entityId: number;
  sku: string;
  mpn: string;
  prices: {
    price: { value: number; currencyCode: string };
    basePrice: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
  };
}
interface CategoryNode {
  name: string;
  path: string | null;
  breadcrumbs?: {
    edges: Array<{
      node: {
        entityId: any;
        name: string;
        path: string | null;
      };
    }> | null;
  };
}

interface WishlistProduct {
  categories: CategoryNode;
  entityId: number;
  name: string;
  sku: string;
  mpn: string;
  path: string;
  availabilityV2: string;
  brand?: {
    name: string;
    path: string;
  };
  defaultImage: {
    url: string;
    altText: string;
  };
  prices: {
    price: { value: number; currencyCode: string };
    basePrice: { value: number; currencyCode: string };
    salePrice: { value: number; currencyCode: string } | null;
  };
  productOptions?: ProductOption[];
  variants: ProductVariant[];
}
interface WishlistItem {
  entityId: number;
  productEntityId: number;
  variantEntityId: number;
  product: WishlistProduct;
}
const ProductCard = ({
  item,
  wishlistEntityId,
  onDelete,
  discountRules,
}: {
  item: WishlistItem;
  wishlistEntityId: number;
  onDelete: (productId: number, wishlistItemId: number) => void;
  discountRules: any;
}) => {
  const { setDeletedProductId } = useCommonContext();

  const format = useFormatter();
  const [isLoading, setIsLoading] = useState(false);
  const [updatedWishlist, setUpdatedWishlist] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string[]>([]);
  const [variantDetails, setVariantDetails] = useState<{
    mpn: string;
    calculated_price: number;
    option_values: Array<{
      option_display_name: string;
      label: string;
    }>;
  } | null>(null);

  const handleDeleteWishlist = () => {
    const productId = item.productEntityId;
    setDeletedProductId(productId, wishlistEntityId);
    onDelete(productId, item.entityId);
  };

  useEffect(() => {
    const fetchVariantDetails = async () => {
      try {
        const allVariantData = await GetVariantsByProductId(item.productEntityId);
        const variant = item.variantEntityId
          ? allVariantData.find((v: any) => v.id === item.variantEntityId)
          : allVariantData[0];

        if (variant) {
          setVariantDetails({
            mpn: variant.mpn,
            calculated_price: variant.calculated_price,
            option_values: variant.option_values,
          });
        }
      } catch (error) {}
    };

    const categories = removeEdgesAndNodes(item.product.categories) as CategoryNode[];
    const categoryWithMostBreadcrumbs = categories.reduce((longest, current) => {
      const longestLength = longest?.breadcrumbs?.edges?.length || 0;
      const currentLength = current?.breadcrumbs?.edges?.length || 0;
      return currentLength > longestLength ? current : longest;
    }, categories[0]);

    const categoryIds =
      categoryWithMostBreadcrumbs?.breadcrumbs?.edges?.map((edge) => edge.node.entityId) || [];

    setCategoryId(categoryIds);

    fetchVariantDetails();
  }, [item, discountRules]);

  function handlePriceUpdatedProduct(product: any[]) {
    if (Array.isArray(product) && JSON.stringify(updatedWishlist) !== JSON.stringify(product)) {
      setUpdatedWishlist(prevWishlist => {
        if (JSON.stringify(prevWishlist) !== JSON.stringify(product)) {
          return product;
        }
        return prevWishlist;
      });
    }
  }
  calculateProductPrice(item.product, 'wishlist', discountRules, categoryId)
    .then((result) => {
      const priceUpdatedProduct = result;
      handlePriceUpdatedProduct(priceUpdatedProduct); 
    })
    .catch((error) => {
      console.error('Error calculating product price:', error);
    });

    console.log("original-->>",updatedWishlist[0]?.UpdatePriceForMSRP.originalPrice);
    console.log("updated price--->",updatedWishlist[0]?.UpdatePriceForMSRP.updatedPrice);
    console.log("discount -->",discountRules);
    console.log("product to func",item.product);
    

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative flex h-full flex-col rounded border border-gray-300 p-[1em]">
        <div className="relative aspect-square overflow-hidden">
          <Link href={item.product.path}>
            <img
              src={item.product.defaultImage.url.replace('{:size}', '500x500')}
              alt={item.product.defaultImage.altText || item.product.name}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>

        <div className="flex justify-end">
          <div
            className="wishlist-product-delete-icon flex w-fit cursor-pointer justify-end rounded-full bg-[#E7F5F8]"
            onClick={handleDeleteWishlist}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 21 19"
              fill="none"
              className="p-[7px]"
            >
              <path
                d="M10.3257 18.35L8.87568 17.03C3.72568 12.36 0.325684 9.27 0.325684 5.5C0.325684 2.41 2.74568 0 5.82568 0C7.56568 0 9.23568 0.81 10.3257 2.08C11.4157 0.81 13.0857 0 14.8257 0C17.9057 0 20.3257 2.41 20.3257 5.5C20.3257 9.27 16.9257 12.36 11.7757 17.03L10.3257 18.35Z"
                fill="#008BB7"
              />
            </svg>
          </div>
        </div>

        <div className="flex justify-center">
          {item.product.brand && (
            <p className="mb-2 flex justify-center text-sm text-gray-600">
              {item.product.brand.name}
            </p>
          )}
        </div>

        <Link href={item.product.path}>
          <h3 className="text-center font-medium text-black hover:text-gray-700">
            {item.product.name}
          </h3>
        </Link>

        {variantDetails && (
          <div className="mt-2 space-y-2 text-center">
            <p className="text-sm">
              <span className="font-semibold">Sku: </span>
              <span>{variantDetails.mpn}</span>
            </p>
            {updatedWishlist[0]?.UpdatePriceForMSRP && (
              <ProductPrice
                defaultPrice={updatedWishlist[0].UpdatePriceForMSRP.originalPrice || 0}
                defaultSalePrice={
                  updatedWishlist[0]?.UpdatePriceForMSRP.hasDiscount
                    ? updatedWishlist[0].UpdatePriceForMSRP.updatedPrice
                    : updatedWishlist[0]?.UpdatePriceForMSRP.warrantyApplied
                      ? updatedWishlist[0].UpdatePriceForMSRP.updatedPrice
                      : null
                }
                currency={updatedWishlist[0].UpdatePriceForMSRP.currencyCode?.currencyCode || 'USD'}
                format={format}
                // showMSRP={updatedWishlist[0].UpdatePriceForMSRP.showDecoration}
                warrantyApplied={updatedWishlist[0].UpdatePriceForMSRP.warrantyApplied}
                options={{
                  useAsyncMode: false,
                  useDefaultPrices: true,
                }}
                classNames={{
                  root: 'product-price mt-2 flex justify-center items-center gap-[0.5em] text-center xl:text-center',
                  newPrice:
                    'text-center text-[18px] font-medium leading-8 tracking-[0.15px] text-brand-400',
                  oldPrice:
                    'inline-flex items-baseline text-center text-[14px] font-medium leading-8 tracking-[0.15px] text-gray-600 line-through sm:mr-0',
                  discount:
                    'whitespace-nowrap text-center text-[14px] font-normal leading-8 tracking-[0.15px] text-brand-400',
                  price:
                    'text-center text-[18px] w-full font-medium leading-8 tracking-[0.15px] text-brand-400',
                  msrp: '-ml-[0.5em] mb-1 text-[10px] text-gray-500',
                }}
              />
            )}
            {variantDetails.option_values.map((option, index) => (
              <p key={index} className="text-sm">
                <span className="font-semibold">{option.option_display_name}: </span>
                <span>{option.label}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsLoading(true);
          const formData = new FormData(e.currentTarget);

          addToCart(formData)
            .then((result) => {
              if (result.error) {
                toast.error('Failed to add item to cart');
              } else {
                toast.success('Item added to cart');
              }
            })
            .catch((error) => {
              toast.error('Failed to add item to cart');
            })
            .finally(() => {
              setIsLoading(false);
            });
        }}
      >
        <input name="product_id" type="hidden" value={item.productEntityId} />
        <input name="variant_id" type="hidden" value={item.variantEntityId} />

        {item.product.availabilityV2.status === 'Unavailable' ? (
          <div className="flex flex-col items-center">
            <Button
              id="add-to-cart"
              className="group relative flex h-[3.5em] w-full items-center justify-center overflow-hidden rounded-[4px] !bg-[#b1b9bc] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-black transition-all duration-300 hover:bg-[#03465c]/90 disabled:opacity-50"
              disabled={true}
              type="submit"
            >
              <span>ADD TO CART</span>
            </Button>
            <p className="text-[12px] text-[#2e2e2e]">This product is currently unavailable</p>
          </div>
        ) : (
          <Button
            type="submit"
            className="h-[42px] w-full bg-[#03465C] font-medium tracking-wider text-white hover:bg-[#02374a]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>ADDING...</span>
              </div>
            ) : (
              'ADD TO CART'
            )}
          </Button>
        )}
      </form>
    </div>
  );
};

export function WishlistProductCard(customerGroupDetails: { discount_rules: any }): JSX.Element {
  const [wishlistData, setWishlistData] = useState<{
    entityId: number;
    name: string;
    items: WishlistItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const discountRules = customerGroupDetails?.customerGroupDetails?.discount_rules;
 
  const handleDelete = (productId: number, wishlistItemId: number) => {
    if (!wishlistData) return;

    const updatedItems = wishlistData.items.filter((item) => item.product.entityId !== productId);

    const updatedWishlist = {
      ...wishlistData,
      items: updatedItems,
    };

    setWishlistData(updatedWishlist);
    localStorage.setItem('selectedWishlist', JSON.stringify(updatedWishlist));
  };

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const savedWishlist = localStorage.getItem('selectedWishlist');
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist);

          setWishlistData(parsedWishlist);
        } else {
          router.push('/account/wishlists');
        }
      } catch (error) {
        setError('Failed to load wishlist data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">{error}</div>;
  }

  if (!wishlistData) {
    return <div></div>;
  }

  return (
    <div className="container m-auto mx-auto mb-12 w-[80%] px-4">
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb mx-auto mb-2 mt-2 hidden px-[1px] lg:block"
        breadcrumbs={[
          {
            label: 'Favorites and Lists',
            href: '/account/wishlists',
          },
          {
            label: wishlistData?.name || 'Loading...',
            href: '#',
          },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-left text-xl font-medium leading-8 tracking-[0.15px] text-black">
            {wishlistData?.name}
          </h1>
          <p className="text-left text-base leading-8 tracking-[0.15px] text-black">
            {wishlistData?.items.length} {wishlistData?.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button
          variant="secondary"
          className="h-10 !w-auto bg-[#008BB7] px-6 text-[14px] font-medium uppercase tracking-wider text-white hover:bg-[#007a9e]"
        >
          SHARE FAVORITES
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
        {wishlistData?.items.map((item) => (
          <ProductCard
            key={item.entityId}
            item={item}
            wishlistEntityId={wishlistData.entityId}
            onDelete={handleDelete}
            discountRules={discountRules}
          />
        ))}
      </div>
    </div>
  );
}

export default WishlistProductCard;
