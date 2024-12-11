'use server';

import { cookies } from "next/headers";

export const deleteCart = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value; 

  console.log("--cartid--",cartId);
  try {
  const apiUrl = process.env.SALES_BUDDY_API_URL!;
  const apiEnv = process.env.SALES_BUDDY_API_ENV!;
  const apiPath = process.env.SALES_BUDDY_API_PATH!;
  const accessId = process.env.SALES_BUDDY_ACCESS_ID;

  // if (!apiUrl || !apiEnv || !apiPath || !accessId) {
  //   throw new Error('Missing required environment variables.');
  // }
 
    let postData = JSON.stringify({
      "cart_id": cartId,
      "access_id": accessId
    });
    const endPoint = `${apiUrl}${apiEnv}${apiPath}delete-cart`
    let data = await fetch(endPoint,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
      },
    ).then(res => res.json())
      .then(jsonData => {
        return jsonData;
      }).catch((error) => {
        return ({ status: 500, error: error.message });
      });
    return data;
  } catch (error) {
    return ({ status: 500, error: JSON.stringify(error) });
  }
}