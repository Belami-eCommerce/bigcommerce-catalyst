import { clsx } from 'clsx';
import { BcImage as Image } from '~/components/bc-image';

import { Link } from '~/components/link';

import noImage from '~/public/no-image.svg';

export type ProductCardProps = {
  title: string;
  image?: { src: string; alt: string };
  url: string;
  classNames?: {
    root?: string,
    link?: string,
    figure?: string,
    image?: string,
    title?: string
  }
};

export function ProductCard({ title, image, url, classNames }: ProductCardProps) {
  return (
    <article className={clsx('relative flex h-full w-full flex-col rounded-none border border-gray-300', classNames?.root)}>

      <div className="px-4">
        <div className="pb-full relative mx-auto my-0 flex h-auto w-full overflow-hidden pb-[100%]">
          <figure className={clsx('absolute left-0 top-0 h-full w-full', classNames?.link)}>
            <Link
              href={url}
              className="flex h-full w-full items-center justify-center align-middle"
            >
              {image != null ? (
                /*
                <img
                  src={image.src}
                  alt={image.alt}
                  className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                />
                */
                <Image
                  src={image.src}
                  alt={image.alt}
                  className={clsx('relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle', classNames?.image)}
                />
              ) : (
                <Image
                  src={noImage}
                  alt="No Image"
                  className={clsx('relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle', classNames?.image)}
                />
              )}
            </Link>
          </figure>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 p-4 text-center">
          <h2 className={clsx('mt-2 mb-8 text-lg font-medium', classNames?.title)}>
            <Link href={url}>{title}</Link>
          </h2>
        </div>
        <Link className={clsx('m-4 block rounded-none border border-brand-100 uppercase text-center', classNames?.link)} href={url}>Shop</Link>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="relative flex aspect-[3/4] w-full animate-pulse flex-col gap-2 @4xl:min-w-72">
      {/* Image */}
      <div className="h-full w-full overflow-hidden rounded-lg bg-contrast-100 @4xl:rounded-xl" />
      {/* Title */}
      <div className="mb-1 line-clamp-1 h-6 w-20 rounded-lg bg-contrast-100 @4xl:absolute @4xl:bottom-5 @4xl:left-5" />
    </div>
  );
}