import { Group, Image, Link, List, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftHeader } from './client';

export const COMPONENT_TYPE = 'makeswift-header';

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    logo: Image({ label: 'Logo' }),
    links: List({
      label: 'Links',
      type: Group({
        label: 'Link',
        props: {
          label: TextInput({ label: 'Text', defaultValue: 'Text' }),
          link: Link({ label: 'URL' }),
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Text',
    }),
  },
});
