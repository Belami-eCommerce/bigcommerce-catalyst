'use client';

import { useTranslations } from 'next-intl';
import { Pagination } from '~/components/ui/pagination';

import { usePathname } from '~/i18n/routing';
import { OrdersList } from './orders-list';
import Link from 'next/link';
import { ChangeEvent, useState } from 'react';
import { Input } from '~/components/ui/form';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { any } from 'zod';

const tabList = ['all', 'inprogress', 'delivered'] as const;

export type TabType = (typeof tabList)[number];

export const OrderListTabs = ({ orders, pageInfo, icon }: { orders: any, pageInfo: any, icon: any }) => {
  const t = useTranslations('Account.Orders');
  const pathname = usePathname();
  const [orderData, setOrderData] = useState(orders);
  const [activeTabData, setActiveTabData] = useState('all');

  const tabsTitles = {
    all: t('all'),
    inprogress: t('inprogress'),
    delivered: t('delivered'),
  };

  const handleOrderFilter = async (event: ChangeEvent<HTMLInputElement>) => {
    let eventValue: any = event?.target?.value;
    if (eventValue) {
      const orderInfo: any = [...orders];
      if (isNaN(eventValue)) {
        let lowerCaseString = eventValue?.toLowerCase();
        let orderDataInfo: any = [];
        orderInfo?.map((orderDatas) => {
          const shippingConsignments = orderDatas?.consignments?.shipping
            ? orderDatas?.consignments?.shipping.map(({ lineItems }) => ({
              lineItems: removeEdgesAndNodes(lineItems),
            })) : undefined;

          let orderFilterData = shippingConsignments?.[0]?.lineItems?.filter((orderVal: any) => (orderVal?.name?.toLowerCase())?.includes(lowerCaseString));
          if(orderFilterData?.length > 0) {
            orderDataInfo.push(orderDatas);
          }
        });
        setOrderData(orderDataInfo);
      } else {
        let orderFilterData = orderInfo.filter((orderVal: any) => (orderVal?.entityId?.toString())?.includes(eventValue));
        setOrderData(orderFilterData);
      }
    } else {
      setOrderData(orders);
    }
  }
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;

  return (
    <>
      <div className="text-[24px] font-normal leading-[32px] text-[#008BB7]">{t('lookupAnOrder')}</div>
      <div>
        <div>
          <input
            type="text"
            placeholder="Search by Keyword or Order Number"
            className="h-[44px] w-full rounded-[3px] border border-[#CCCBCB] bg-white p-[6px_20px]"
            onChange={() => handleOrderFilter(event)}
          />
        </div>
      </div>
      <div className="flex items-center gap-[5px] text-[16px] font-normal leading-[32px] tracking-[0.15px]">
        <div className="flex items-center">
          <img src="" alt="Hand Icon" className="h-[24px] w-[24px]" />
        </div>
        <div>{t('stillNeedHelp')} </div>
        <Link href="#" className="text-base font-semibold text-[#008BB7]">{t('contact')}</Link>
      </div>
      <div className="my-[10px]">
        <div className="flex h-[32px] flex-row items-center gap-[30px] p-0">
          <button className="flex flex-row items-center justify-center rounded-full bg-[#002A37] p-[0px_10px] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-white">
            All Orders
          </button>
          <button className="flex h-[32px] flex-row items-center justify-center rounded-full bg-[#E7F5F8] p-[0px_10px] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#002A37]">
            In Progress
          </button>
          <button className="flex h-[32px] flex-row items-center justify-center rounded-full bg-[#E7F5F8] p-[0px_10px] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#002A37]">
            Delivered
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-[55px]">
        {orderData.length === 0 ? (
          <div className="mx-auto w-fit">{t('noOrders')}</div>
        ) : (
          <>
            <OrdersList customerOrders={orderData} key={endCursor} />
            <Pagination
              className="my-0 flex inline-flex justify-center text-center"
              endCursor={endCursor ?? undefined}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              startCursor={startCursor ?? undefined}
            />
          </>
        )}
      </div>
    </>
  );
};