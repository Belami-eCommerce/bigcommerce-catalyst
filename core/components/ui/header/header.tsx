import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { type Locale, LocaleSwitcher } from './locale-switcher';
import { MobileNav } from './mobile-nav';

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
}: Props) => (
  <div className={cn('relative', className)}>
    <header className="main-header flex h-[92px] items-center justify-between gap-1 overflow-y-visible bg-white px-4 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
      <CustomLink className="overflow-hidden text-ellipsis py-3" href="/">
        {typeof logo === 'object' ? (
          <BcImage
            alt={logo.altText}
            className="max-h-16 object-contain"
            height={32}
            priority
            src={logo.src}
            width={155}
          />
        ) : (
          <span className="truncate text-2xl font-black">{logo}</span>
        )}
      </CustomLink>

      <div className="flex items-center gap-2 lg:gap-4">
        {search}
        <nav className="header-nav-support flex gap-2 lg:gap-4">{account}</nav>
        <nav className="header-cart flex gap-2 lg:gap-9">{cart}</nav>
        {activeLocale && locales.length > 0 ? (
          <LocaleSwitcher activeLocale={activeLocale} locales={locales} />
        ) : null}

        <MobileNav links={links} logo={logo} />
      </div>
    </header>

    <div className="header-bottom flex items-center justify-between bg-white px-4 lg:px-10">
      <NavigationMenuPrimitive.Root id="nav-menu-root" className="hidden lg:block">
        <NavigationMenuPrimitive.List
          id="nav-menu-list"
          className="flex items-center gap-2 lg:gap-4"
        >
          {links.map((link) =>
            link.groups && link.groups.length > 0 ? (
              <NavigationMenuPrimitive.Item id={`nav-menu-item-${link.href}`} key={link.href}>
                <NavigationMenuPrimitive.Trigger
                  id={`nav-menu-trigger-${link.href}`}
                  className="group/button font-semiboldd flex items-center hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <CustomLink
                    id={`nav-menu-link-${link.href}`}
                    className="p-3 font-semibold"
                    href={link.href}
                  >
                    {link.label}
                  </CustomLink>
                  <ChevronDown
                    id={`nav-menu-chevron-${link.href}`}
                    aria-hidden="true"
                    className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                  />
                </NavigationMenuPrimitive.Trigger>

                {/* Content divided into two sections */}
                <NavigationMenuPrimitive.Content
                  id={`nav-menu-content-${link.href}`}
                  className="grid w-full grid-cols-2 gap-10 2xl:container data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0"
                >
                  {/* Column 1: Main navigation links */}
                  <div className="flex flex-col">
                    {link.groups.map((group) => (
                      <ul
                        id={`nav-menu-group-${group.href}`}
                        className="flex flex-col"
                        key={group.href}
                      >
                        <li id={`nav-menu-group-item-${group.href}`}>
                          <NavigationMenuPrimitive.Link asChild>
                            <CustomLink
                              id={`nav-menu-group-link-${group.href}`}
                              className="font-semiboldd block p-3"
                              href={group.href}
                            >
                              {group.label}
                            </CustomLink>
                          </NavigationMenuPrimitive.Link>
                        </li>
                        {group.links &&
                          group.links.length > 0 &&
                          group.links.map((nestedLink) => (
                            <li
                              id={`nav-menu-nested-item-${nestedLink.href}`}
                              key={nestedLink.href}
                            >
                              <NavigationMenuPrimitive.Link asChild>
                                <CustomLink
                                  id={`nav-menu-nested-link-${nestedLink.href}`}
                                  className="block p-3"
                                  href={nestedLink.href}
                                >
                                  {nestedLink.label}
                                </CustomLink>
                              </NavigationMenuPrimitive.Link>
                            </li>
                          ))}
                      </ul>
                    ))}
                  </div>
                </NavigationMenuPrimitive.Content>
              </NavigationMenuPrimitive.Item>
            ) : (
              <NavigationMenuPrimitive.Item id={`nav-menu-item-${link.href}`} key={link.href}>
                <NavigationMenuPrimitive.Link asChild>
                  <CustomLink
                    id={`nav-menu-link-${link.href}`}
                    className="p-3 font-semibold"
                    href={link.href}
                  >
                    {link.label}
                  </CustomLink>
                </NavigationMenuPrimitive.Link>
              </NavigationMenuPrimitive.Item>
            ),
          )}
        </NavigationMenuPrimitive.List>

        <NavigationMenuPrimitive.Viewport
          id="nav-menu-viewport"
          className="absolute start-0 top-full z-50 w-full bg-white pb-12 pt-6 shadow-xl duration-200 animate-in slide-in-from-top-5"
        />
      </NavigationMenuPrimitive.Root>

      {/* New Blog and Contact Us Section */}
      <nav className="static-menu-class flex items-center gap-10" id="static-menu">
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

Header.displayName = 'Header';

export { Header, type Links };





