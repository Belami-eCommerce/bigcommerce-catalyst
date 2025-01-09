import { unstable_noStore as noStore } from 'next/cache';
import { kv } from "./lib/kv";
import { SiteDataCache } from "./middlewares/with-routes";

export async function getChannelIdFromSite() {
  noStore();
  let channelData = await kv.get<SiteDataCache>('Belami_localhost:3000_v3_sitedata');
  console.log('========channelData=======', channelData);
  if(channelData?.siteData?.length) {
    let siteData: any = channelData?.siteData?.[0];
    if(siteData?.channelId) {
      return siteData?.channelId;
    }
  }
  return null;
}

export async function getStoreFrontTokenFromSite() {
  noStore();
  let channelData = await kv.get<SiteDataCache>('Belami_localhost:3000_v3_sitedata');
  console.log('========storee=======', channelData);
  if(channelData?.siteData?.length) {
    let siteData: any = channelData?.siteData?.[0];
    console.log('========storeeee innnnn=======', siteData);
    if(siteData?.storeFrontAccessToken) {
      return siteData?.storeFrontAccessToken;
    }
  }
  return null;
}