import { useTranslations } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';

export const DescriptionFragment = graphql(`
  fragment DescriptionFragment on Product {
    description
  }
`);

interface Props {
  product: FragmentOf<typeof DescriptionFragment>;
}

export const Description = ({ product }: Props) => {
  const t = useTranslations('Product.Description');

  if (!product.description) {
    return null;
  }

  return (
    <>
    <div className="product-overview">
    <h2 className="mb-1 text-[1.25rem] font-medium leading-[2rem] tracking-[0.15px] text-left text-[#353535] xl:text-[1.5rem] xl:font-normal xl:leading-[2rem] xl:mb-[1.5rem]">
  {t('heading')}
</h2>

      <div dangerouslySetInnerHTML={{ __html: product.description }} />
      </div>
    </>
  );
};
