'use server';

import { unstable_rethrow as rethrow } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import { Credentials, signIn } from '~/auth';
import { redirect } from '~/i18n/routing';

export const login = async (p0: null, formData: FormData) => {
  try {
    const locale = await getLocale();

    const credentials = Credentials.parse({
      email: formData.get('customer-email'),
      password: formData.get('customer-password'),
    });

    await signIn('credentials', {
      ...credentials,
      // We want to use next/navigation for the redirect as it
      // follows basePath and trailing slash configurations.
      redirect: false,
    });

    redirect({ href: '/account', locale });
  } catch (error: unknown) {
    rethrow(error);

    return {
      status: 'error',
    };
  }
};