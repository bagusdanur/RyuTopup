import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({path:'.env.local'});
const sign = crypto.createHash('md5').update(process.env.TOPUP2_API_ID! + process.env.TOPUP2_API_KEY!).digest('hex');

async function check() {
  const response = await fetch('https://vip-reseller.co.id/api/game-feature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      key: process.env.TOPUP2_API_KEY!,
      sign: sign,
      type: 'services',
      filter_type: 'game',
      filter_status: 'available'
    }).toString()
  });
  const res = await response.json();
  
  const pubg = res.data.filter((i:any) => i.game.toUpperCase().includes('PUBG'));
  console.log("PUBG Products:");
  pubg.forEach((i:any) => console.log(`[${i.code}] ${i.name} - ${i.price.basic}`));
}
check();
