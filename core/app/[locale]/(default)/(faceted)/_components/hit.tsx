import React from 'react';
import { useState } from 'react';
import { Hit as AlgoliaHit } from 'instantsearch.js';
import { Highlight } from 'react-instantsearch';

import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';

import searchColors from './search-colors.json';

import noImage from '~/public/no-image.svg';

import wetBadge from '~/public/badges/wet.svg';
import dampBadge from '~/public/badges/damp.svg';
import energystarBadge from '~/public/badges/energystar.svg';
import darkskyBadge from '~/public/badges/darksky.svg';
import coastalBadge from '~/public/badges/coastal.svg';

import { useFormatter } from 'next-intl';

import { Compare } from '~/components/ui/product-card/compare';

const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

type DynamicObject = {
  [key: string]: string;
};

const searchColorsHEX: DynamicObject = searchColors;

type HitPrice = {
  CAD: number;
  USD: number;
}

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    brand: string;
    brand_id: number;
    brand_name: string;
    category_ids: Array<number>;
    image: string;
    image_url: string;
    url: string;
    product_images: any;
    price: number;
    prices: HitPrice;
    sales_prices: HitPrice;
    retail_prices: HitPrice;
    rating: number;
    on_sale: boolean;
    on_clearance: boolean;
    newPrice: number;
    description: string;
    objectID: number;
    metafields: any;
    variants: any;
  }>;
  sendEvent?: any;
  insights?: any;
  promotions?: any[] | null;
  useDefaultPrices?: boolean;
  price?: number | null;
  salePrice?: number | null;
  isLoading?: boolean;
  isLoaded?: boolean;
  view?: string;
};

function findPromotionWithBrand(promotions: any[], brandId: number): any | null {
  for (const promotion of promotions) {
    const hasItemConditions = promotion.rules.some((rule: any) =>
      rule.condition?.cart && rule.condition?.cart.items && rule.condition?.cart.items.brands && rule.condition?.cart.items.brands.includes(brandId)
    );
    if (hasItemConditions) {
      return promotion; // Return the first promotion that matches
    }
  }

  return null;
}

function Promotion({ promotions, brand_id, category_ids }: any) {
  const promotion = findPromotionWithBrand(promotions, brand_id);
  return (
    <>
      {promotion ? <div className="mt-4 p-2 bg-gray-100 text-center">{promotion.name}</div> : null}
    </>
  )
}

/*
Badges for PLP
Sale
Clearance
Wet rated     wet
Damp rated    damp
Energy star   energystar
Dark sky  darksky
Coastal/Marine grade  coastal
*/
function RatingCertifications({ data }: any) {

  const badges: {
    [key: string]: any;
  } = {
    'wet': wetBadge,
    'damp': dampBadge,
    'energystar': energystarBadge,
    'darksky': darkskyBadge,
    'coastal': coastalBadge
  }

  const items =
    typeof data === 'string'
      ? JSON.parse(data)
      : Array.isArray(data)
        ? data
        : null;
  return (
    <>
      {items ? items.filter((item: any) => ['wet', 'damp', 'energystar', 'darksky', 'coastal'].includes(item.code)).map((item: any) => <Image key={item.code} src={badges[item.code]} height={24} alt={item.label} title={item.label} className="h-7" />) : null}
    </>
  )
}

function AmountUnitValue({ data }: any) {
  const value =
    typeof data === 'string'
      ? JSON.parse(data)
      : typeof data === 'object'
        ? data
        : null;
  const amount: number | null = value && value.amount ? +value.amount : null;
  const unit: string | null = value && value.unit ? value.unit.toLowerCase() : null;
  return (
    <>
      {amount ? amount + (unit ? ' ' + unit : '') : null}
    </>
  )
}

