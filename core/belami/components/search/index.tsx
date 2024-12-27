import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useInstantSearch, useSortBy, UseSortByProps, useHitsPerPage, UseHitsPerPageProps, usePagination, UsePaginationProps } from 'react-instantsearch';

import { Panel } from '../panel';
import { useCloseDropdown } from '../../hooks/use-close-dropdown';
import { useLockedBody } from '../../hooks/use-locked-body';
import { useMediaQuery } from '../../hooks/use-media-query';

import { cn } from '~/lib/utils';

type MiddlewareProps = {
  isOpened: boolean;
  close: () => void;
};

function DropdownMiddleware({
  isOpened,
  close,
}: MiddlewareProps) {
  const { addMiddlewares } = useInstantSearch();

  useEffect(() =>
    addMiddlewares(() => ({
      onStateChange() {
        // Close the dropdown if it's opened
        if (isOpened) {
          close();
        }
      },
    }))
  );

  return null;
}

export function SortBy(props: UseSortByProps & { label?: string }) {
  const { currentRefinement, options, refine } = useSortBy(props);
  const [isOpened, setIsOpened] = useState(false);
  const panelRef = useRef(null);

  // Close the dropdown when click outside or press the Escape key
  const close = useCallback(() => setIsOpened(false), []);
  useCloseDropdown(panelRef, close, isOpened);

  // Prevent scrolling on mobile when the dropdown is opened
  const isMobile = useMediaQuery('(max-width: 375px)');
  useLockedBody(isOpened && isMobile);

  const text = options.find((option: { label: string; value: string }) => option.value === currentRefinement)?.label || 'Select';

  const header = (
    <button
      type="button"
      className={cn(
        'ais-Dropdown-button',
        props.classNames.button
      )}
      onClick={() => setIsOpened((opened) => !opened)}
    >
      {props.label && <span className={cn('whitespace-nowrap flex-none', props.classNames.buttonLabel)}>{props.label}: </span>}
      <span className={cn('flex-1 whitespace-nowrap truncate', props.classNames.buttonText)}>{text}</span>
      <svg className="flex-none" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0.290039L6 4.88004L10.59 0.290039L12 1.71004L6 7.71004L0 1.71004L1.41 0.290039Z" fill="#353535" /></svg>
    </button>
  );

  return (
    <Panel
      header={header}
      classNames={{
        root: cn(
          'ais-Dropdown',
          isOpened && 'ais-Dropdown--opened',
          props.classNames.root
        ),
        body: 'overflow-y-auto min-w-[200px] max-h-[320px]'
      }}
      ref={panelRef}
    >
      <DropdownMiddleware
        isOpened={isOpened}
        close={close}
      />
      <h2 className={cn('ais-Dropdown-mobileTitle', props.classNames.mobileTitle)}>
        {props.label}
      </h2>
      <ul>
        {options.map((option: { label: string; value: string }) => (
          <li key={option.value} value={option.value} className={cn(
            'cursor-pointer', 
            props.classNames.item, 
            option.value === currentRefinement && props.classNames.active
          )} onClick={() => refine(option.value)}>
            {option.label}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function HitsPerPage(props: UseHitsPerPageProps & { label?: string }) {
  const { items, refine } = useHitsPerPage(props);
  const { value: currentValue } =
    items.find(({ isRefined }: { isRefined: boolean }) => isRefined)! || {};

  const [isOpened, setIsOpened] = useState(false);
  const panelRef = useRef(null);

  // Close the dropdown when click outside or press the Escape key
  const close = useCallback(() => setIsOpened(false), []);
  useCloseDropdown(panelRef, close, isOpened);

  // Prevent scrolling on mobile when the dropdown is opened
  const isMobile = useMediaQuery('(max-width: 375px)');
  useLockedBody(isOpened && isMobile);

  const text = currentValue ? String(currentValue) : 'Select';

  const header = (
    <button
      type="button"
      className={cn(
        'ais-Dropdown-button',
        props.classNames.button
      )}
      onClick={() => setIsOpened((opened) => !opened)}
    >
      {props.label && <span className={cn('whitespace-nowrap flex-none', props.classNames.buttonLabel)}>{props.label}: </span>}
      <span className={cn('flex-1 whitespace-nowrap truncate', props.classNames.buttonText)}>{text}</span>
      <svg className="flex-none" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0.290039L6 4.88004L10.59 0.290039L12 1.71004L6 7.71004L0 1.71004L1.41 0.290039Z" fill="#353535" /></svg>
    </button>
  );

  return (
    <Panel
      header={header}
      classNames={{
        root: cn(
          'ais-Dropdown',
          isOpened && 'ais-Dropdown--opened',
          props.classNames.root
        ),
        body: 'overflow-y-auto min-w-[200px] max-h-[320px]'
      }}
      ref={panelRef}
    >
      <DropdownMiddleware
        isOpened={isOpened}
        close={close}
      />
      <h2 className={cn('ais-Dropdown-mobileTitle', props.classNames.mobileTitle)}>
        {props.label}
      </h2>
      <ul>
        {items.map((option: { label: string; value: string }) => (
          <li key={option.value} value={option.value} className={cn(
            'cursor-pointer', 
            props.classNames.item, 
            option.value === currentValue && props.classNames.active
          )} onClick={() => refine(option.value)}>
            {option.label}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function Pagination({ classNames, ...props }: UsePaginationProps) {

  const {
    pages,
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine,
    createURL
  } = usePagination(props);

  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  function fixCreateURL(page: number) {
    const url = createURL(page);
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search + urlObj.hash;
  }

  return (
    <div className={cn('ais-Pagination', classNames?.root)}>
    <ul className={cn('ais-Pagination-list', classNames?.list)}>
      <PaginationItem
        isDisabled={isFirstPage}
        href={fixCreateURL(firstPageIndex)}
        onClick={() => refine(firstPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--firstPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="First Page"
      >‹‹</PaginationItem>
      {/*
      <PaginationItem
        isDisabled={isFirstPage}
        href={fixCreateURL(previousPageIndex)}
        onClick={() => refine(previousPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--previousPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Previous Page"
      >‹</PaginationItem>
      */}      
      {pages.map((page: number) => {
        const label = page + 1;
        
        return (
          <PaginationItem
            key={page}
            isDisabled={false}
            //aria-label={`Page ${label}`}
            href={fixCreateURL(page)}
            onClick={() => refine(page)}
            classNames={{
              item: cn(page == currentRefinement ? 'ais-Pagination-item--selected' : '', classNames?.item),
              link: classNames?.link,
            }}
            ariaLabel={`Page ${label}`}
          >
            {label}
          </PaginationItem>
        );
      })}
      {/*
      <PaginationItem
        isDisabled={isLastPage}
        href={fixCreateURL(nextPageIndex)}
        onClick={() => refine(nextPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--nextPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Next Page"
      >›</PaginationItem>
      */}
      <PaginationItem
        isDisabled={isLastPage}
        href={fixCreateURL(lastPageIndex)}
        onClick={() => refine(lastPageIndex)}
        classNames={{
          item: cn('ais-Pagination-item--lastPage', classNames?.item),
          link: classNames?.link,
        }}
        ariaLabel="Last Page"
      >››</PaginationItem>
    </ul>
    </div>
  );
}

type PaginationItemProps = Omit<React.ComponentProps<'a'>, 'onClick'> & {
  onClick: NonNullable<React.ComponentProps<'a'>['onClick']>,
  isDisabled: boolean,
  ariaLabel?: string,
  classNames?: {
    item?: string,
    link?: string
  }
};

function PaginationItem({
  isDisabled,
  href,
  onClick,
  ariaLabel,
  classNames,
  ...props
}: PaginationItemProps) {
  if (isDisabled) {
    return (
      <li className={cn('ais-Pagination-item ais-Pagination-item--disabled', classNames?.item)}>
        <span className={cn('ais-Pagination-link', classNames?.link)} {...props} aria-label={ariaLabel} />
      </li>
    );
  }

  return (
    <li className={cn('ais-Pagination-item', classNames?.item)}>
      <a
        href={href}
        onClick={(event) => {
          if (isModifierClick(event)) {
            return;
          }

          event.preventDefault();

          onClick(event);
        }}
        className={cn('ais-Pagination-link', classNames?.link)}
        aria-label={ariaLabel}
        {...props}
      />
    </li>
  );
}

function isModifierClick(event: React.MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}