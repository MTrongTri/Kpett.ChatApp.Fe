import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
        return NextResponse.json({ ErrorCode: 'AUTH.NO_REFRESH_TOKEN' }, { status: 401 });
    }

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    const result = await backendRes.json();

    if (!backendRes.ok) {
        const response = NextResponse.json(result, { status: 401 });
        response.cookies.delete('refresh_token');
        return response;
    }

    const { accessToken, refreshToken: newRefreshToken } = result.data;

    const response = NextResponse.json({ data: { accessToken } });

    response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5,
    });

    response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
    });

    return response;
}