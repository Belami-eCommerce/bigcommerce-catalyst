import React from 'react'
import { cookies } from 'next/headers'
export async function withActivationCode(activationCode:any) {
    const cookieStore = await cookies();
     cookieStore.set({
       name: 'activation_code',
       value: activationCode,
       httpOnly: true,
       sameSite: 'lax',
       secure: true,
       path: '/',
     });
}
