'use client';

import { createContext, forwardRef, type PropsWithChildren, type Ref, useContext } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

export interface ContextProps {
  defaultLogo: string;
  loggedIn: boolean;
}

const PropsContext = createContext<ContextProps>({ defaultLogo: '', loggedIn: false });

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface Props {
  links: Array<{ label: string; link: { href: string } }>;
  logo?: string;
}

export const MakeswiftHeader = forwardRef(({ links, logo }: Props, ref: Ref<HTMLDivElement>) => {
  const { loggedIn, defaultLogo } = useContext(PropsContext);

  return (
    <div className="flex items-center justify-between bg-white px-8 py-4 shadow-sm" ref={ref}>
      <div className="flex items-center">
        <BcImage
          alt="Logo"
          className="max-h-16 object-contain transition-opacity hover:opacity-90"
          height={32}
          priority
          src={logo ?? defaultLogo}
          width={155}
        />
      </div>

      <nav className="flex items-center gap-4">
        {links.map(({ label, link }) => (
          <Link
            className="font-medium text-gray-600 transition-colors hover:text-gray-900"
            href={link.href}
            key={label}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
          {loggedIn ? 'Account' : 'Login'}
        </button>
      </div>
    </div>
  );
});
