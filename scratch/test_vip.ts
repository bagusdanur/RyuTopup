import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({path:'.env.local'});
const sign = crypto.createHash('md5').update(process.env.TOPUP2_API_ID! + process.env.TOPUP2_API_KEY!).digest('hex');
fetch('https://vip-reseller.co.id/api/game-feature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    key: process.env.TOPUP2_API_KEY!,
    sign: sign,
    type: 'get-nickname',
    code: 'genshin-impact',
    target: '800000000',
    additional_target: 'os_asia'
  }).toString()
}).then(r => r.json()).then(console.log);
