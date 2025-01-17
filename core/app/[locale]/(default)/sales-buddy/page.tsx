"use client"
import React, { useEffect, useState } from 'react'
import SalesBuddyAppIndex from '.'
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { usePathname } from 'next/navigation';
import { InsertShopperVisitedUrl } from './_actions/insert-shopper-url';

export default function SalesBuddyPage() {
  const { agentLoginStatus, setAgentLoginStatus, context_session_id } = useCompareDrawerContext();

  useEffect(() => {
    const handleStorageChange = () => {
      setAgentLoginStatus(localStorage.getItem('agent_login') === 'true')
    };
  }, [agentLoginStatus]);
  const path = usePathname();
  useEffect(() => {
    if (context_session_id){
      const fullUrl = `${window.location.protocol}//${window.location.host}${path}`;
      const previousUrl = localStorage.getItem('previous_url');
      if (previousUrl !== fullUrl) {
        const insertShopperVisitedUrlFunc = async () => {
          try {
            await InsertShopperVisitedUrl(context_session_id, fullUrl);
            localStorage.setItem('previous_url', fullUrl);
          } catch (error) {
            console.error('Error inserting shopper visited URL:', error);
          }
        };
        insertShopperVisitedUrlFunc();
      }
    }
  }, [path]);
  
  return (
    <div className='hidden sm:block md:block lg:block z-[999]'>{agentLoginStatus && <SalesBuddyAppIndex />}</div>
  );
}
