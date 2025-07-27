'use client';

import { ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

type BottomSheetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: string;
};

const BottomSheetModal = ({ isOpen, onClose, height = 'auto', children }: BottomSheetModalProps) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[1200] transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height }}
      >
        <div className="relative bg-white rounded-t-3xl shadow-xl h-full px-6 pt-5 pb-8">
          {/* Close Icon */}
          <IconButton
            onClick={onClose}
            className="absolute top-2 left-70 text-gray-500 hover:text-gray-700"
            size="small"
          >
            <CloseIcon />
          </IconButton>

          {/* Content */}
          <div className="flex flex-col items-center text-center pt-1 mt-0">{children}</div>
        </div>
      </div>
    </>
  );
};

export default BottomSheetModal;
