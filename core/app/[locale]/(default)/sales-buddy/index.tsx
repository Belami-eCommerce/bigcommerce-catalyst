'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import AppIcon from './assets/support_agent.png';
import DrawerModal from './common-components/SalesBuddyDrawer/SalesBuddyDrawer';
import ChatIcon from './assets/DrawerIcon.png'; // Replace with your chat icon path
import { usePathname } from 'next/navigation';
import CustomerSupportPage from './common-components/_components/CustomerSupportPage';
import CartInterface from './common-components/_components/CartInterfacePage';
import ReferalId from './common-components/_components/CartReferralPage';
import SalesBuddyProductPage from './common-components/_components/PDPPage';
import PLPPageInterface from './common-components/_components/PLPPageInterface';


interface Props{
  cartId:string;
}
export default function SalesBuddyAppIndex({cartId}:Props) {
  const [isOpen, setIsOpen] = useState(false); 
  const path = usePathname();
  const toggleDrawer = () => setIsOpen(!isOpen);

  const renderDrawerContent = () => {
    if (path.indexOf('/cart/') > -1) {
      return (
        <div className="space-y-[20px]">
          <ReferalId cartId={cartId} />
          <CartInterface />
          <CustomerSupportPage />
        </div>
      );
    }else if (path.indexOf('/c/') > -1 || path.indexOf('/search/') > -1) {
      return (
        <div className="space-y-[20px]">
          <CustomerSupportPage />
          <PLPPageInterface />
        </div>
      );
    }else if (path.indexOf('/p/') !==-1) {
      return (
        <div className=" space-y-[20px] ">
          <SalesBuddyProductPage />
          <CustomerSupportPage />
        </div>
      );
    }else{
      return (
        <div className=" space-y-[20px] ">
          <CustomerSupportPage />
        </div>
      );
    }
    return null; 
  };

  return (
    <>
      {/* Chat Button */}
      <div className="no-scrollbar h-full justify-start bg-[#F3F4F5]">
        <button onClick={toggleDrawer} className="fixed bottom-[1vh] left-[1vh] flex">
          <Image src={ChatIcon} alt="Chat Icon" className="h-[164px] w-[164px] object-cover" />
        </button>
      </div>

      {/* Drawer Modal */}
      <DrawerModal
        isOpen={isOpen}
        onClose={toggleDrawer}
        headerTitle="Agent Tools"
        headerIcon={AppIcon}
        position={path === '/cart/' ? 'right' : 'left'}
        width="500px"
      >
        <div className="h-full w-[460px] bg-[#F3F4F5]">{renderDrawerContent()}</div>
      </DrawerModal>
    </>
  );
}
