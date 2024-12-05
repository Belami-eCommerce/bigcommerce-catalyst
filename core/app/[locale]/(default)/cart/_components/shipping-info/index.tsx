import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useReducer, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-hot-toast';

import { getShippingCountries } from '~/app/[locale]/(default)/cart/_components/shipping-estimator/get-shipping-countries';
import { FragmentOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';
import { Button } from '~/components/ui/button';
import {
  Field,
  FieldControl,
  FieldLabel,
  Form,
  FormSubmit,
  Input,
  Select,
} from '~/components/ui/form';
import { cn } from '~/lib/utils';

import { ShippingInfoFragment } from './fragment';
import { submitShippingInfo } from './submit-shipping-info';
import { fetchCountryByZipcode, fetchZipCodeByLatLng } from '~/components/postgres';
import { MapPin } from 'lucide-react';

interface FormValues {
  country: string;
  state: string;
  city: string;
  postcode: string;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const t = useTranslations('Cart.SubmitShippingInfo');

  return (
    <Button
      className='font-[500] text-[14px] leading-[24px] tracking-[1.25px] text-[#002a37] flex justify-center items-center px-[10px] bg-[#ffffff] border border-[#4eaecc] h-[44px]'
      loading={pending}
      loadingText={t('spinnerText')}
      variant="secondary"
    >
      {t('submitText')}
    </Button>
  );
};

export const ShippingInfo = ({
  checkout,
  shippingCountries,
  isVisible,
}: {
  checkout: FragmentOf<typeof ShippingInfoFragment>;
  shippingCountries: ExistingResultType<typeof getShippingCountries>;
  isVisible: boolean;
}) => {
  const t = useTranslations('Cart.ShippingInfo');

  const shippingConsignment =
    checkout.shippingConsignments?.find((consignment) => consignment.selectedShippingOption) ||
    checkout.shippingConsignments?.[0];

  const [formValues, setFormValues] = useReducer(
    (currentValues: FormValues, newValues: Partial<FormValues>) => ({
      ...currentValues,
      ...newValues,
    }),
    {
      country: shippingConsignment?.address.countryCode ?? '',
      state: shippingConsignment?.address.stateOrProvince ?? '',
      city: shippingConsignment?.address.city ?? '',
      postcode: shippingConsignment?.address.postalCode ?? '',
    },
  );

  const selectedCountry = shippingCountries.find(({ code }) => code === formValues.country);
  const [isUSSelected, setIsUSSelected] = useState(true);
  // Preselect first state when states array changes and state is empty
  useEffect(() => {
    if (!!selectedCountry?.statesOrProvinces && !formValues.state) {
      setFormValues({ state: selectedCountry.statesOrProvinces[0]?.name || '' });
    }
  }, [formValues.state, selectedCountry?.statesOrProvinces]);

  const calculateShipping = async (data: any, formData: FormData) => {
    if (data?.[0]?.country_code && data?.[0]?.state_code && data?.[0]?.place_name) {
      formData.set('country', data?.[0]?.country_code);
      formData.set('state', data?.[0]?.state_code);
      formData.set('city', data?.[0]?.place_name);

      const { status } = await submitShippingInfo(formData, {
        checkoutId: checkout.entityId,
        lineItems:
          checkout.cart?.lineItems.physicalItems.map((item) => ({
            lineItemEntityId: item.entityId,
            quantity: item.quantity,
          })) || [],
        shippingId: shippingConsignment?.entityId ?? '',
      });

      if (status === 'error') {
        toast.error(t('errorMessage'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
      }
    } else {
      toast.error('Entered Postal code is not available', {
        icon: <AlertCircle className="text-error-secondary" />,
      });
    }
  }
  const onSubmit = async (formData: FormData) => {
    let postalCode: any = formData.get('zip');
    if (postalCode) {
      const data: any = await fetchCountryByZipcode(postalCode);
      await calculateShipping(data, formData);
    }
  };

  const getUserCurrentLocation = async () => {
    if ('geolocation' in navigator && navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, error, {
        timeout: 10000,
        maximumAge: 10000,
        enableHighAccuracy: true,
      });
    } else {
      console.log("Sorry, Geolocation is not supported by this browser.");
    }
  };
  const error = (error: any) => {
    switch (error?.code) {
      case error.PERMISSION_DENIED:
        console.log("Location permission denied.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
    }
  }
  const showPosition = async (position: any) => {
    let formData: FormData = new FormData();
    const { latitude, longitude }: { latitude: any, longitude: any } = position?.coords;
    if (latitude && longitude) {
      let dataFromLatLng = await fetchZipCodeByLatLng(latitude, longitude);
      if(dataFromLatLng?.[0]?.postal_code) {
        setFormValues({ postcode: dataFromLatLng?.[0]?.postal_code || '' });
      }
    }
  }

  return (
    <Form
      action={onSubmit}
      className={cn('mx-auto mb-4 mt-4 hidden w-full grid-cols-1 gap-y-4', isVisible && 'grid')}
    >
      <div className='flex flex-col justify-center items-start py-[10px] gap-[5px]'>
        <div className='font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]'>Calculate Shipping/Tax:</div>
        <div className='flex justify-center items-center p-0 gap-[5px] w-full'>
          <div className='flex-1'>
            <Field className="relative space-y-2 hidden" name="country">
              <FieldLabel htmlFor="country">{t('country')}</FieldLabel>
              <FieldControl asChild>
                <Select
                  autoComplete="country"
                  id="country"
                  onValueChange={(value: string) => {
                    if (value) {
                      setFormValues({ country: value, state: '', city: '', postcode: '' });
                      if (value === 'CA') {
                        setIsUSSelected(false);
                      } else {
                        setIsUSSelected(true);
                      }
                    } else {
                      setFormValues({ country: '', state: '', city: '', postcode: '' });
                      setIsUSSelected(false);
                    }
                  }}
                  options={shippingCountries.map(({ code, name }) => ({
                    value: code,
                    label: name,
                  }))}
                  placeholder={t('countryPlaceholder')}
                  value={formValues.country}
                />
              </FieldControl>
            </Field>
            <Field className="relative space-y-2 hidden" name="state">
              <FieldLabel htmlFor="state">{(isUSSelected) ? 'State' : 'Province'}</FieldLabel>
              <FieldControl asChild>
                {selectedCountry?.statesOrProvinces ? (
                  <Select
                    disabled={selectedCountry.statesOrProvinces.length === 0}
                    id="state"
                    onValueChange={(value) => setFormValues({ state: value })}
                    options={selectedCountry.statesOrProvinces.map(({ name }) => ({
                      value: name,
                      label: name,
                    }))}
                    placeholder={t('statePlaceholder')}
                    value={formValues.state}
                  />
                ) : (
                  <Input
                    autoComplete="address-level1"
                    onChange={(e) => setFormValues({ state: e.target.value })}
                    placeholder={t('statePlaceholder')}
                    type="text"
                    value={formValues.state}
                  />
                )}
              </FieldControl>
            </Field>
            <Field className="relative space-y-2 hidden" name="city">
              <FieldLabel htmlFor="city-field">{(isUSSelected) ? 'City' : 'Suburb'}</FieldLabel>
              <FieldControl asChild>
                <Input
                  autoComplete="address-level2"
                  id="city-field"
                  onChange={(e) => setFormValues({ city: e.target.value })}
                  placeholder={(isUSSelected) ? 'City' : 'Suburb'}
                  type="text"
                  value={formValues.city}
                />
              </FieldControl>
            </Field>
            <Field className="relative space-y-2" name="zip">
              <FieldControl asChild>
                <Input
                  height={44}
                  className='w-full min-h-[44px] p-[6px_10px] bg-[#ffffff] border border-[#cccbcb] rounded-[3px]'
                  autoComplete="postal-code"
                  id="zip-field"
                  onChange={(e) => setFormValues({ postcode: e.target.value })}
                  placeholder='Zip/Postcode'
                  type="text"
                  value={formValues.postcode}
                />
              </FieldControl>
            </Field>
          </div>
          <FormSubmit asChild>
            <SubmitButton />
          </FormSubmit>
        </div>
        <div className='flex items-center p-0 gap-[5px]'>
          <div className=''>
            <MapPin width={15} height={18} />
          </div>
          <div onClick={()=>getUserCurrentLocation()} className='font-normal cursor-pointer text-[14px] leading-[24px] tracking-[0.25px] text-[#353535] underline'>Use your current location</div>
        </div>
      </div>
    </Form>
  );
};