function ColorSwatches({ variants, metafields, onImageClick }: any) {
  const items = variants && variants.length > 0 ? variants.filter((item: any) => Object.hasOwn(item.options, 'Finish Color')).map((item: any) => item.options['Finish Color']).filter((value: string, index: number, array: Array<string>) => array.indexOf(value) === index) : null;

  const imageUrls = {} as any;
  const items2 = items && items.length > 0 ? variants.filter((item: any) => item.image_url && item.image_url.length > 0 && Object.hasOwn(item.options, 'Finish Color')).map((item: any) => {
    imageUrls[item.options['Finish Color']] = item.image_url.replace('.220.290.', '.386.513.');
  }) : null;

  return (
    items && items.length > 0 &&
    <>
      <div className="mx-auto mt-4 flex space-x-2 items-center justify-center">
        {items.slice(0, 5).map((item: string) => <button key={item} type="button" title={item} className="rounded-full w-8 h-8 border border-gray-500 cursor-auto" style={
          searchColorsHEX[item] && searchColorsHEX[item].indexOf('.svg') !== -1
            ? { backgroundImage: `url("/swatches/${searchColorsHEX[item]}")`, backgroundSize: `cover`, backgroundRepeat: `no-repeat` }
            : { backgroundColor: (searchColorsHEX[item] ?? 'transparent') }
        } onClick={() => imageUrls[item] ? onImageClick(imageUrls[item]) : null} />)}
        {items.length > 5 &&
          <span>+{(items.length - 5)}</span>
        }
      </div>
    </>
  )
}

function getDiscount(price: number, salePrice: number): number | null {
  return price > 0 ? Math.floor((price - salePrice) * 100 / price) : 0;
}

