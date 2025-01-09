import { unstable_cache } from 'next/cache';
import db from './';
import { and, desc, eq, not } from 'drizzle-orm';
import { sites } from './schema';

export async function getSiteData(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, '')
    : null;

  return await unstable_cache(
    async () => {
      return await db.select().from(sites).where(subdomain
        ? eq(sites.subdomain, subdomain)
        : eq(sites.customDomain, domain)).limit(1);
      },
    [`${domain}-metadata`],
    {
      revalidate: 900,
      tags: [`${domain}-metadata`],
    },
  )();
}

export async function getSiteDataNoCache(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, '')
    : null;

    return await db.select().from(sites).where(subdomain
      ? eq(sites.subdomain, subdomain)
      : eq(sites.customDomain, domain)).limit(1);
}
