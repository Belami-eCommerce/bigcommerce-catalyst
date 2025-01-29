import { getFormatter, getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';

import { getActivePromotions } from '~/belami/lib/fetch-promotions';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { Search } from './search';


export async function generateMetadata() {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage(props: Props) {
  const searchParams = await props.searchParams;

  const priceMaxTriggers = {
    d: searchParams['d'],
    source: searchParams['source']
  }

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const t = await getTranslations('Search');
  const f = await getTranslations('FacetedGroup');

  const format = await getFormatter();

  const searchTerm = typeof searchParams.query === 'string' ? searchParams.query : undefined;

  const promotions = await getActivePromotions(true);

  /*
  if (!searchTerm) {
    return <EmptySearch />;
  }
  */

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs category={{breadcrumbs: {edges: [{node: {name: t('title'), path: '/search'}}]}}} />
      <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
        {searchTerm 
          ? <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('searchResults')}: <b className="text-2xl font-bold lg:text-3xl">"{searchTerm}"</b></h1>
          : <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{t('title')}</h1>
        }
      </div>
      <Search query={searchTerm} promotions={promotions} useDefaultPrices={useDefaultPrices} priceMaxTriggers={priceMaxTriggers} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
