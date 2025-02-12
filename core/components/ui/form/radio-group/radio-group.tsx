import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ComponentPropsWithoutRef, useId } from 'react';

import { cn } from '~/lib/utils';

import { Label } from '../label';

interface Item {
  label: string;
  value: string;
}

interface Props extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  error?: boolean;
  items: Item[];
}

const RadioGroup = ({ children, className, error = false, items, ...props }: Props) => {
  const id = useId();

  return (
    <RadioGroupPrimitive.Root className={className} {...props}>
      {items.map((item) => {
        const { label, value, ...itemProps } = item;

        return (
          <div className="mb-3 flex w-full gap-2" key={`${id}-${value}`}>
            <RadioGroupPrimitive.Item
              {...itemProps}
              className={cn(
                'flex h-5 w-5 bg-white bg-opacity-100 items-center justify-center rounded-full border-2 border-gray-800 hover:border-secondary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:hover:border-secondary disabled:pointer-events-none disabled:bg-gray-100 radix-state-checked:border-primary radix-state-checked:bg-white radix-state-checked:hover:border-secondary radix-state-checked:disabled:border-gray-400 radix-state-checked:disabled:bg-gray-400',
                error &&
                  'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 focus-visible:hover:border-error disabled:border-gray-200 radix-state-checked:border-error-secondary radix-state-checked:bg-error-secondary radix-state-checked:hover:border-error radix-state-checked:hover:bg-error',
              )}
              id={`${id}-${value}`}
              value={value}
            >
              <RadioGroupPrimitive.Indicator className="!w-[0.6rem] !h-[0.6rem] rounded-full bg-sky-600" />
            </RadioGroupPrimitive.Item>
            <Label className="w-full text-sm text-[#353535]" htmlFor={`${id}-${item.value}`}>
              {label}
            </Label>
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
};

export { RadioGroup };
