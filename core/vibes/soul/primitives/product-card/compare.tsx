'use client';

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';

import { Checkbox } from '@/vibes/soul/form/checkbox';

type Props = {
  productId: string;
  paramName?: string;
  label?: string;
};

export const Compare = function Compare({
  productId,
  paramName = 'compare',
  label = 'Compare',
}: Props) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false }),
  );

  return (
    <Checkbox
      id={`${paramName}-${productId}`}
      className="text-contrast-500 transition-colors duration-300 hover:text-foreground"
      label={label}
      checked={param?.includes(productId) ?? false}
      onCheckedChange={(value) => {
        void setParam((prev) => {
          const next =
            value === true
              ? [...(prev ?? []), productId]
              : (prev ?? []).filter((v) => v !== productId);

          return next.length > 0 ? next : null;
        });
      }}
    />
  );
};
