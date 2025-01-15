'use server';
import { cookies } from 'next/headers';

export const getSessionIdCookie = async () => {
  const cookieStore = await cookies();

  return cookieStore.get('sessionId');
};

export const createSession = async (Userdata: any) => {

  try {
    let postData = JSON.stringify({
      cart_id: Userdata.cart_id,
      referral_id: '',
      customer_id: "",
      customer_group_id: "",
      customer_name: '',
      customer_emailid: '',
      shopper_information: Userdata.shopper_information,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    let data = await fetch(apiUrl + apiEnv + apiPath + 'create-session-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    })
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      })
      .catch((error) => {
        return { status: 500, error: error.message };
      });
    // if(data.status === 200){
    //     createSessionIdCookie(data.output);
    // }
    return data;
    //return ({status : 200, output: 1234567890 });
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

export const createSessionIdCookie = async (localMachineInformation: any) => {
  const cookieStore = await cookies();
  const hasCookie = cookieStore.has('sessionId');
  const CartId = cookieStore.get('cartId');

  if (!CartId || !CartId.value) {
    return {
      status: 400,
      error: 'Your cart is empty, please add a product to the cart and generate a session ID.',
    };
  }

  let data = {
    cart_id: CartId.value,
    shopper_information: localMachineInformation,
  };
  let sessioncheck = await createSession(data);
  let date = new Date();
  cookieStore.set({
    name: 'sessionId',
    value: sessioncheck.output,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });

  return sessioncheck;
};
