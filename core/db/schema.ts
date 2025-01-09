import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const sites = pgTable(
  'sites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }),
    description: text('description'),
    logo: varchar('logo', { length: 255 }),
    subdomain: varchar('subdomain', { length: 255 }).unique(),
    customDomain: varchar('customDomain', { length: 255 }).unique(),
    template: varchar('template', { length: 32 }),
    storeHash: varchar('storeHash', { length: 64 }),
    channelId: varchar('channelId', { length: 16 }),
    accessToken: varchar('accessToken', { length: 64 }),
    storeFrontAccessToken: text('storeFrontAccessToken'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' })
      .$onUpdate(() => new Date())
  }
);

export type SelectSite = typeof sites.$inferSelect;