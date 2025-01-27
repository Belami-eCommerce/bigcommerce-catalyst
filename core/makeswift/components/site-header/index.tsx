import { MakeswiftComponent } from '@makeswift/runtime/next';

import { getSessionUserDetails } from '~/auth';
import { getComponentSnapshot } from '~/lib/makeswift/client';

import { PropsContextProvider } from './client';
import { COMPONENT_TYPE } from './register';

interface Props {
  snapshotId?: string;
  label?: string;
}

const homeClickLogo =
  'https://cdn11.bigcommerce.com/s-2zedqgpp8x/images/stencil/384w/homeclick_logo_250_1_1728382170__09216.original.png?compression=lossy';

export const SiteHeader = async ({
  snapshotId = 'site-header-belami',
  label = 'Site Header',
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);
  const defaultLogo = homeClickLogo;
  const getCustomerData = await getSessionUserDetails();
  const loggedIn = getCustomerData?.customerAccessToken != null;

  return (
    <PropsContextProvider value={{ defaultLogo, loggedIn }}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
