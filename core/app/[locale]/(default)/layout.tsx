import { draftMode } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren, Suspense } from 'react';

import { Footer } from '~/components/footer/footer';
import { Header, HeaderSkeleton } from '~/components/header';
import { MakeswiftProvider } from '~/lib/makeswift/provider';
import { Cart } from '~/components/header/cart';
import { LocaleType } from '~/i18n/routing';
import SalesBuddyPage from './sales-buddy/page';
const flagSalesBuddy = Number(process.env.SALES_BUDDY_FLAG);

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <MakeswiftProvider previewMode={(await draftMode()).isEnabled}>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header cart={<Cart />} />
      </Suspense>
      {/* //I want to add some components here if it was login page  */}
      {/* Can you make it */}
      <main className="main-slider">
        {children}
      </main>
      <Suspense>
        <Footer />
        {flagSalesBuddy
          ? <SalesBuddyPage/>
          : ''
        }
      </Suspense>
    </MakeswiftProvider>
  );
}
