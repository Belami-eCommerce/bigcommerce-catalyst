import { ShoppingCart, User, Hand } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { localeLanguageRegionMap } from '~/i18n/routing';

import { Link } from '../link';
import { Button } from '../ui/button';
import { Dropdown } from '../ui/dropdown';
import { Header as ComponentsHeader } from '../ui/header';

import { logout } from './_actions/logout';
import { CartLink } from './cart';
import { HeaderFragment } from './fragment';
import { QuickSearch } from './quick-search';
import { BcImage } from '../bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

interface Props {
  cart: ReactNode;
}


const headerCart = imageManagerImageUrl('header-cart-icon.png', '25w');


export const Header = async ({ cart }: Props) => {
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');
  const customerId = await getSessionCustomerId();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerId ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const data = readFragment(HeaderFragment, response).site;

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);

  const links = categoryTree.map(({ name, path, children }) => ({
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));

  return (
    <ComponentsHeader
      account={
        <div className="flex items-center">
          {/* Support Dropdown */}
          <Dropdown
            items={[
              { href: '/support/faqs', label: 'Existing Purchase' },
              { href: '/support/contact', label: 'Order Status' },
              { href: '/support/contact', label: 'Return/Replacement' },
              { href: '/support/contact', label: 'Gift Certificates' },
              { href: '/support/contact', label: 'Visit Our Help Center' },
              { href: '/support/contact', label: 'New Purchase' },
              { href: '/support/contact', label: 'Contact ' },
            ]}
            trigger={
              <Button
                aria-label={'Support'}
                className="p-3 text-black hover:bg-transparent hover:text-primary"
                variant="subtle"
              >
                {/* <Hand className="mr-2" /> */}

                <BcImage
                  alt="an assortment of brandless products against a blank background"
                  className="mr-2"
                  height={28}
                  priority={true}
                  src={imageManagerImageUrl('waving-hand-1-.png', '20w')}
                  width={28}
                />

                {'Support'}
              </Button>
            }
          />

          {/* Account Dropdown */}
          <Dropdown
            items={
              customerId
                ? [
                    { href: '/account', label: 'My Account' },
                    { href: '/account/favorites', label: 'Favorites' },
                    { href: '/account/purchase-history', label: 'Purchase History' },
                    { href: '/account/finance', label: 'Finance' },
                    { action: logout, name: 'Logout' },
                  ]
                : [
                    { href: '/login', label: 'Account' },
                    { href: '/login', label: 'My Account' },
                    { href: '/login', label: 'Favorites' },
                    { href: '/login', label: 'Purchase History' },
                    { href: '/login', label: 'Financing' },
                    { href: '/login', label: 'Login' },
                    { href: '/trade-account/trade-step1', label: 'trade1' },
                    { href: '/trade-account/trade-step2', label: 'trade2' },
                    { href: '/trade-account/trade-step3', label: 'trade3' },
                    
                  ]
            }
            trigger={
              <Button
                aria-label={t('Account.account')}
                className="p-3 text-black hover:bg-transparent hover:text-primary"
                variant="subtle"
              >
                <BcImage
                  className="mr-2"
                  alt="an assortment of brandless products against a blank background"
                  height={16}
                  priority={true}
                  src={imageManagerImageUrl('account-icon.png', '20w')}
                  width={16}
                />
                {t('Account.account')}
              </Button>
            }
          />
        </div>
      }
      activeLocale={locale}
      cart={
        <p role="status" className="header-cart-icon flex items-center">
          <Suspense
            fallback={
              <CartLink>
                <ShoppingCart className="hidden header-cart-link" aria-label="cart" />
              </CartLink>
            }
          >
            {cart}
          </Suspense>
        </p>
      }
      links={links}
      locales={localeLanguageRegionMap}
      logo={data.settings ? logoTransformer(data.settings) : undefined}
     
      search={<QuickSearch logo={data.settings ? logoTransformer(data.settings) : ''} />}
    />
  );
};

export const HeaderSkeleton = () => (
  <header className="flex min-h-[92px] !max-w-[100%] p-[0px_4em] animate-pulse items-center justify-between gap-1 overflow-y-visible bg-white 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto !px-[40px] 2xl:px-0">
    <div className="h-16 w-40 rounded bg-slate-200" />
    <div className="hidden space-x-4 lg:flex">
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
    </div>
    <div className="flex items-center gap-2 lg:gap-4">
      <div className="h-8 w-8 rounded-full bg-slate-200" />

      <div className="flex gap-2 lg:gap-4">
        <div className="h-8 w-8 rounded-full bg-slate-200" />
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>

      <div className="h-8 w-20 rounded bg-slate-200" />

      <div className="h-8 w-8 rounded bg-slate-200 lg:hidden" />
    </div>
  </header>
);