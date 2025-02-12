import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

export const SubmitButton = () => {
  const t = useTranslations('Cart.SubmitShippingCost');
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full items-center px-8 py-2 mt-6 tracking-widest bg-sky-600 text-white"
      loading={pending}
      loadingText={t('spinnerText')}
      variant="secondary"
    >
      {t('submitText')}
    </Button>
  );
};
