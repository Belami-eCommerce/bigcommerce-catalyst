'use client';

import { useFormatter } from 'next-intl';
import { FragmentOf } from 'gql.tada';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { BcImage } from '~/components/bc-image';
import { useCommonContext } from '~/components/common-context/common-provider';
import { Minus, Plus, LoaderCircle } from 'lucide-react';
import {
  GetProductMetaFields,
  GetProductVariantMetaFields,
  GetVariantsByProductId,
} from '~/components/management-apis';
import { ProductAccessories } from './product-accessories';
import Link from 'next/link';
import { CheckoutButton } from '~/app/[locale]/(default)/cart/_components/checkout-button';
import { GetVariantsByProductSKU } from '~/components/graphql-apis';
import { InputPlusMinus } from '../form-fields/input-plus-minus';

interface Props {
  data: FragmentOf<typeof ProductItemFragment>;
}

const getVariantProductInfo = async (metaData: any) => {
  let variantProductInfo: any = [],
    accessoriesLabelData: any = [],
    skuArrayData: any = [];
  if (metaData?.[0]?.value) {
    let variantDatas: any = JSON?.parse(metaData?.[0]?.value);
    if (variantDatas?.length > 0) {
      let variantProductIdSkus: Array<any> = [];
      variantDatas?.forEach(async (itemData: any) => {
        variantProductIdSkus.push(itemData?.products?.[0]?.parent_sku);
        accessoriesLabelData.push({
          sku: itemData?.products?.[0]?.parent_sku,
          label: itemData?.label,
        });
        if (itemData?.products?.[0]?.variants) {
          skuArrayData.push(...itemData?.products?.[0]?.variants);
        } else {
          skuArrayData.push(itemData?.products?.[0]?.parent_sku);
        }
      });
      if (variantProductIdSkus?.length) {
        let parentProductInformation = await GetVariantsByProductSKU(variantProductIdSkus);
        if (parentProductInformation?.length > 0) {
          for await (const productInfo of parentProductInformation) {
            let varaiantProductData = await GetVariantsByProductId(productInfo?.entityId);
            let variantNewObject: any = [];
            let productName: string = productInfo?.name;
            let imageArray: Array<any> = removeEdgesAndNodes(productInfo?.images);
            varaiantProductData?.forEach((item: any) => {
              if (skuArrayData?.find((sku: any) => sku == item?.sku)) {
                let optionValues: string = item?.option_values
                  ?.map((data: any) => data?.label)
                  ?.join(' ');
                optionValues = optionValues ? '-' + optionValues : '';
                let getProductImage = imageArray?.find((image: any) =>
                  image?.altText?.includes(item?.mpn),
                );
                let salePriceData = item?.price;
                let price = item?.price;
                if (price != item?.sale_price && item?.sale_price > 0) {
                  salePriceData = item?.sale_price;
                }
                variantNewObject.push({
                  image: getProductImage?.url,
                  price: price,
                  retail_price: item?.retail_price,
                  sale_price: salePriceData,
                  id: item?.id,
                  mpn: item?.mpn,
                  sku: item?.sku,
                  name: productName + optionValues,
                  selectedOptions: item?.selectedOption
                });
              }
            });
            let productAccesslabel = accessoriesLabelData?.find(
              (prod: any) => prod?.sku == productInfo?.sku,
            );
            if (variantNewObject?.length > 0) {
              variantProductInfo.push({
                label: productAccesslabel?.label,
                productData: variantNewObject,
                entityId: productInfo?.entityId,
              });
            }
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
  fanPopup,
  blankAddImg,
}: {
  data: Props['data'];
  closeIcon: string;
  fanPopup: string;
  blankAddImg: string;
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
          <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] flex max-h-[85vh] w-[90vw] max-w-[610px] translate-x-[-50%] translate-y-[-50%] flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            
            {/* WHen loading is true display flex otherwise hidden */}
            <div className='flyout-loading hidden fixed top-0 left-0 w-full h-full bg-gray-200 bg-opacity-80 flex items-center justify-center z-50'>
              <div>
                <LoaderCircle className="animate-spin text-blue-600" />
              </div>
            </div>
            {/* WHen it's loading you have to add the class */}
            {/* overflow-hidden */}
            <div className='flex flex-col gap-[20px]'>
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
              <Dialog.Content className="popup-box1 !pointer-events-auto flex flex-col items-center gap-[30px] ssm:flex-row ssm:items-start">
                <div className="popup-box1-div1 relative flex h-[200px] w-[200px] border border-[#cccbcb] ssm:h-[160px] ssm:w-[140px]">
                  <BcImage
                    alt={productData?.name}
                    width={140}
                    height={140}
                    unoptimized={true}
                    className="popup-box1-div-img absolute h-full w-full object-contain"
                    src={productData?.imageUrl}
                  />
                </div>
                <div className="popup-box1-div2 flex max-w-[360px] flex-shrink-[50] flex-col gap-[3px] text-center ssm:gap-[1px] ssm:text-start">
                  <p className="text-center text-[14px] font-normal tracking-[0.25px] text-[#353535] ssm:text-left">
                    {productData?.name}
                  </p>
                  <p className="popup-box1-div2-sku text-center text-[12px] leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:text-left ssm:tracking-[0.015625rem]">
                    SKU: {product?.sku}
                  </p>
                  {productData?.selectedOptions?.map((selectedOption: any, index: number) => {
                    let pipeLineData = '';
                    if (index < productData?.selectedOptions?.length - 2) {
                      pipeLineData = ',';
                    }
                    return (
                      <div
                        key={selectedOption.entityId}
                        className="text-center ssm:flex ssm:items-center ssm:text-start"
                      >
                        <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:tracking-[0.015625rem]">
                          {selectedOption.name}:
                        </span>
                        <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:tracking-[0.015625rem]">
                          {selectedOption.value}
                        </span>
                        {pipeLineData && (
                          <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:tracking-[0.015625rem]">
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
                      <div className="text-center text-[14px] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535] ssm:text-right">
                        {format.number(productData?.extendedSalePrice?.value, {
                          style: 'currency',
                          currency: productData?.extendedSalePrice?.currencyCode,
                        })}
                      </div>
                    ) : null}
                  </div>
                  <InputPlusMinus product="true" productData={productData} />
                </div>
              </Dialog.Content>
              {variantProductData && variantProductData?.length > 0 && (
                <>
                  <hr className="border-[#93cfa1] my-[20px]" />
                  <div className="pop-up-text flex flex-col gap-4">
                    <div className="flex flex-col gap-[20px]">
                      <div className="text-[20px] font-medium tracking-[0.15px] text-black">
                        You May Also Need
                      </div>
                      <div className="accessories-data flex flex-col gap-[20px]">
                        {variantProductData &&
                          variantProductData?.map((accessories: any, index: number) => (
                            <div
                              className="product-card flex flex-col items-center gap-[20px] border border-[#cccbcb] p-[20px] sm:flex-row"
                              key={index}
                            >
                              <ProductAccessories
                                accessories={accessories}
                                fanPopup={fanPopup}
                                blankAddImg={blankAddImg}
                                index={index}
                                currencyCode={productData?.extendedSalePrice?.currencyCode}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {cartItemsData && (
                <>
                  <hr className="" />
                  <div className="footer-section flex flex-col gap-[20px]">
                    <div className="subtotal-section flex flex-col items-start gap-[10px]">
                      <div className="text-[20px] font-medium tracking-[0.15px] text-[#008BB7]">
                        Free Shipping
                      </div>
                      <div className="flex w-full flex-row items-start justify-between gap-[10px]">
                        <div className="items-qty text-[20px] font-medium tracking-[0.15px] text-black">
                          Subtotal ({cartItemsData?.lineItems?.totalQuantity}){' '}
                          {cartItemsData?.lineItems?.totalQuantity > 1 ? 'items' : 'item'}:
                        </div>
                        <div className="total-price text-[20px] font-medium tracking-[0.15px] text-black">
                          {cartItemsData?.totalExtendedListPrice?.currencyCode &&
                            format.number(cartItemsData?.totalExtendedListPrice?.value, {
                              style: 'currency',
                              currency: cartItemsData?.totalExtendedListPrice?.currencyCode,
                            })}
                        </div>
                      </div>
                    </div>
                    <div className="cart-buttons flex flex-col items-start gap-[10px] ssm:flex-row">
                      <Dialog.Close asChild>
                        <Link
                          className="flex h-[41px] w-[100%] flex-row items-center justify-center self-stretch rounded-[3px] border border-[#b3dce8] text-[14px] text-sm font-medium uppercase tracking-[1.25px] text-[#002A37] hover:text-secondary"
                          href="/cart"
                        >
                          View Cart
                        </Link>
                      </Dialog.Close>
                      <CheckoutButton cartId={cartItemsData?.entityId} />
                    </div>
                  </div>
                </>
              )}
              <Dialog.Close asChild>
                <button
                  aria-modal
                  className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full"
                  aria-label="Close"
                ></button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
