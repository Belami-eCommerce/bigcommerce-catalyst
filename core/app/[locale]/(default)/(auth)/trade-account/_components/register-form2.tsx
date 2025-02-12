'use client';

import { ChangeEvent, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAccountStatusContext } from '~/app/[locale]/(default)/account/(tabs)/_components/account-status-provider';
import {
  createFieldName,
  FieldNameToFieldId,
  FieldWrapper,
  NumbersOnly,
  Picklist,
  PicklistOrText,
  Text,
  MultilineText,
  DateField,
  RadioButtons,
  Checkboxes,
  Password,
  CUSTOMER_FIELDS_TO_EXCLUDE,
} from '~/components/form-fields';
import { Button } from '~/components/ui/button';
import { Form } from '~/components/ui/form';
import { Message } from '~/components/ui/message';
import { registerCustomers } from '../_actions/register-customers';
import { logins } from '../_actions/logins';

// Constants
const REQUIRED_FIELDS = new Set([
  'customer-email',
  'customer-password',
  'address-countryCode',
  'address-stateOrProvince',
  'address-line1',
  'address-city',
  'address-postalCode',
]);

type FieldOrderKeys =
  | 'I am a'
  | 'Company Name'
  | 'Tax ID / Licence#'
  | 'Country'
  | 'Suburb/City'
  | 'State/Province'
  | 'Zip/Postcode'
  | 'Address Line 1'
  | 'Address Line 2';

const FIELD_ORDER: Record<FieldOrderKeys, number> = {
  'I am a': 1,
  'Company Name': 2,
  'Tax ID / Licence#': 3,
  Country: 4,
  'State/Province': 5,
  'Address Line 1': 6,
  'Address Line 2': 7,
  'Suburb/City': 8,
  'Zip/Postcode': 9,
};

const ALLOWED_CUSTOMER_FIELDS = ['I am a', 'Tax ID / Licence#'];

const ALLOWED_ADDRESS_FIELDS = [
  'Company Name',
  'Country',
  'Suburb/City',
  'State/Province',
  'Zip/Postcode',
  'Address Line 1',
  'Address Line 2',
];

// Interfaces
interface BaseField {
  entityId: number;
  label: string;
  sortOrder: number;
  isBuiltIn: boolean;
  isRequired: boolean;
}

interface TradeAddress1 {
  TradeAddress1: string;
}

interface TextFormField extends BaseField {
  __typename: 'TextFormField';
  defaultText: string | null;
  maxLength: number | null;
}

interface MultilineTextFormField extends BaseField {
  __typename: 'MultilineTextFormField';
  defaultText: string | null;
  rows: number;
}

interface NumberFormField extends BaseField {
  __typename: 'NumberFormField';
  defaultNumber: number | null;
  maxLength: number | null;
  minNumber: number | null;
  maxNumber: number | null;
}

interface DateFormField extends BaseField {
  __typename: 'DateFormField';
  defaultDate: string | null;
  minDate: string | null;
  maxDate: string | null;
}

interface PicklistOption {
  entityId: number;
  label: string;
}

interface PicklistFormField extends BaseField {
  __typename: 'PicklistFormField';
  choosePrefix: string;
  options: PicklistOption[];
}

interface PicklistOrTextFormField extends BaseField {
  __typename: 'PicklistOrTextFormField';
  options: PicklistOption[];
  defaultText?: string | null;
  defaultNumber?: number | null;
}

interface RadioButtonsFormField extends BaseField {
  __typename: 'RadioButtonsFormField';
  options: PicklistOption[];
}

interface CheckboxesFormField extends BaseField {
  __typename: 'CheckboxesFormField';
  options: PicklistOption[];
}

interface PasswordFormField extends BaseField {
  __typename: 'PasswordFormField';
  defaultText: string | null;
  maxLength: number | null;
}

type FormField =
  | TextFormField
  | MultilineTextFormField
  | NumberFormField
  | DateFormField
  | PicklistFormField
  | PicklistOrTextFormField
  | RadioButtonsFormField
  | CheckboxesFormField
  | PasswordFormField;

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

interface RegisterForm2Props {
  TradeAddress1: string;
  addressFields: FormField[];
  customerFields: FormField[];
  countries: Array<{ name: string; code: string; states?: Array<{ name: string }> }>;
  defaultCountry: {
    code: string;
    states: Array<{ name: string }>;
  };
}

