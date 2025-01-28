import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { CommonSettingPriceMaxLogicApi, getCommonSettingByBrandChannel, GetProductMetaFields, GetProductVariantMetaFields } from '../management-apis';

interface MetaField {
  entityId: number;
  key: string;
  value: string;
  description?: string;
  id?: number;
  namespace?: string;
  resource_type?: string;
  resource_id?: number;
  date_created?: string;
  date_modified?: string;
  owner_client_id?: string;
}

interface Variant {
  entityId: number;
  sku: string;
}

interface ProcessedDetail {
  category: string;
  order: number;
  mainOrder: number;
  key: string;
  value: string;
}

interface GroupedDetails {
  category: string;
  order: number;
  details: ProcessedDetail[];
}

interface MetaFieldResponse {
  metaField: MetaField | null;
  productMetaField: MetaField | null;
  message: string;
  hasVariantOptions: boolean;
  isVariantData: boolean;
}

interface ProcessedMetaFieldsResponse {
  variantDetails: MetaField[];
  groupedDetails: GroupedDetails[];
}

interface IncludedItem {
  name: string;
}

interface IncludedItemsResponse {
  productLevel: IncludedItem[];
  variantLevel: IncludedItem[];
}

interface ExcludedMetaFields {
  keys: string[];
  categories: string[];
}

// Define excluded metadata
const excludedMetaFields: ExcludedMetaFields = {
  keys: ['spec_sheet', 'install_sheet', 'included', 'ratings_certifications'],
  categories: [
    'Other', // Exclude the Other category entirely
  ],
};

// Helper function to check if a field should be excluded
const shouldExcludeField = (key: string, category: string): boolean => {
  return excludedMetaFields.keys.includes(key) || excludedMetaFields.categories.includes(category);
};

// Helper function to format values
export const formatValue = (value: string): string => {
  try {
    const parsed = JSON.parse(value);

    // Handle arrays
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            // If array contains objects, try to extract meaningful values
            return Object.values(item).join(', ');
          }
          return item.toString();
        })
        .join(', ');
    }

    // Handle objects
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed).join(', ');
    }

    return parsed.toString();
  } catch {
    // If we can't parse it, return the original value
    return value.toString();
  }
};

// Process meta fields into grouped details
export const processMetaFields = (metaFields: MetaField[]): GroupedDetails[] => {
  const processed = metaFields
    .filter((field) => {
      // First filter out any fields we don't want to process
      try {
        const [, category] = (field.description || '').split('|');
        return !shouldExcludeField(field.key, category || 'Other');
      } catch {
        return false; // Exclude if we can't parse the description
      }
    })
    .map((field) => {
      try {
        const [mainOrder, category, key, subOrder] = (field.description || '').split('|');
        // Format the key to be more readable
        const formattedKey =
          key ||
          field.key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return {
          category: category || 'Other',
          order: parseInt(subOrder || '0', 10),
          mainOrder: parseInt(mainOrder || '0', 10),
          key: formattedKey,
          value: formatValue(field.value),
        };
      } catch (error) {
        return null; // Return null for any entries we can't process
      }
    })
    .filter((item): item is ProcessedDetail => item !== null); // Filter out null entries

  const groupedByCategory = processed.reduce((acc, item) => {
    const existing = acc.find((group) => group.category === item.category);
    if (existing) {
      existing.details.push(item);
    } else {
      acc.push({
        category: item.category,
        order: item.mainOrder,
        details: [item],
      });
    }
    return acc;
  }, [] as GroupedDetails[]);

  return groupedByCategory
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      ...group,
      details: group.details.sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.details.length > 0); // Remove any empty groups
};

// Fetch variant details
export const fetchVariantDetails = async (product: any): Promise<ProcessedMetaFieldsResponse> => {
  if (!product?.entityId) {
    throw new Error('Product ID is missing');
  }

  let variantDetails: MetaField[] = [];
  let groupedDetails: GroupedDetails[] = [];

  try {
    let variantData: Variant[] = removeEdgesAndNodes(product?.variants) as Variant[];
    const currentSku = product.sku;
    const matchingVariant = variantData.find((variant) => variant.sku === currentSku);

    if (matchingVariant?.entityId) {
      const variantMetaFields = await GetProductVariantMetaFields(
        product.entityId,
        matchingVariant.entityId,
        'Details',
      );

      if (variantMetaFields) {
        variantDetails = variantMetaFields;
        groupedDetails = processMetaFields(variantMetaFields);
      }
    }

    return {
      variantDetails,
      groupedDetails,
    };
  } catch (error) {
    console.error('Error fetching variant details:', error);
    return {
      variantDetails: [],
      groupedDetails: [],
    };
  }
};

