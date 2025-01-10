import { unstable_noStore as noStore } from 'next/cache';
import { kv } from "./lib/kv";
import { SiteDataCache } from "./middlewares/with-routes";

export async function getChannelIdFromSite() {
  noStore();
  //let cookieStore = await cookies();
  let domain = "";
  console.log('========domain=======', domain);
  let channelData = await kv.get<SiteDataCache>(`${process.env.KV_NAMESPACE}_${domain}_v3_sitedata`);
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
  //let cookieStore = await cookies();
  let domain = "";
  console.log('========domain=======', domain);
  let channelData = await kv.get<SiteDataCache>(`${process.env.KV_NAMESPACE}_${domain}_v3_sitedata`);
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