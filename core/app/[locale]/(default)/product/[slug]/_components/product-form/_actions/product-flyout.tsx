'use client';

import { useFormatter } from 'next-intl';
import { FragmentOf } from 'gql.tada';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { BcImage } from '~/components/bc-image';
import { useCommonContext } from '~/components/common-context/common-provider';
import { Minus, Plus } from 'lucide-react';
import {
  GetProductMetaFields,
  GetProductVariantMetaFields,
  GetVariantsByProductId,
  GetProductBySKU,
} from '~/components/management-apis';
import { ProductAccessories } from './product-accessories';
import Link from 'next/link';
import { CheckoutButton } from '~/app/[locale]/(default)/cart/_components/checkout-button';

interface Props {
  data: FragmentOf<typeof ProductItemFragment>;
}

const getVariantProductInfo = async (metaData: any) => {
  let variantProductInfo: any = [];
  let accessoriesLabelData: any = [];
  if (metaData?.[0]?.value) {
    let varaiantDatas: any = JSON?.parse(metaData?.[0]?.value);
    if (varaiantDatas?.length > 0) {
      let variantProductIdSkus: string = '';
      varaiantDatas?.forEach(async (itemData: any) => {
        variantProductIdSkus += itemData?.products?.[0]?.parent_sku + ',';
        accessoriesLabelData.push({
          sku: itemData?.products?.[0]?.parent_sku,
          label: itemData?.label,
        });
      });
      if (variantProductIdSkus) {
        variantProductIdSkus = variantProductIdSkus?.replace(/,\s*$/, '');
        let parentProductInformation = await GetProductBySKU(variantProductIdSkus);
        if (parentProductInformation?.length > 0) {
          for await (const productInfo of parentProductInformation) {
            let varaiantProductData = await GetVariantsByProductId(productInfo?.id);
            let variantNewObject: any = [];
            varaiantProductData?.forEach((item: any) => {
              let optionValues: string = item?.option_values
                ?.map((data: any) => data?.label)
                .join(' ');
              variantNewObject.push({
                image: item?.image_url,
                price: item?.price,
                retail_price: item?.retail_price,
                sale_price: item?.sale_price,
                id: item?.id,
                mpn: item?.mpn,
                sku: item?.sku,
                name: productInfo?.name + '-' + optionValues,
                parentImage: productInfo?.image,
              });
            });
            let productAccesslabel = accessoriesLabelData?.find(
              (prod: any) => prod?.sku == productInfo?.sku,
            );
            variantProductInfo.push({
              label: productAccesslabel?.label,
              productData: variantNewObject,
              entityId: productInfo?.id,
            });
          }
        }
      }
    }
  }
  return variantProductInfo;
};

