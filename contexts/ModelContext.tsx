import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalContextType {
  isOpen: boolean;
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
  modalContent: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const showModal = useCallback((content: ReactNode) => {

    setModalContent(content);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  return (
    <ModalContext.Provider value={{ isOpen, showModal, hideModal, modalContent }}>
      {children}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-transparent border border-zinc-200  flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
            {modalContent}
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;