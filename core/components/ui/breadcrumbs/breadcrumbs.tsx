import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

interface Link {
  href: string;
  label: string;
}

interface Props {
  breadcrumbs: Link[];
  className?: string;
}

const Breadcrumbs = ({ breadcrumbs, className }: Props) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ul className="div-breadcrumb flex flex-wrap items-center justify-center sm:justify-center md:justify-center lg:justify-start py-4 text-base font-normal leading-8 tracking-tight text-[#7F7F7F]">
        <Fragment key='home'>
          <li className="flex items-center">
            <CustomLink
              aria-current={undefined}
              className={cn(
                ''
              )}
              href='/'
            >
              Home
            </CustomLink>
          </li>
          <span className="mx-1"> / </span>
        </Fragment>
        {breadcrumbs.map(({ label, href }, i, arr) => {
          const isLast = arr.length - 1 === i;

          return (
            <Fragment key={label}>
              <li className="flex items-center">
                <CustomLink
                  aria-current={isLast ? `page` : undefined}
                  className={cn(
                    'font-normal hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                    isLast ? 'text-custom-blue font-extrabold' : 'text-[#7F7F7F]'
                  )}
                  href={href}
                >
                  {label}
                </CustomLink>
              </li>
              {!isLast ? (
                <span className="mx-1">
                  <ChevronRight aria-hidden="true" size={20} />
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export { Breadcrumbs };