export const ProductFlyout = ({
  data: product,
  closeIcon,
}: {
  data: Props['data'];
  closeIcon: string;
}) => {
  const format = useFormatter();
  const productFlyout = useCommonContext();
  let productData = productFlyout.productData;
  let cartItemsData = productFlyout.cartData;
  let open = productFlyout.open;
  let setOpen = productFlyout.handlePopup;
  const [productQty, setProductQty] = useState<number>(1);
  let variantData: any = removeEdgesAndNodes(product?.variants);
  let optionsData: any = removeEdgesAndNodes(product?.productOptions);
  const [variantProductData, setVariantProductData] = useState<any>([]);
  if (variantData && optionsData && optionsData?.length > 0) {
    let variantProduct: any = variantData?.find((item: any) => item?.sku == product?.sku);
    useEffect(() => {
      const getProductMetaData = async () => {
        let metaData = await GetProductVariantMetaFields(
          product?.entityId,
          variantProduct?.entityId,
          'Accessories',
        );
        let productData = await getVariantProductInfo(metaData);
        setVariantProductData([...productData]);
      };
      if (variantProduct) {
        getProductMetaData();
      }
      setProductQty(productData?.quantity);
    }, [variantProduct?.entityId, product?.entityId, productData?.quantity]);
  } else {
    useEffect(() => {
      const getProductMetaData = async () => {
        let metaData = await GetProductMetaFields(product?.entityId, 'Accessories');
        let productData = await getVariantProductInfo(metaData);
        setVariantProductData([...productData]);
      };
      getProductMetaData();
      setProductQty(productData?.quantity);
    }, [product?.entityId, productData?.quantity]);
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow fixed left-[50%] top-[50%]  flex max-h-[85vh] w-[90vw] max-w-[610px] translate-x-[-50%] translate-y-[-50%] flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <div className="flex flex-col items-center justify-center gap-[20px]">
              <Dialog.Close asChild>
                <button
                  aria-modal
                  className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-center rounded-full"
                  aria-label="Close"
                >
                  <BcImage
                    alt="Close Icon"
                    width={24}
                    height={24}
                    unoptimized={true}
                    className="h-[25px] w-[25px]"
                    src={closeIcon}
                  />
                </button>
              </Dialog.Close>
              <div className="gap-1.25 flex w-full flex-row items-center justify-center bg-[#EAF4EC] px-2.5">
                <Dialog.Title className="text-mauve12 m-0 text-[20px] font-medium tracking-[0.15px] text-[#167E3F]">
                  Added to Cart!
                </Dialog.Title>
              </div>
            </div>
            <Dialog.Description></Dialog.Description>
            <Dialog.Content className="popup-box1 flex flex-row gap-[30px]">
              <div className="popup-box1-div1 relative flex h-[160px] w-[140px] border border-[#cccbcb]">
                <BcImage
                  alt={productData?.name}
                  width={140}
                  height={140}
                  unoptimized={true}
                  className="popup-box1-div-img absolute h-full w-full object-contain"
                  src={productData?.imageUrl}
                />
              </div>
              <div className="popup-box1-div2 flex max-w-[360px] flex-shrink-[50] flex-col gap-[1px]">
                <p className="text-[14px] font-normal tracking-[0.25px] text-[#353535]">
                  {productData?.name}
                </p>
                <p className="popup-box1-div2-sku text-[12px] leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                  SKU: {product?.sku}
                </p>
                {productData?.selectedOptions?.map((selectedOption: any, index: number) => {
                  let pipeLineData = '';
                  if (index < productData?.selectedOptions?.length - 2) {
                    pipeLineData = ',';
                  }
                  return (
                    <div key={selectedOption.entityId} className="flex items-center">
                      <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                        {selectedOption.name}:
                      </span>
                      <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                        {selectedOption.value}
                      </span>
                      {pipeLineData && (
                        <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                          {' '}
                          {pipeLineData}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div className="md:flex-row">
                  {productData?.originalPrice?.value &&
                  productData?.selectedOptions?.length === 0 &&
                  productData?.originalPrice?.value !== productData?.listPrice?.value ? (
                    <div className="">
                      {format.number(productData?.originalPrice?.value * productData?.quantity, {
                        style: 'currency',
                        currency: productData?.originalPrice?.currencyCode,
                      })}
                    </div>
                  ) : null}
                  {productData?.extendedSalePrice?.value ? (
                    <div className="text-right text-[14px] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535]">
                      {format.number(productData?.extendedSalePrice?.value, {
                        style: 'currency',
                        currency: productData?.extendedSalePrice?.currencyCode,
                      })}
                    </div>
                  ) : null}
                </div>
                <div className="text-[14px] font-normal tracking-[0.25px] text-[#353535]">
                  <div className="flex h-[44px] max-w-[105px] items-center justify-center gap-[10px] rounded-[20px] border border-[#d6d6d6]">
                    <div className="">
                      <Minus className="h-[1rem] w-[1rem] text-[#7F7F7F]"></Minus>
                    </div>
                    <input
                      name="quantity"
                      type="number"
                      className="w-[40%] border text-center"
                      min="1"
                      defaultValue={productQty}
                    />
                    <div className="">
                      <Plus className="h-[1rem] w-[1rem] text-[#7F7F7F]"></Plus>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Content>
            {variantProductData && variantProductData?.length > 0 && (
              <>
                <hr className="" />
                <div className="pop-up-text flex flex-col gap-4">
                  <div className="flex flex-col gap-[20px]">
                    <div className="text-[20px] font-medium tracking-[0.15px] text-black">
                      You May Also Need
                    </div>
                    <div className="accessories-data flex flex-col gap-[20px]">
                      {variantProductData &&
                        variantProductData?.map((accessories: any, index: number) => (
                          <div
                            className="product-card flex flex-row items-center gap-[20px] border border-[#cccbcb] p-[20px]"
                            key={index}
                          >
                            <ProductAccessories accessories={accessories} index={index} />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}
            <hr className="" />
            <div className="footer-section flex flex-col gap-[20px]">
              <div className="subtotal-section flex flex-col gap-[10px] items-start">
                <div className='font-medium text-[20px] tracking-[0.15px] text-[#008BB7]'>Free Shipping</div>
                <div className='w-full flex flex-row justify-between items-start gap-[10px]'>
                  <div className="items-qty font-medium text-[20px] tracking-[0.15px] text-black">
                    Subtotal ({cartItemsData?.lineItems?.totalQuantity}){' '}
                    {cartItemsData?.lineItems?.totalQuantity > 1 ? 'items' : 'item'}:
                  </div>
                  <div className="total-price font-medium text-[20px] tracking-[0.15px] text-black">
                    {format.number(cartItemsData?.totalExtendedListPrice?.value, {
                      style: 'currency',
                      currency: cartItemsData?.totalExtendedListPrice?.currencyCode,
                    })}
                  </div>
                </div>
              </div>
              <div className="cart-buttons flex flex-row items-start gap-[10px]">
                <Link
                  className="flex flex-row items-center self-stretch justify-center w-[100%] border border-[#b3dce8] rounded-[3px] font-medium text-[14px] tracking-[1.25px] uppercase text-[#002A37] my-5 text-sm  hover:text-secondary md:my-0"
                  href="/cart"
                >
                  View Cart
                </Link>
                <CheckoutButton cartId={cartItemsData?.entityId} />
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                aria-modal
                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full"
                aria-label="Close"
              ></button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
