import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { CompareDrawer } from './compare-drawer';

interface Image {
  altText: string;
  src: string;
}

interface Product {
  id: string;
  name: string;
  image?: Image;
}

const CompareDrawerContext = createContext<{
  products: Product[];
  setProducts: (products: Product[]) => void;
  agentLoginStatus: boolean;
  setAgentLoginStatus: (value: boolean) => void;
  agentRole: string | null;
  setAgentRole: (value: string | null) => void;
  agentName: string | null;
  setAgentName: (value: string | null) => void;
  context_session_id: string | null;
  setContext_Session_id: (value: string | null) => void;
} | null>(null);

const isCheckedProducts = (products: unknown): products is Product[] => {
  return (
    Array.isArray(products) &&
    products.every((product) => product !== null && typeof product === 'object' && 'id' in product)
  );
};

const CompareDrawerProvider = ({ children }: PropsWithChildren) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [agentLoginStatus, setAgentLoginStatus] = useState(false); 
  const [agentRole, setAgentRole] = useState<string | null>(null); 
  const [agentName, setAgentName] = useState<string | null>(null); 
  const [context_session_id, setContext_Session_id] = useState<string | null>(null);
  useEffect(() => {
    setAgentLoginStatus(localStorage.getItem('agent_login') === 'true');
    setAgentRole(localStorage.getItem('agent_role'));
    setAgentName(localStorage.getItem('agent_name'));
  }, []);

  useEffect(() => {
    const stringProducts = sessionStorage.getItem('compareProducts');

    if (stringProducts && stringProducts !== '[]') {
      try {
        const parsedProducts: unknown = JSON.parse(stringProducts);

        if (isCheckedProducts(parsedProducts)) {
          setProducts(parsedProducts);
        }
      } catch {
        throw new Error('Error parsing compareProducts from sessionStorage');
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('compareProducts', JSON.stringify(products));
  }, [products]);
  return (
    <CompareDrawerContext.Provider value={{ products, setProducts, agentLoginStatus, setAgentLoginStatus, agentRole, setAgentRole, setAgentName, agentName, context_session_id, setContext_Session_id }}>
      {children}
      <CompareDrawer />
    </CompareDrawerContext.Provider>
  );
};

function useCompareDrawerContext() {
  const context = useContext(CompareDrawerContext);

  if (!context) {
    throw new Error('useCompareDrawerContext must be used within a CompareDrawerProvider');
  }

  return context;
}

export { CompareDrawerProvider, useCompareDrawerContext, type Product };