export const RegisterForm2 = ({
  addressFields,
  customerFields,
  countries = [],
  defaultCountry,
  TradeAddress1,
}: RegisterForm2Props) => {
  // Refs and Router
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // States
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [textInputValid, setTextInputValid] = useState<Record<number, boolean>>({});
  const [multiTextValid, setMultiTextValid] = useState<Record<number, boolean>>({});
  const [numbersInputValid, setNumbersInputValid] = useState<Record<number, boolean>>({});
  const [datesValid, setDatesValid] = useState<Record<number, boolean>>({});
  const [radioButtonsValid, setRadioButtonsValid] = useState<Record<number, boolean>>({});
  const [picklistValid, setPicklistValid] = useState<Record<number, boolean>>({});
  const [checkboxesValid, setCheckboxesValid] = useState<Record<number, boolean>>({});
  const [passwordValid, setPasswordValid] = useState<Record<number, boolean>>({});
  const [stateInputValid, setStateInputValid] = useState(false);
  const [countryStates, setCountryStates] = useState(defaultCountry.states);
  const [showAddressLine2, setShowAddressLine2] = useState(false);

  const { setAccountState } = useAccountStatusContext();
  const t = useTranslations('Register.Form');

  // Effects
  useEffect(() => {
    router.prefetch('/trade-account/trade-step3/');
  }, [router]);

  // Form Data Handling
  const isValidFormValue = (value: unknown): value is string | Blob => {
    return (
      value !== null && value !== undefined && (typeof value === 'string' || value instanceof Blob)
    );
  };

  const processFormData = (formData: FormData): FormData => {
    const combinedFormData = new FormData();

    // Process first step data
    if (typeof window !== 'undefined') {
      const firstStepData = JSON.parse(localStorage.getItem('registrationFormData') || '{}');
      Object.entries(firstStepData).forEach(([key, value]) => {
        if (isValidFormValue(value)) {
          combinedFormData.append(key, String(value));
        }
      });
    }

    // Process current form data
    for (const [key, value] of formData.entries()) {
      if (isValidFormValue(value)) {
        combinedFormData.append(key, String(value));
      }
    }

    return combinedFormData;
  };

  // Validation Handlers
  const validateStateInput = (value: string) => {
    if (!value) {
      setStateInputValid(false);
      return false;
    }
    setStateInputValid(true);
    return true;
  };

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;
    setTextInputValid((prev) => ({ ...prev, [fieldId]: !validationStatus }));
  };

  const handleMultiTextValidation = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setMultiTextValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleNumbersInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setNumbersInputValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleDatesValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setDatesValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleRadioButtonsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.name.split('-')[1]);
    setRadioButtonsValid((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handlePasswordValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);
    setPasswordValid((prev) => ({ ...prev, [fieldId]: !e.target.validity.valueMissing }));
  };

  const handleCountryChange = (value: string) => {
    const states = countries.find(({ code }) => code === value)?.states ?? [];
    setCountryStates(states);
  };

  // Submit Handler
  const onSubmit = async (formData: FormData) => {
    if (isSubmitting) return;

    // Validate state field
    const stateValue = formData.get('address-stateOrProvince');
    if (!stateValue) {
      setFormStatus({
        status: 'error',
        message: 'Please select or enter a state',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitProgress(20);

      const combinedFormData = processFormData(formData);
      setSubmitProgress(40);

      const submit = await registerCustomers({ formData: combinedFormData });
      setSubmitProgress(60);

      if (submit.status === 'success') {
        const email = formData.get('customer-email') as string;
        const password = formData.get('customer-password') as string;

        localStorage.removeItem('registrationFormData');
        setSubmitProgress(80);

        await Promise.all([
          setAccountState({ status: 'success' }),
          logins(email, password, combinedFormData),
        ]);

        setSubmitProgress(100);
        router.push('/trade-account/trade-step3/');
      } else {
        setFormStatus({
          status: 'error',
          message: submit.error || 'Registration failed',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setFormStatus({
        status: 'error',
        message: 'An unexpected error occurred',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  // Label Modifier
  const getModifiedLabel = (originalLabel: string): string => {
    switch (originalLabel) {
      case 'Tax ID / Licence#':
        return 'Tax ID/License#*';
      case 'I am a':
        return 'I am a*';
      case 'Company Name':
        return 'Business Name*';
      case 'Country':
        return 'Country*';
      case 'State/Province':
        return 'State*';
      case 'Address Line 1':
        return 'Address Line 1*';
      case 'Address Line 2':
        return 'Address Line 2 (Optional)';
      case 'Suburb/City':
        return 'City*';
      case 'Zip/Postcode':
        return 'Zipcode*';
      default:
        return originalLabel;
    }
  };

  // Field Renderer
  const renderField = (field: FormField, isCustomerField: boolean = false) => {
    const fieldId = field.entityId;
    const fieldName = createFieldName(field, isCustomerField ? 'customer' : 'address');
    const isCountrySelector = fieldId === FieldNameToFieldId.countryCode;
    const isStateField = fieldId === FieldNameToFieldId.stateOrProvince;

    const modifiedField = {
      ...field,
      label:
        field.label === 'Address Line 2' ? (
          <div
            className="flex w-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setShowAddressLine2(false);
            }}
          >
            Address Line 2 (Optional)
          </div>
        ) : (
          getModifiedLabel(field.label)
        ),
      isRequired: field.label !== 'Address Line 2',
    };

    switch (field.__typename) {
      case 'TextFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Text
              field={modifiedField}
              isValid={textInputValid[fieldId]}
              name={fieldName}
              onChange={handleTextInputValidation}
              type={FieldNameToFieldId[fieldId]}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
              }}
            />
          </FieldWrapper>
        );

      case 'MultilineTextFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <MultilineText
              field={field}
              isValid={multiTextValid[fieldId]}
              name={fieldName}
              onChange={handleMultiTextValidation}
            />
          </FieldWrapper>
        );

      case 'NumberFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <NumbersOnly
              field={field}
              isValid={numbersInputValid[fieldId]}
              name={fieldName}
              onChange={handleNumbersInputValidation}
            />
          </FieldWrapper>
        );

      case 'DateFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <DateField
              field={field}
              isValid={datesValid[fieldId]}
              name={fieldName}
              onChange={handleDatesValidation}
              onValidate={setDatesValid}
            />
          </FieldWrapper>
        );

      case 'RadioButtonsFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <RadioButtons
              field={field}
              isValid={radioButtonsValid[fieldId]}
              name={fieldName}
              onChange={handleRadioButtonsChange}
            />
          </FieldWrapper>
        );

      case 'PicklistFormField':
        if (isCountrySelector) {
          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <Picklist
                defaultValue={defaultCountry.code}
                field={modifiedField}
                isValid={picklistValid[fieldId]}
                name={fieldName}
                onChange={handleCountryChange}
                onValidate={setPicklistValid}
                options={countries.map(({ name, code }) => ({
                  label: name,
                  entityId: code,
                }))}
              />
            </FieldWrapper>
          );
        }

        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Picklist
              field={modifiedField}
              isValid={picklistValid[fieldId]}
              name={fieldName}
              onValidate={setPicklistValid}
              options={field.options}
            />
          </FieldWrapper>
        );

      case 'CheckboxesFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Checkboxes
              field={field}
              isValid={checkboxesValid[fieldId]}
              name={fieldName}
              onValidate={setCheckboxesValid}
              options={field.options}
            />
          </FieldWrapper>
        );

      case 'PicklistOrTextFormField':
        if (isStateField) {
          return (
            <FieldWrapper fieldId={fieldId} key={fieldId}>
              <PicklistOrText
                defaultValue={countryStates[0]?.name}
                field={{
                  ...modifiedField,
                  isRequired: true, // Make state field required
                }}
                name={fieldName}
                options={countryStates.map(({ name }) => ({
                  entityId: name,
                  label: name,
                }))}
                onChange={(value: string) => {
                  validateStateInput(value);
                }}
                onValidate={(isValid: boolean | ((prevState: boolean) => boolean)) => {
                  setStateInputValid(isValid);
                }}
                isValid={stateInputValid}
              />
            </FieldWrapper>
          );
        }
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <PicklistOrText field={field} name={fieldName} options={field.options} />
          </FieldWrapper>
        );

      case 'PasswordFormField':
        return (
          <FieldWrapper fieldId={fieldId} key={fieldId}>
            <Password
              field={field}
              isValid={passwordValid[fieldId]}
              name={fieldName}
              onChange={handlePasswordValidation}
            />
          </FieldWrapper>
        );

      default:
        return null;
    }
  };

  // Render Component
  return (
    <>
      {formStatus && (
        <Message className="mb-8" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form
        ref={formRef}
        className="register-form mx-auto max-w-[600px] sm:pt-3 md:pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit(formData);
        }}
      >
        <div className="trade2-form">
          {[
            ...customerFields
              .filter((field) => ALLOWED_CUSTOMER_FIELDS.includes(field.label))
              .sort(
                (a, b) =>
                  (FIELD_ORDER[a.label as FieldOrderKeys] || 0) -
                  (FIELD_ORDER[b.label as FieldOrderKeys] || 0),
              )
              .map((field) => renderField(field, true)),
            ...addressFields
              .filter((field) => {
                if (field.label === 'Address Line 2' && !showAddressLine2) {
                  return false;
                }
                return ALLOWED_ADDRESS_FIELDS.includes(field.label);
              })
              .sort(
                (a, b) =>
                  (FIELD_ORDER[a.label as FieldOrderKeys] || 0) -
                  (FIELD_ORDER[b.label as FieldOrderKeys] || 0),
              )
              .map((field) => (
                <div key={field.entityId}>
                  {field.label === 'Address Line 1' ? (
                    <>
                      {renderField(field, false)}
                      {!showAddressLine2 && (
                        <button
                          type="button"
                          className="relative top-[-1em] flex items-center gap-2 text-left text-[14px] font-normal leading-6 tracking-wide text-[#353535]"
                          onClick={() => setShowAddressLine2(true)}
                        >
                          <img src={TradeAddress1} className="w-[20px]" alt="" />
                          <span>Add Apt, suite, floor, or other.</span>
                        </button>
                      )}
                    </>
                  ) : (
                    renderField(field, false)
                  )}
                </div>
              )),
          ]}
        </div>

        <div className="mt-0 flex flex-col gap-4">
          {isSubmitting && (
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#008BB7] transition-all duration-300"
                style={{ width: `${submitProgress}%` }}
              />
            </div>
          )}
          <Button
            className="relative w-full items-center !bg-[#008BB7] px-8 py-2 xl:mt-8"
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </Button>
        </div>
      </Form>
    </>
  );
};
