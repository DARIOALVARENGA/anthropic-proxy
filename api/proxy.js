export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // Login IOL
    const login = await fetch('https://api.invertironline.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(process.env.IOL_USER)}&password=${encodeURIComponent(process.env.IOL_PASS)}&grant_type=password`
    });
    const token = await login.json();
    if (!token.access_token) throw new Error('Login IOL fallido');

    const { tickers } = req.body || {};
    if (!tickers || !tickers.length) { res.status(200).json({}); return; }

    // Cotizar cada ticker
    const precios = {};
    await Promise.all(tickers.map(async tk => {
      try {
        const r = await fetch(`https://api.invertironline.com/api/v2/bCBA/Titulos/${tk}/Cotizacion`, {
          headers: { 'Authorization': `Bearer ${token.access_token}` }
        });
        const d = await r.json();
        const px = parseFloat(d.ultimoPrecio || d.ultimo || 0);
        if (px > 0) precios[tk.toUpperCase()] = px;
      } catch (e) {}
    }));

    res.status(200).json(precios);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
