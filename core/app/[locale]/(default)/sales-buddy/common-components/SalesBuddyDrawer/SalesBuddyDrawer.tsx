import React from 'react';
import Image from 'next/image';

interface DrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerTitle: string;
  headerIcon: string;
  children: React.ReactNode;
  position?: 'left' | 'right'; // Determines if modal slides in from left or right
  width?: string; // Allows custom width
}

export default function DrawerModal({
  isOpen,
  onClose,
  headerTitle,
  headerIcon,
  children,
  position = 'left',
  width = '500px',
}: DrawerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex ${position === 'left' ? 'justify-start' : 'justify-end'}`}
      onClick={onClose}
    >
      <div
        className="relative h-full overflow-y-auto bg-[#f3f4f5] shadow-lg"
        style={{ transform: 'translateX(0)', width }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-[#353535] px-[40px] py-[20px] text-white">
          <div className="flex items-center gap-[10px]">
            <Image className="h-[25.2px] w-[28px]" src={headerIcon} alt="header-icon" />
            <span className="font-sans text-[24px] font-bold">{headerTitle}</span>
          </div>
          <button onClick={onClose} className="h-[14px] w-[14px] text-white hover:text-gray-700">
            ✖
          </button>
        </div>

        {/* Modal Content */}
        <div className="bg-[#f3f4f5] px-[20px] py-[40px]">{children}</div>
      </div>
    </div>
  );
}