export function Hit({ hit, sendEvent, insights, promotions = null, useDefaultPrices = false, price = null, salePrice = null, isLoading = false, isLoaded = false, view = 'grid' }: HitProps) {

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null);

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (view === 'grid'
    ? (<article className="w-full product flex flex-col h-full border border-gray-300 rounded-none">
      <div className="flex items-start p-4 overflow-x-hidden">
        <div className="compare-product mr-4">
          <Compare id={hit.objectID} image={hit.image_url ? { src: hit.image_url, altText: hit.name } : noImage} name={hit.name} />
        </div>
        <div className="ml-auto flex-none flex items-center space-x-1">
          {hit.metafields && hit.metafields.Details && hit.metafields.Details.ratings_certifications &&
              <RatingCertifications data={hit.metafields.Details.ratings_certifications} />
          }
          {hit.on_sale &&
            <span className="flex items-center space-x-1 px-1.5 py-1 bg-brand-500 text-white text-xs uppercase">
              <svg width="15" height="15" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.87109 15.5095C6.68335 15.5095 6.49562 15.4719 6.30789 15.3969C6.12015 15.3218 5.95119 15.2091 5.801 15.0589L0.43179 9.68972C0.281602 9.53953 0.17209 9.3737 0.103254 9.19222C0.034418 9.01075 0 8.82614 0 8.63841C0 8.45067 0.034418 8.26294 0.103254 8.0752C0.17209 7.88747 0.281602 7.71851 0.43179 7.56832L7.04005 0.941286C7.17772 0.803614 7.34043 0.694102 7.52816 0.61275C7.7159 0.531399 7.90989 0.490723 8.11014 0.490723H13.4981C13.9111 0.490723 14.2647 0.637781 14.5588 0.931899C14.8529 1.22602 15 1.57958 15 1.9926V7.38058C15 7.58084 14.9625 7.7717 14.8874 7.95318C14.8123 8.13465 14.7059 8.29423 14.5682 8.4319L7.94118 15.0589C7.79099 15.2091 7.62203 15.3218 7.43429 15.3969C7.24656 15.4719 7.05882 15.5095 6.87109 15.5095ZM11.6208 4.99635C11.9337 4.99635 12.1996 4.88684 12.4186 4.66782C12.6377 4.4488 12.7472 4.18284 12.7472 3.86995C12.7472 3.55706 12.6377 3.2911 12.4186 3.07207C12.1996 2.85305 11.9337 2.74354 11.6208 2.74354C11.3079 2.74354 11.0419 2.85305 10.8229 3.07207C10.6039 3.2911 10.4944 3.55706 10.4944 3.86995C10.4944 4.18284 10.6039 4.4488 10.8229 4.66782C11.0419 4.88684 11.3079 4.99635 11.6208 4.99635Z" fill="white"/></svg>
              <span className="tracking-wider">Sale</span>
            </span>
          }
        </div>
      </div>

      <div className="px-4">
        <div className="flex my-0 mx-auto pb-full w-full h-auto overflow-hidden pb-[100%] relative">
          <figure className="absolute left-0 top-0 w-full h-full">
            <Link href={hit.url} className="w-full h-full flex justify-center items-center align-middle">
              {hit.image_url
                ? <img src={imageUrl || ''} alt={hit.name} className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                : <Image src={noImage} alt="No Image" className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
              }
            </Link>
          </figure>
          <button type="button" title="Add to Favorites" className="rounded-full bg-gray-100 absolute right-2 bottom-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1 23.55L16 23.65L15.89 23.55C11.14 19.24 8 16.39 8 13.5C8 11.5 9.5 10 11.5 10C13.04 10 14.54 11 15.07 12.36H16.93C17.46 11 18.96 10 20.5 10C22.5 10 24 11.5 24 13.5C24 16.39 20.86 19.24 16.1 23.55ZM20.5 8C18.76 8 17.09 8.81 16 10.08C14.91 8.81 13.24 8 11.5 8C8.42 8 6 10.41 6 13.5C6 17.27 9.4 20.36 14.55 25.03L16 26.35L17.45 25.03C22.6 20.36 26 17.27 26 13.5C26 10.41 23.58 8 20.5 8Z" fill="#b4b4b5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 text-center">
          <ColorSwatches variants={hit.variants} metafields={hit.metafields} onImageClick={setImageUrl} />
          {(hit.brand_name || hit.brand) &&
            <div className="mt-2">{hit.brand_name ?? hit.brand}</div>
          }
          <h2 className="text-lg font-medium mt-2"><Link href={hit.url}><Highlight hit={hit} attribute="name" /></Link></h2>
          {useAsyncMode && !useDefaultPrices ? (
            <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center justify-center">
              {hit.on_clearance &&
                <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
              }

              {!isLoading && (price || salePrice) ?
                <div className="mt-2 flex space-x-2 items-center">
                  {salePrice && salePrice > 0 ? <s>{format.number(price || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(price || 0, { style: 'currency', currency: currency })}</span>}
                  {price && salePrice && salePrice > 0 ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(price, salePrice)}%</strong> : null}
                  {salePrice && salePrice > 0 ? <span>{format.number(salePrice || 0, { style: 'currency', currency: currency })}</span> : null}
                </div> :
                (!isLoading && isLoaded ? (
                  hit.prices ?
                    <div className="mt-2 flex space-x-2 items-center">
                        {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <s>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</span>}
                        {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%</strong> : null}
                        {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <span>{format.number(hit.sales_prices.USD || 0, { style: 'currency', currency: currency })}</span> : null}
                    </div> : null
                )
                  : 'Loading...')
              }
            </div>
          ) : (
            hit.prices ?
              <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center justify-center">
                {hit.on_clearance &&
                  <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
                }
                <div className="mt-2 flex space-x-2 items-center">
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <s>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</span>}
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%</strong> : null}
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <span>{format.number(hit.sales_prices.USD || 0, { style: 'currency', currency: currency })}</span> : null}
                </div>
              </div> : null
          )}
          {/* hit.rating && hit.rating > 0 &&
            <p>{Array.from(Array(hit.rating)).map(() => '⭐️').join('')}</p>
          */}
          <div className="mx-auto mt-2 flex space-x-2 items-center justify-center">
            <span className="flex space-x-0.5 text-yellow-500">
              <svg key={1} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={2} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={3} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={4} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={5} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </span>
            <span>(10)</span>
          </div>
          <div className="mt-2 text-xs">ID: {hit.objectID}</div>
          {/* <p>{JSON.stringify(hit.metafields)}</p> */}
{/*
          {"Akeneo":{
            "collection":"La Maison",
            "height":"{\n  \"amount\": \"30.0000\",\n  \"unit\": \"INCH\"\n}",
            "lamp_base_type":"candelabra","number_of_bulbs":"6",
            "product_style":"[\n  \"traditional\"\n]",
            "ratings_certifications":"[{\"code\":\"damp\",\"label\":\"Damp Rated\",\"image\":\"https://images.1stoplighting.com/site/common/cert/damp_rated.png\"}]",
            "voltage":"{\n  \"amount\": 120,\n  \"unit\": \"VOLT\"\n}",
            "wattage":"{\n  \"amount\": \"360.0000\",\n  \"unit\": \"WATT\"\n}",
            "width":"{\n  \"amount\": \"26.0000\",\n  \"unit\": \"INCH\"\n}"
          }}
*/}
        </div>
        <Promotion promotions={promotions} brand_id={hit.brand_id} category_ids={hit.category_ids} />
      </div>
    </article>)
    : (view === 'list' ? <article className="product w-full p-4 border border-gray-300 rounded-none">
      <div className="flex flex-col md:flex-row tems-start space-y-4 md:space-y-0 space-x-0 md:space-x-8">
        <div className="flex-none w-full md:w-auto md:max-w-[240px] lg:max-w-[300px]">
          <div className="flex-none flex items-center space-x-1 mr-4 mb-4">
            {hit.on_sale &&
              <span className="flex items-center space-x-0.5 px-1 py-0.5 bg-brand-500 text-white text-xs uppercase">
                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.87109 15.5095C6.68335 15.5095 6.49562 15.4719 6.30789 15.3969C6.12015 15.3218 5.95119 15.2091 5.801 15.0589L0.43179 9.68972C0.281602 9.53953 0.17209 9.3737 0.103254 9.19222C0.034418 9.01075 0 8.82614 0 8.63841C0 8.45067 0.034418 8.26294 0.103254 8.0752C0.17209 7.88747 0.281602 7.71851 0.43179 7.56832L7.04005 0.941286C7.17772 0.803614 7.34043 0.694102 7.52816 0.61275C7.7159 0.531399 7.90989 0.490723 8.11014 0.490723H13.4981C13.9111 0.490723 14.2647 0.637781 14.5588 0.931899C14.8529 1.22602 15 1.57958 15 1.9926V7.38058C15 7.58084 14.9625 7.7717 14.8874 7.95318C14.8123 8.13465 14.7059 8.29423 14.5682 8.4319L7.94118 15.0589C7.79099 15.2091 7.62203 15.3218 7.43429 15.3969C7.24656 15.4719 7.05882 15.5095 6.87109 15.5095ZM11.6208 4.99635C11.9337 4.99635 12.1996 4.88684 12.4186 4.66782C12.6377 4.4488 12.7472 4.18284 12.7472 3.86995C12.7472 3.55706 12.6377 3.2911 12.4186 3.07207C12.1996 2.85305 11.9337 2.74354 11.6208 2.74354C11.3079 2.74354 11.0419 2.85305 10.8229 3.07207C10.6039 3.2911 10.4944 3.55706 10.4944 3.86995C10.4944 4.18284 10.6039 4.4488 10.8229 4.66782C11.0419 4.88684 11.3079 4.99635 11.6208 4.99635Z" fill="white"/></svg>
                <span>Sale</span>
              </span>
            }
            {hit.metafields && hit.metafields.Details && hit.metafields.Details.ratings_certifications &&
                <RatingCertifications data={hit.metafields.Details.ratings_certifications} />
            }
          </div>

          <div className="w-full md:w-[240px] md:h-[240px] md:max-h-[240px] lg:w-[300px] lg:h-[300px] lg:max-h-[300px]">
            <div className="flex my-0 mx-auto md:pb-full w-full md:h-auto md:overflow-hidden md:pb-[100%] relative">
              <figure className="md:absolute left-0 top-0 w-full h-full">
                <Link href={hit.url} className="w-full h-full flex justify-center items-center align-middle">
                  {hit.image_url
                    ? <img src={imageUrl || ''} alt={hit.name} className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                    : <Image src={noImage} alt="No Image" className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                  }
                </Link>
              </figure>
              <button type="button" title="Add to Favorites" className="rounded-full bg-gray-100 absolute right-2 bottom-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.1 23.55L16 23.65L15.89 23.55C11.14 19.24 8 16.39 8 13.5C8 11.5 9.5 10 11.5 10C13.04 10 14.54 11 15.07 12.36H16.93C17.46 11 18.96 10 20.5 10C22.5 10 24 11.5 24 13.5C24 16.39 20.86 19.24 16.1 23.55ZM20.5 8C18.76 8 17.09 8.81 16 10.08C14.91 8.81 13.24 8 11.5 8C8.42 8 6 10.41 6 13.5C6 17.27 9.4 20.36 14.55 25.03L16 26.35L17.45 25.03C22.6 20.36 26 17.27 26 13.5C26 10.41 23.58 8 20.5 8Z" fill="#B4B4B5" />
                </svg>
              </button>
            </div>
          </div>
          <ColorSwatches variants={hit.variants} metafields={hit.metafields} onImageClick={setImageUrl} />
        </div>
        <div className="flex-1 md:!ml-4">
          {(hit.brand_name || hit.brand) &&
            <div className="mt-2">{hit.brand_name ?? hit.brand}</div>
          }
          <h2 className="text-lg font-medium mt-2"><Link href={hit.url}><Highlight hit={hit} attribute="name" /></Link></h2>
          {useAsyncMode && !useDefaultPrices ? (
            <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center">
              {hit.on_clearance &&
                <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
              }
              {!isLoading && (price || salePrice) ?
                <div className="mt-2 flex space-x-2 items-center">
                  {salePrice && salePrice > 0 ? <s>{format.number(price || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(price || 0, { style: 'currency', currency: currency })}</span>}
                  {price && salePrice && salePrice > 0 ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(price, salePrice)}%</strong> : null}
                  {salePrice && salePrice > 0 ? <span>{format.number(salePrice || 0, { style: 'currency', currency: currency })}</span> : null}
                </div> :
                (!isLoading && isLoaded ? (
                  hit.prices ?
                    <div className="mt-2 flex space-x-2 items-center">
                      {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <s>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</span>}
                      {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%</strong> : null}
                      {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <span>{format.number(hit.sales_prices.USD || 0, { style: 'currency', currency: currency })}</span> : null}
                    </div> : null
                )
                  : 'Loading...')
              }
            </div>
          ) : (
            hit.prices ?
              <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center">
                {hit.on_clearance &&
                  <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
                }
                <div className="mt-2 flex space-x-2 items-center">
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <s>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</span>}
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%</strong> : null}
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <span>{format.number(hit.sales_prices.USD || 0, { style: 'currency', currency: currency })}</span> : null}
                </div>
              </div> : null
          )}
          {/* hit.rating && hit.rating > 0 &&
          <p>{Array.from(Array(hit.rating)).map(() => '⭐️').join('')}</p>
        */}
          <div className="mx-auto mt-2 flex space-x-2 items-center">
            <span className="flex space-x-0.5 text-yellow-500">
              <svg key={1} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={2} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={3} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={4} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={5} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </span>
            <span>(10)</span>
          </div>
          <div className="mt-2 text-xs">ID: {hit.objectID}</div>
          {/*
          <p>{JSON.stringify(hit.metafields)}</p>
          <p>{JSON.stringify(hit.variants)}</p>
          */}
          <Promotion promotions={promotions} brand_id={hit.brand_id} category_ids={hit.category_ids} />
        </div>
        <div className="flex-1 bg-gray-50 px-8 py-4">
          <div className="flex flex-row md:flex-col lg:flex-row items-center md:items-start lg:items-center">
            <div className="compare-product ml-auto flex-none flex order-2 md:order-1 lg:order-2">
              <Compare id={hit.objectID} image={hit.image_url ? { src: hit.image_url, altText: hit.name } : noImage} name={hit.name} />
            </div>
            {hit.description &&
              <h3 className="text-lg font-medium whitespace-nowrap mr-4 mt-0 md:mt-4 lg:mt-0 order-1 md:order-2 lg:order-1">Product Overview</h3>
            }
          </div>
          {hit.metafields && hit.metafields.Akeneo ? (
            <div className="mt-2 leading-6">
            {hit.metafields.Akeneo.depth
              ? <p className="">Depth: <AmountUnitValue data={hit.metafields.Akeneo.depth} /></p>
              : null
            }
            {hit.metafields.Akeneo.height
              ? <p className="">Height: <AmountUnitValue data={hit.metafields.Akeneo.height} /></p>
              : null
            }
            {hit.metafields.Akeneo.length
              ? <p className="">Length: <AmountUnitValue data={hit.metafields.Akeneo.length} /></p>
              : null
            }
            {hit.metafields.Akeneo.width
              ? <p className="">Width/Diameter: <AmountUnitValue data={hit.metafields.Akeneo.width} /></p>
              : null
            }
            {hit.metafields.Akeneo.minimum_mounting_height
              ? <p className="">Min. Mounting Height: {hit.metafields.Akeneo.minimum_mounting_height}</p>
              : null
            }
            {hit.metafields.Akeneo.fuel_source
              ? <p className="">Fuel Source: {hit.metafields.Akeneo.fuel_source}</p>
              : null
            }
            {hit.metafields.Akeneo.heating_area
              ? <p className="">Heating Area: {hit.metafields.Akeneo.heating_area}</p>
              : null
            }
            {hit.metafields.Akeneo.wattage
              ? <p className="">Wattage: <AmountUnitValue data={hit.metafields.Akeneo.wattage} /></p>
              : null
            }
            {hit.metafields.Akeneo.number_of_bulbs
              ? <p className="">Number of Lights: {hit.metafields.Akeneo.number_of_bulbs}</p>
              : null
            }
            {hit.metafields.Akeneo.lift
              ? <p className="">Lift: {hit.metafields.Akeneo.lift}</p>
              : null
            }
            {hit.metafields.Akeneo.lamp_base_type
              ? <p className="">Lamp Type: {hit.metafields.Akeneo.lamp_base_type}</p>
              : null
            }
            {hit.metafields.Akeneo.voltage
              ? <p className="">Voltage: <AmountUnitValue data={hit.metafields.Akeneo.voltage} /></p>
              : null
            }
            </div>
          ) : (
            hit.description &&
            <div className="mt-2 leading-6" dangerouslySetInnerHTML={{ __html: hit.description }}></div>
          )}
          <div className="mt-4 md:flex md:space-x-2">
            <a href="#" className="md:flex-1 flex w-full md:w-auto uppercase px-4 h-10 bg-brand-600 text-white rounded border border-brand-600 cursor-pointer items-center justify-center text-center hover:bg-brand-400 hover:border-brand-400">View Details</a>
            {/*
            <a href="#" className="md:flex-1 flex w-full md:w-auto uppercase px-4 h-10 bg-white rounded border border-brand-100 cursor-pointer items-center justify-center text-center hover:bg-brand-50 hover:border-brand-300">View Details</a>
            */}
            {/*
          <button type="button" className="mt-1 md:mt-0 md:flex-1 flex w-full md:w-auto uppercase px-4 h-10 bg-cyan-700 text-white rounded border border-cyan-700 cursor-pointer items-center justify-center" onClick={() =>
            sendEvent("conversion", hit, "Added To Cart", {
              // Special subtype
              eventSubtype: "addToCart",
              // An array of objects representing each item added to the cart
              objectData: [
                {
                  // The discount value for this item, if applicable
                  discount: 0,
                  // The price value for this item (minus the discount)
                  price: hit.prices.USD,
                  // How many of this item were added
                  quantity: 1,
                },
              ],
              // The total value of all items
              value: hit.prices.USD,
              // The currency code
              currency: "USD",
            })}>Add To Cart</button>
          */}
          </div>
        </div>
      </div>
    </article>
      : <></>)
  );
}