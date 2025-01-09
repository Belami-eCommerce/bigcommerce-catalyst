import { getChannelIdFromSite, getStoreFrontTokenFromSite } from "./get-site-details";
// Set overrides per locale
const localeToChannelsMappings: Record<string, string> = {
  // es: '12345',
};

async function getChannelIdFromLocale(locale = '') {
  let channelId = await getChannelIdFromSite();
  if(channelId) {
    return channelId;
  }
  return localeToChannelsMappings[locale] ?? process.env.BIGCOMMERCE_CHANNEL_ID;
}

async function getStoreFrontAPIToken() {
  let storeFrontAccessToken = await getStoreFrontTokenFromSite();
  console.log('========channel store=======', storeFrontAccessToken);
  if(storeFrontAccessToken) {
    return storeFrontAccessToken;
  }
  return process.env.BIGCOMMERCE_STOREFRONT_TOKEN;
}

export { getChannelIdFromLocale, getStoreFrontAPIToken };
