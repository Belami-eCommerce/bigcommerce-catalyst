'use client';

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode, useState, SyntheticEvent } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { type Locale, LocaleSwitcher } from './locale-switcher';
import { MobileNav } from './mobile-nav';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { imageIconList } from '~/app/[locale]/(default)/(auth)/fragments';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface Link {
  label: string;
  href: string;
}

interface Group {
  label: string;
  href: string;
  links?: Link[];
}

interface Image {
  src: string;
  altText: string;
}

interface Links {
  label: string;
  href: string;
  groups?: Group[];
}

interface Props extends ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  account?: ReactNode;
  activeLocale?: string;
  locales: Locale[];
  cart?: ReactNode;
  links: Links[];
  locale?: ReactNode;
  logo?: string | Image;
  search?: ReactNode;
}

const Header = ({
  account,
  activeLocale,
  cart,
  className,
  links,
  locales,
  logo,
  search,
}: Props) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuToggle = (linkHref: string) => (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpenMenuId(openMenuId === linkHref ? null : linkHref);
  };

  // Add this new handler for menu item clicks
  const handleMenuItemClick = () => {
    setOpenMenuId(null);
  };

  return (
    <div className={cn('relative', className)}>
      <header className="main-header flex h-[92px] !max-w-[100%] items-center justify-between gap-1 overflow-y-visible bg-white p-[0px_4em] !px-[40px] 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
        <div className="flex items-center space-x-4">
          <CustomLink className="home-logo-one overflow-hidden text-ellipsis py-3" href="/">
            {typeof logo === 'object' ? (
              <div className="hidden items-center space-x-2 lg:flex">
                <BcImage
                  alt={logo.altText}
                  className="max-h-16 object-contain"
                  height={32}
                  priority
                  src={logo.src}
                  width={155}
                />
              </div>
            ) : (
              <span className="truncate text-2xl font-black">{logo}</span>
            )}
          </CustomLink>

          <CustomLink className="home-logo-two overflow-hidden text-ellipsis pt-3 md:pl-5" href="/">
            {typeof logo === 'object' ? (
              <div className="second-home-logo block lg:hidden">
                <BcImage
                  alt="homeLogo"
                  className="max-h-16 object-contain"
                  height={30}
                  priority
                  src={imageIconList.homeLogo}
                  width={30}
                />
              </div>
            ) : (
              <span className="truncate text-2xl font-black">{imageIconList.homeLogo}</span>
            )}
          </CustomLink>
        </div>

        <div className="header-search-bar flex items-center gap-2 lg:gap-4">
          {search}
          <nav className="header-nav-support flex gap-2 lg:gap-4">{account}</nav>
          <nav className="header-cart flex gap-2 lg:gap-9">{cart}</nav>
          {activeLocale && locales.length > 0 ? (
            <LocaleSwitcher activeLocale={activeLocale} locales={locales} />
          ) : null}

          <MobileNav links={links} logo={logo} account={''} />
        </div>
      </header>

      <div className="header-bottom mx-auto flex max-w-full items-center justify-between border-b border-t border-[#cccbcb] bg-white px-4 pb-4 pt-4 lg:mt-[30px] lg:px-10 xl:mt-0">
        <NavigationMenuPrimitive.Root id="nav-menu-root" className="hidden lg:block">
          <NavigationMenuPrimitive.List
            id="nav-menu-list"
            className="flex items-center gap-2 text-[16px] !font-normal lg:gap-4"
          >
            {links.map((link) =>
              link.groups && link.groups.length > 0 ? (
                <NavigationMenuPrimitive.Item id={`nav-menu-item-${link.href}`} key={link.href}>
                  <div
                    id={`nav-menu-trigger-${link.href}`}
                    className="group/button font-semiboldd flex items-center hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    onClick={handleMenuToggle(link.href)}
                  >
                    <CustomLink
                      id={`nav-menu-link-${link.href}`}
                      className="p-3 font-normal"
                      href={link.href}
                      onClick={(e) => e.preventDefault()}
                    >
                      {link.label}
                    </CustomLink>
                  </div>

                  {openMenuId === link.href && (
                    <div
                      id={`nav-menu-content-${link.href}`}
                      className="absolute left-0 top-[4.8em] z-50 w-auto bg-white py-8 shadow-xl"
                    >
                      <div className="relative mx-auto grid max-w-[95em] grid-cols-[repeat(6,auto)] gap-6 px-12">
                        <button
                          className="absolute -top-[1em] right-[1em] text-gray-600 hover:text-gray-800 focus:outline-none"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        {link.groups.map((group, index) => (
                          <div key={group.href} className="min-w-fit whitespace-nowrap">
                            <ul
                              id={`nav-menu-group-${group.href}`}
                              className="flex flex-col space-y-2"
                            >
                              <li id={`nav-menu-group-item-${group.href}`}>
                                <CustomLink
                                  id={`nav-menu-group-link-${group.href}`}
                                  className="block border-b border-gray-200 pb-2 text-[15px] font-[500] hover:text-primary"
                                  href={group.href}
                                  onClick={handleMenuItemClick} // Add click handler here
                                >
                                  {group.label}
                                </CustomLink>
                              </li>
                              {group.links?.map((nestedLink) => (
                                <li
                                  id={`nav-menu-nested-item-${nestedLink.href}`}
                                  key={nestedLink.href}
                                >
                                  <CustomLink
                                    id={`nav-menu-nested-link-${nestedLink.href}`}
                                    className="block py-1.5 text-[14px] font-[400] text-gray-600 hover:text-primary"
                                    href={nestedLink.href}
                                    onClick={handleMenuItemClick} // Add click handler here
                                  >
                                    {nestedLink.label}
                                  </CustomLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </NavigationMenuPrimitive.Item>
              ) : (
                <NavigationMenuPrimitive.Item id={`nav-menu-item-${link.href}`} key={link.href}>
                  <CustomLink
                    id={`nav-menu-link-${link.href}`}
                    className="p-3 font-semibold"
                    href={link.href}
                  >
                    {link.label}
                  </CustomLink>
                </NavigationMenuPrimitive.Item>
              ),
            )}
          </NavigationMenuPrimitive.List>
        </NavigationMenuPrimitive.Root>

        <nav className="static-menu-class relative right-[1em] hidden items-center gap-10 text-[16px] font-normal text-[#008bb7] lg:flex lg:gap-5">
          <CustomLink href="/new" className="font-semiboldd hover:text-primary">
            New
          </CustomLink>
          <CustomLink href="/sale" className="font-semiboldd hover:text-primary">
            Sale
          </CustomLink>
          <CustomLink href="/blog" className="font-semiboldd hover:text-primary">
            Blog
          </CustomLink>
          <CustomLink href="/brands" className="font-semiboldd hover:text-primary">
            Our Brands
          </CustomLink>
        </nav>
      </div>
    </div>
  );
};

Header.displayName = 'Header';

export { Header, type Links };