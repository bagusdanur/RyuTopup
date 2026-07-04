import crypto from 'crypto';

const API_URL = 'https://vip-reseller.co.id/api/game-feature';

export function generateSign(): string {
  const apiId = process.env.TOPUP2_API_ID || '';
  const apiKey = process.env.TOPUP2_API_KEY || '';
  return crypto.createHash('md5').update(apiId + apiKey).digest('hex');
}

export async function checkBalance() {
  const apiId = process.env.TOPUP2_API_ID || '';
  const apiKey = process.env.TOPUP2_API_KEY || '';

  if (!apiId || !apiKey) {
    throw new Error("VIP Reseller API ID/KEY missing for checking balance.");
  }

  const sign = crypto.createHash('md5').update(apiId + apiKey).digest('hex');
  const payload = new URLSearchParams({
      key: apiKey,
      sign,
  });

  try {
    const response = await fetch('https://vip-reseller.co.id/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
      cache: 'no-store',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Provider checkBalance error:", error);
    throw error;
  }
}

export async function checkNickname(gameCode: string, userId: string, zoneId: string = '') {
  const apiKey = process.env.TOPUP2_API_KEY || '';
  const sign = generateSign();
  const isDev = process.env.TOPUP2_MODE === 'development';

  const payload: any = {
    key: apiKey,
    sign: sign,
    type: 'get-nickname',
    code: gameCode,
    target: userId,
  };

  if (zoneId) {
    payload.additional_target = zoneId;
  }

  if (isDev) {
    console.log('[DEV] Checking nickname with payload:', payload);
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });

    const data = await response.json();
    if (isDev) {
      console.log('[DEV] Nickname check response:', data);
    }

    if (data.result) {
      return { success: true, nickname: data.data };
    } else {
       return { success: false, message: data.message || 'Nickname not found' };
    }
  } catch (error: any) {
    console.error('Error checking nickname:', error);
    return { success: false, message: error.message };
  }
}

export async function processTopup(trxRef: string, skuCode: string, userId: string, zoneId: string = '') {
  const apiKey = process.env.TOPUP2_API_KEY || '';
  const sign = generateSign();
  const isDev = process.env.TOPUP2_MODE === 'development';

  const payload: any = {
    key: apiKey,
    sign: sign,
    type: 'order',
    service: skuCode,
    data_no: userId,
  };

  if (zoneId) {
    payload.data_zone = zoneId;
  }

  if (isDev) {
    console.log('[DEV] Skipping actual order to provider. Mocking response for trxRef:', trxRef);
    console.log('[DEV] Payload would be:', payload);
    return {
      success: true,
      data: {
        trxid: `DEV-${trxRef}`,
        status: 'sukses',
        price: 0,
        note: 'Mocked dev order'
      }
    };
  }

  try {
     const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload).toString(),
     });

     const data = await response.json();

     if (data.result) {
        return { success: true, data: data.data };
     } else {
        return { success: false, message: data.message };
     }
  } catch (error: any) {
      console.error('Error processing topup:', error);
      return { success: false, message: error.message };
  }
}

export async function checkStatus(trxId: string) {
    const apiKey = process.env.TOPUP2_API_KEY || '';
    const sign = generateSign();

    const payload = {
        key: apiKey,
        sign: sign,
        type: 'status',
        trxid: trxId,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(payload).toString(),
        });

        const data = await response.json();
        
        if (data.result && data.data && data.data.length > 0) {
            return { success: true, data: data.data[0] };
        } else {
            return { success: false, message: data.message || 'Status not found' };
        }
    } catch (error: any) {
        console.error('Error checking status:', error);
        return { success: false, message: error.message };
    }
}

export async function getPriceList(filterGame?: string, filterStatus?: string) {
    const apiKey = process.env.TOPUP2_API_KEY || '';
    const sign = generateSign();

    const payload: any = {
        key: apiKey,
        sign: sign,
        type: 'services',
    };

    if (filterGame) {
        payload.filter_game = filterGame;
    }
    if (filterStatus) {
        payload.filter_status = filterStatus;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(payload).toString(),
        });

        const data = await response.json();

        // Map to standard format expected by the frontend
        if (data.result) {
            return { success: true, data: data.data };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error: any) {
         console.error('Error fetching services:', error);
         return { success: false, message: error.message };
    }
}
