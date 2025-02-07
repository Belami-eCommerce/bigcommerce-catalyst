import { useTranslations } from 'next-intl';

export const FreeDelivery = () => {
  const t = useTranslations('freeDelivery'); 

  return (
    <div className="product-free-delivery">
      <div className="mt-0 xl:mt-3 xl:text-left  lg:text-left text-center text-base font-normal leading-[2rem] tracking-tight text-[#353535]">
        {t('title')} {/* Free Delivery */}
      </div>
      <div className="Yellow-600 mb-7 w-fit bg-yellow-50 p-1 text-left text-sm font-normal leading-6 tracking-wider hidden xl:block">
        {t('description')} {/* This product is backordered until mm/dd. */}
      </div>
    </div>
  );
};


