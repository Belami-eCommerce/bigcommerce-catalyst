'use server';
import { cookies } from 'next/headers';

export const getReferralIdCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('referralId');
}

export const createReferralIdCookie = async () => {
    const cookieStore = await cookies();
    const hasCookie = cookieStore.has('referralId')
    if (!hasCookie) {
        let date = new Date();
        cookieStore.set({
            name: 'referralId',
            value: "Ref_" + date.getTime(),
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            path: '/',
        });
    }
}