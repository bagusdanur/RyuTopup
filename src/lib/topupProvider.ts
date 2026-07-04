import crypto from 'crypto';

const API_URL = 'https://api.digiflazz.com/v1';

// Function to get config from environment variables
function getConfig() {
  const username = process.env.TOPUP_PROVIDER_USERNAME;
  const apiKey = process.env.TOPUP_PROVIDER_API_KEY;

  if (!username || !apiKey) {
    throw new Error("Top-up Provider configuration is missing in environment variables.");
  }

  return { username, apiKey };
}

// Function to generate MD5 signature
export function generateSign(refId: string): string {
  const { username, apiKey } = getConfig();
  const rawString = `${username}${apiKey}${refId}`;
  return crypto.createHash('md5').update(rawString).digest('hex');
}

// Check balance for VIP Reseller (Provider 2)
export async function checkBalance() {
  // We use VIP reseller for Provider 2
  const apiId = process.env.TOPUP2_API_ID;
  const apiKey = process.env.TOPUP2_API_KEY;

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

// Get Price List
// cmd: 'prepaid' or 'pasca'
export async function getPriceList(cmd: string = 'prepaid') {
  const { username } = getConfig();
  const sign = generateSign('pricelist');

  try {
    const response = await fetch(`${API_URL}/price-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cmd,
        username,
        sign,
      }),
      // We can revalidate this every hour (3600 seconds) if needed, but for manual sync, use no-store
      cache: 'no-store', 
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Provider getPriceList error:", error);
    throw error;
  }
}

// Process Topup Transaction
export async function processTopup(refId: string, skuCode: string, customerNo: string) {
  const { username } = getConfig();
  const sign = generateSign(refId);
  const isTesting = process.env.TOPUP_PROVIDER_MODE === 'development';

  try {
    const response = await fetch(`${API_URL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        buyer_sku_code: skuCode,
        customer_no: customerNo,
        ref_id: refId,
        sign,
        testing: isTesting, // Digiflazz accepts 'testing' flag
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Provider processTopup error:", error);
    throw error;
  }
}

// Check Transaction Status (Polling)
export async function checkStatus(refId: string, skuCode: string, customerNo: string) {
  const { username } = getConfig();
  const sign = generateSign(refId);

  try {
    const response = await fetch(`${API_URL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cmd: 'status',
        username,
        buyer_sku_code: skuCode,
        customer_no: customerNo,
        ref_id: refId,
        sign,
      }),
      cache: 'no-store',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Provider checkStatus error:", error);
    throw error;
  }
}