// Fetch included items
export const fetchIncludedItems = async (
  product: any,
  productMetaFields: MetaField[],
): Promise<IncludedItemsResponse> => {
  let productLevelItems: IncludedItem[] = [];
  let variantLevelItems: IncludedItem[] = [];

  try {
    const productIncludedMeta = productMetaFields?.find(
      (meta: MetaField) => meta.key === 'included',
    );

    if (productIncludedMeta) {
      try {
        productLevelItems = JSON.parse(productIncludedMeta.value);
      } catch (parseError) {
        console.error('Error parsing product level included items');
      }
    }

    const variantIncludedData = await getMetaFieldsByProduct(product, 'included');
    if (variantIncludedData?.isVariantData && variantIncludedData?.metaField?.value) {
      try {
        variantLevelItems = JSON.parse(variantIncludedData.metaField.value);
      } catch (parseError) {
        console.error('Error parsing variant level included items');
      }
    }

    return {
      productLevel: productLevelItems,
      variantLevel: variantLevelItems,
    };
  } catch (error) {
    console.error('Error fetching included items:', error);
    return {
      productLevel: [],
      variantLevel: [],
    };
  }
};

export const getVariantId = async (product: any) => {
  let getvariantData = removeEdgesAndNodes(product?.variants);
  if (getvariantData) {
    let getvariant: any = getvariantData?.find((variant: any) => variant?.sku === product?.sku);
    if (getvariant) {
      return getvariant?.entityId;
    }
  }
  return null;
};

export const getMetaFieldsByProduct = async (
  product: any,
  metaKey: string,
): Promise<MetaFieldResponse> => {
  let entityId = product?.entityId;
  let variantData: any = removeEdgesAndNodes(product?.variants);
  let optionsData: any = removeEdgesAndNodes(product?.productOptions);

  let result: MetaFieldResponse = {
    metaField: null,
    productMetaField: null,
    message: '',
    hasVariantOptions: false,
    isVariantData: false,
  };

  const productMetaFields = await GetProductMetaFields(entityId, '');
  if (productMetaFields) {
    const productMeta = productMetaFields?.find((meta: MetaField) => meta.key === metaKey);
    if (productMeta) {
      result.productMetaField = productMeta;
    }
  }

  const hasMatchingVariant = variantData?.some((variant: any) => variant.sku === product.sku);

  if (
    variantData &&
    Array.isArray(variantData) &&
    variantData.length > 0 &&
    optionsData &&
    Array.isArray(optionsData) &&
    optionsData.length > 0 &&
    hasMatchingVariant
  ) {
    const hasVariantOptions = optionsData.some((option: any) => option.isVariantOption === true);
    result.hasVariantOptions = hasVariantOptions;

    if (hasVariantOptions) {
      const variantId = await getVariantId(product);
      if (variantId) {
        const variantMetaFields = await GetProductVariantMetaFields(entityId, variantId, '');
        if (variantMetaFields && variantMetaFields.length > 0) {
          const variantMeta = variantMetaFields.find((meta: MetaField) => meta.key === metaKey);
          if (variantMeta) {
            result.metaField = variantMeta;
            result.message = 'Found both variant and product data';
            result.isVariantData = true;
            return result;
          }
        }
      }
      if (result.productMetaField) {
        result.message = 'No variant data found, showing product data only';
        result.isVariantData = false;
      }
    } else {
      if (result.productMetaField) {
        result.message = 'No variant options, showing product data only';
        result.isVariantData = false;
      }
    }
  } else {
    if (result.productMetaField) {
      result.message = 'No variant data available, showing product data only';
      result.isVariantData = false;
    }
  }

  return result;
};


export const commonSettinngs = async(brand_ids:any) =>{
    // 47, 111,    
    var res = await getCommonSettingByBrandChannel(brand_ids);        
    return res.output;
}
export const CommonSettingPriceMaxLogic=async(activationCode: any,skus: any)=>{
  
  var res = await CommonSettingPriceMaxLogicApi(activationCode,skus)
  return res.output;
}


