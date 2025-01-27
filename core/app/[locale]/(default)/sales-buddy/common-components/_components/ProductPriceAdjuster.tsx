"use client";
import React, { useEffect, useState } from 'react';
import { Input } from '../Input';
import { useRouter } from 'next/navigation';

import {updateProductPrice} from '../../_actions/update-price'
import Spinner from './Spinner';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
interface ProductPriceAdjusterProps {
  parentSku: string;
  sku: string;
  oem_sku:string;
  productPrice: number;
  initialCost: number;
  initialFloor: number;
  initialMarkup: number;
  productId: number;
  cartId:any;
  ProductType:string
}
const EditIcon =()=>{
  return (
    <svg width="19" height="14" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {' '}
      <path
        d="M1.7028 17.9723C1.3528 18.0556 1.04864 17.9681 0.790302 17.7098C0.531969 17.4515 0.444469 17.1473 0.527802 16.7973L1.5278 12.0223L6.4778 16.9723L1.7028 17.9723ZM6.4778 16.9723L1.5278 12.0223L12.9778 0.572314C13.3611 0.188981 13.8361 -0.00268555 14.4028 -0.00268555C14.9695 -0.00268555 15.4445 0.188981 15.8278 0.572314L17.9278 2.67231C18.3111 3.05565 18.5028 3.53065 18.5028 4.09731C18.5028 4.66398 18.3111 5.13898 17.9278 5.52231L6.4778 16.9723ZM14.4028 1.97231L4.0528 12.3223L6.1778 14.4473L16.5278 4.09731L14.4028 1.97231Z"
        fill="white"
      />{' '}
    </svg>
  );
}

const ProductPriceAdjuster: React.FC<ProductPriceAdjusterProps> = ({
  parentSku,
  sku,
  oem_sku,
  productPrice,
  initialCost,
  initialFloor,
  initialMarkup,
  productId,
  cartId,
  ProductType
  
}) => {
  const [cost, setCost] = useState<number>(initialCost);
  const [floor] = useState<number>(initialFloor);
  const [markup] = useState<number>(initialMarkup);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newCost, setNewCost] = useState<string>(cost.toString());
  const [isSave, setIsSave] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const {  agentRole } = useCompareDrawerContext();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const skuLength = 15;

  const handleSave = () => {
    if ((agentRole === 'agent' || agentRole === null) && parseFloat(newCost) < initialCost * floor) {
      setErrorMessage('Agent cannot adjust price less than floor price');
      return;
    }
    setCost(parseFloat(newCost)); // Update the cost value
    setIsEditing(false); // Exit editing mode
    setErrorMessage(null); // Clear error message
  };

  const handleSubmit = async () => {
    const numericValue = parseFloat(newCost);
    if (newCost.trim() === '') {
      setErrorMessage('Price cannot be empty');
      return;
    }
    if ((agentRole === 'agent' || agentRole === null) && numericValue < initialCost * floor) {
      setErrorMessage('Price cannot be less than floor price');
      return;
    }
    setLoading(true);
    let res = await updateProductPrice(numericValue, cartId, productId, ProductType, sku);
    console.log('res');
    console.log(res)
    if(res.status == 200){
      setIsSave(true);
      setLoading(false)
    }else{
      setLoading(false);
      console.log('show error message' + res.error);
    }
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) ) {
      setNewCost(value);
      const numericValue = parseFloat(value);
      if ((agentRole === 'agent' || agentRole === null) && numericValue < initialCost * floor) {
        setErrorMessage('Price cannot be less than floor price');
      } else {
        setErrorMessage(null);
      }
    }
  };

  const router = useRouter();
  // useEffect(()=>{
    
  // },[isSave]);
if (isSave) {
  router.refresh();
  setIsSave(false);
  setIsEditing(false);
  setLoading(false);
}

  const ProductInfoRow = ({ label, value }: { label: string; value: string | number }) => {
    const valueString = String(value);
    const isLongValue = valueString.length > 15;

    return (
      <div className={`${isLongValue ? 'grid grid-cols-1' : 'grid grid-cols-2'} items-center border-b border-[#cccbcb] py-1`}>
        <p className="text-sm font-bold tracking-wide break-words">{label}</p>
        <p className={`
        text-sm font-normal tracking-wide 
        ${isLongValue ? 'mt-1' : 'text-right'}
        ${isLongValue ? 'text-left' : ''}
      `}>
          {valueString}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#353535] p-[10px] text-white">

      <ProductInfoRow label="PARENT SKU " value={parentSku} />
      <ProductInfoRow label="SKU" value={sku } />
      <ProductInfoRow label="OEM SKU" value={oem_sku} />
      <ProductInfoRow label="Cost" value={initialCost ? initialCost : '0000.00'} />
      <ProductInfoRow label="Floor ($)" value={floor ? initialCost * floor : '0000.00'} />
      <ProductInfoRow label="Markup" value={floor ? initialCost * floor : '0000.00'} />
      {/* Adjust Price Button */}
      
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full rounded-sm bg-[#1DB14B] px-[10px] py-[5px] h-[42px]"
        >
          <div className="flex items-center justify-center">
            {' '}
            {/* Changed justify-content to justify-center */}
            <EditIcon />
            {/* Added width and height for icon size */}
            <span className="text-[14px] font-medium tracking-[1.25px] leading-[32px] items-center">ADJUST PRICE</span> {/* Added margin for spacing */}
          </div>
        </button>
      )}

      {/* Input and Save/Cancel Buttons */}
      {isEditing && (
        <>
          <Input
            type="text"
            value={newCost}
            style={{ color: 'black' }}
            onChange={handleCostChange}
            className="text-black-700 mb-4 w-full rounded border-none bg-[#FFFFFF] p-2"
            placeholder="$0.00"
          />
          {errorMessage && (
            <div className="text-red-500 text-center m-2">{errorMessage}</div>
          )}

          <div className="mt-[10px] flex items-center justify-center">
            <button
              onClick={() => setIsEditing(false)}
              className="mb-2 mr-2 w-full rounded bg-white px-4 py-2 text-black"
            >
              Cancel
            </button>
           
            <button
              className="relative mb-2 w-full rounded bg-[#1DB14B] px-4 py-2 text-white"
              onClick={handleSubmit}
              disabled={(agentRole === 'agent' || agentRole === null) && parseFloat(newCost) < initialCost * floor}
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <span className="">Save</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPriceAdjuster;
