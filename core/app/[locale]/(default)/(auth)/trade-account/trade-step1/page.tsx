import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { RegisterForm1 } from '../_components/register-form1'; // Correct import path
import { getRegisterCustomerQuerys } from '../page-data';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import ImageCarousel from '../trade-carousel';
import TradeForm from './trade-form-section';
import NetworkSection from './trade-our-network';
import BrandPartnersSection from './trade-brand-partner';
import TeamMembersSection from './trade-team-member';
import HappyProsSection from './trade-testimonial';
import type { FormField } from '../_components/register-form1';

// Updated FALLBACK_COUNTRY with all required properties
const FALLBACK_COUNTRY = {
  entityId: 226,
  name: 'United States',
  code: 'US',
  statesOrProvinces: [] as {
    abbreviation: string;
    entityId: number;
    name: string;
    __typename: 'StateOrProvince';
  }[],
};

export async function generateMetadata() {
  const t = await getTranslations('Register');
  return {
    title: t('title'),
  };
}
// Import needed type
interface AddressFormField {
  __typename: 'TextFormField';
  entityId: number;
  label: string;
  sortOrder: number;
  isBuiltIn: boolean;
  isRequired: boolean;
  defaultText: string | null;
  maxLength: number | null;
}

export interface RegisterForm1Props {
  addressFields: AddressFormField[];
  customerFields: FormField[];
  countries: Array<{
    code: string;
    entityId: number;
    name: string;
    __typename: 'Country';
    statesOrProvinces: Array<{
      abbreviation: string;
      entityId: number;
      name: string;
      __typename: 'StateOrProvince';
    }>;
  }>;
  defaultCountry: {
    code: string;
    states: Array<{ name: string }>;
  };
  reCaptchaSettings: any;
}

const breadcrumbs = [
  {
    label: 'Apply',
    href: '/trade-account/trade-step1',
    color: '#008BB7',
    fontWeight: '600', // Change to string
  },
  {
    label: 'Business Details',
    href: '/trade-account/trade-step2',
    color: '#000000',
    fontWeight: '400',
  },
  {
    label: 'Confirmation',
    href: '/trade-account/trade-step3',
    color: '#000000',
    fontWeight: '400',
  },
];

// Define image URLs
const imageUrls = {
  tradeAccountHeader: imageManagerImageUrl('trade-account-header.png', 'original'),
  tradeCircleCircle: imageManagerImageUrl('trade-check-circle.png', 'original'),
  patjoheatAndShade: imageManagerImageUrl('patjoheat-and-shade.png', 'original'),
  baileyStreet: imageManagerImageUrl('bailey-street.png', 'original'),
  oneStopLightning: imageManagerImageUrl('1stop-lightning.png', 'original'),
  lunaWarehouse: imageManagerImageUrl('luna-warehouse.png', 'original'),
  canadaLightning: imageManagerImageUrl('canada-lightning.png', 'original'),
  homeclickBlack: imageManagerImageUrl('homeclick-black.png', 'original'),
};

// Network images configuration
const networkImages = [
  {
    src: imageUrls.patjoheatAndShade,
    alt: 'PatJoheat',
    width: 95,
    height: 40,
  },
  {
    src: imageUrls.baileyStreet,
    alt: 'Bailey Street',
    width: 138,
    height: 40,
  },
  {
    src: imageUrls.oneStopLightning,
    alt: '1Stop Lightning',
    width: 194,
    height: 40,
  },
  {
    src: imageUrls.lunaWarehouse,
    alt: 'Luna Warehouse',
    width: 298,
    height: 40,
  },
  {
    src: imageUrls.canadaLightning,
    alt: 'Canada Lighting',
    width: 228,
    height: 40,
  },
  {
    src: imageUrls.homeclickBlack,
    alt: 'Homeclick Black',
    width: 150,
    height: 40,
  },
];

type CarouselImage = {
  src: string;
  alt: string;
  title: string;
  height?: string;
};

const images: CarouselImage[] = [
  {
    src: 'https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/trade-carousel-1.png',
    alt: 'California Homebuilders Inc.',
    title: 'California Homebuilders Inc.',
  },
  {
    src: 'https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/trade-carousel-1.png',
    alt: 'Modern Home Design',
    title: 'Modern Home Design',
  },
  {
    src: 'https://cdn11.bigcommerce.com/s-6cdngmevrl/images/stencil/original/image-manager/trade-carousel-1.png',
    alt: 'Luxury Homes',
    title: 'Luxury Homes',
  },
];

export default async function Trade() {
  const t = await getTranslations('Register');

  const registerCustomerData = await getRegisterCustomerQuerys({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  // Destructure and properly handle all the data
  const {
    addressFields,
    customerFields,
    countries,
    defaultCountry: defaultCountryName = FALLBACK_COUNTRY.name,
    reCaptchaSettings: reCaptchaPromise,
  } = registerCustomerData;

  // Await the reCaptcha settings
  const reCaptchaSettings = await reCaptchaPromise;

  // Find the selected country and its data
  const selectedCountry =
    countries.find(({ name }) => name === defaultCountryName) || FALLBACK_COUNTRY;

  // Construct the proper defaultCountry object with the correct type
  const defaultCountry = {
    entityId: selectedCountry.entityId,
    code: selectedCountry.code,
    states: selectedCountry.statesOrProvinces || [],
  };

  return (
    <div className="trade-register-section bg-[#d3d3d338]">
      <div className="registeration-breadcrumbs-heading">
        {/* Hero Image Section */}
        <div className="relative w-full">
          <div className="trade-banner">
            <BcImage
              alt="Hero Background"
              width={1600}
              height={300}
              unoptimized={true}
              src={imageUrls.tradeAccountHeader}
              className="trade-banner-image"
            />
          </div>
        </div>

        <ComponentsBreadcrumbs
          className="trade2-div-breadcrumb m-auto flex w-[89%] pb-[10px] pt-[30px]"
          breadcrumbs={breadcrumbs}
        />

        {/* Form Section */}
        <div className="flex w-[96.5%] flex-col lg:flex-row lg:justify-between lg:space-x-8">
          {/* Left Side Content */}
          <TradeForm tradeCircleCircle={imageUrls.tradeCircleCircle} />

          {/* Right Side Registration Form */}
          <div className="rounded-lg bg-white pb-[3em] pt-[3em] shadow-md lg:w-1/2">
            <h2 className="mb-[15px] text-center text-[34px] font-normal leading-[32px] text-[#353535]">
              Apply Today
            </h2>

            <RegisterForm1
              addressFields={addressFields as AddressFormField[]}
              countries={countries}
              customerFields={customerFields as FormField[]}
              defaultCountry={defaultCountry}
              reCaptchaSettings={reCaptchaSettings}
            />
          </div>
        </div>

        <h2 className="mb-[40px] mt-[40px] text-center text-[24px] font-normal leading-[32px] text-[#353535]">
          Our Network
        </h2>

        {/* Full-Width Network Section */}
        <NetworkSection networkImages={networkImages} />

        {/* Brand Partners Section */}
        <BrandPartnersSection />

        {/* Project Carousel Section */}
        <div className="w-full">
          <h2 className="mb-[40px] mt-[40px] text-center text-[24px] font-normal leading-[32px] text-[#353535]">
            Our Projects
          </h2>
          <div className="m-auto w-[95%] px-4">
            <ImageCarousel images={images} height="520px" />
          </div>
        </div>

        {/* Team Members Section */}
        <TeamMembersSection />

        {/* Happy Pros Section */}
        <HappyProsSection />
      </div>
    </div>
  );
}

export const runtime = 'edge';