export const ChangePriceBasedOnActivationCodeAndShowPDP =async (product: any, ActivationUrlCode:string, brandId:any) => {
  console.log('ActivationUrlCode, [brandId]----', ActivationUrlCode, [brandId]);
  
  var getDiscountValue = await CommonSettingPriceMaxLogic(ActivationUrlCode, [brandId]);
  var DiscountValueObject =
    getDiscountValue.length > 0 &&
    getDiscountValue?.find((item: any) => item?.bc_brand_ids?.includes(String(brandId)));
  if (ActivationUrlCode && DiscountValueObject && product.prices) {
    const discount = Number(DiscountValueObject?.discount) || 0; 
    const value =
      product?.prices?.salePrice?.value ??
      product?.prices?.basePrice?.value ??
      product?.prices?.price?.value;
    const numericValue = Number(value) || 0; 
    const discountedValue = numericValue - (discount * numericValue) / 100;
    const result = {
      original_price: numericValue,
      value: discountedValue,
      currencyCode: product?.prices?.price?.currencyCode || 'USD', 
      discount: discount,
    };
    return result;
  }
  return
};
export const ChangePriceBasedOnActivationCodeAndShow = async (
  product: any | any[],
  ActivationUrlCode: string,
  brandId: any,
) => {
  const getDiscountValue = await CommonSettingPriceMaxLogic(ActivationUrlCode, brandId);
 const DiscountValueObject = getDiscountValue?.length > 0 ? getDiscountValue?.[0]?.['bc_brand_ids'] : null;
  const calculatePrice = (productItem: any) => {
    if (DiscountValueObject?.includes(String(productItem.baseCatalogProduct.brand.entityId))) {
      if (ActivationUrlCode && DiscountValueObject && productItem?.originalPrice) {
        const discount = Number(getDiscountValue?.[0]?.["discount"]) || 0; // Default to 0 if undefined
        const value = productItem?.originalPrice.value;
        const numericValue = Number(value) || 0; 
        const discountedValue = numericValue - (discount * numericValue) / 100;
        productItem.activation_sale_price = {
          original_price: numericValue,
          value: discountedValue,
          currencyCode: productItem?.prices?.price?.currencyCode || 'USD', // Default to 'USD'
          discount: discount,
        };
        return productItem;
      }
    }
      return productItem;
  };
  if (Array.isArray(product)) {
    return product.map((item) => calculatePrice(item));
  } else {
    return calculatePrice(product);
  }
};




export const retrieveMpnData = (product: any, productid: Number, variantId: Number) => {
  if(product?.baseCatalogProduct?.variants) {
    let productVariants: any = removeEdgesAndNodes(product?.baseCatalogProduct?.variants);
    let productvariantData: any = productVariants.find((prod:any) => prod?.entityId == variantId);
    return productvariantData?.mpn ?? product?.sku;
  } else {
    return product?.sku;
  }
}

export const checkZeroTaxCouponIsApplied = async(checkoutData: any) => {
  let couponCodeArray: any = checkoutData?.coupons;
  let zeroTaxCoupon: number = 0;
  if(couponCodeArray?.length > 0) {
    let couponData: any = couponCodeArray?.find((discount: any) => discount?.code?.includes('ZEROTAX'));
    if(couponData) {
      zeroTaxCoupon = 1;
    }
  }
  return zeroTaxCoupon;
}

export const zeroTaxCalculation = async(cartObject: any) => {
  let checkoutData: any = cartObject?.checkout;
  let cartData:any = cartObject?.cart;
  if(await checkZeroTaxCouponIsApplied(checkoutData)) {
    let taxPercentage: number = 0;
    let subTotalAmount: number = checkoutData?.subtotal?.value || 0;
    let taxAmount: number = checkoutData?.taxTotal?.value || 0;
    taxPercentage = Number((subTotalAmount / taxAmount)?.toFixed(2));
    cartData?.lineItems?.physicalItems?.forEach((item: any) => {
      let couponDiscount: any = item?.couponAmount;
      let couponAmount: number = couponDiscount?.value;
      let qty: number = item?.quantity;
      let zeroTaxCheck: number = (couponAmount/qty);
      if(zeroTaxCheck == 0.1) {
        let productAmount = item?.extendedSalePrice?.value;
        let taxAmountForProduct: number = taxAmount * (productAmount/subTotalAmount);
        let taxAmountToReduce: number = productAmount/subTotalAmount;
        let apportionedTax = taxAmountForProduct * taxAmountToReduce;
        let applyDiscountAmount: number = taxAmountForProduct/taxAmountToReduce;
        console.log('========taxAmountForProduct=======', taxAmountForProduct);
        console.log('========taxAmountToReduce=======', taxAmountToReduce);
        console.log('========apportionedTax=======', apportionedTax);
        console.log('========applyDiscountAmount=======', applyDiscountAmount);
      }
    });
  }
}
