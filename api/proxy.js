export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const r = await fetch('https://bolsar.info/Cotizaciones/getCotizaciones.php?panel=general', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const text = await r.text();
    console.log('bolsar response:', text.substring(0, 200));
    const data = JSON.parse(text);
    const precios = {};
    (Array.isArray(data) ? data : data.cotizaciones || []).forEach(item => {
      const tk = (item.simbolo || item.ticker || item.Simbolo || '').toUpperCase();
      const px = parseFloat(item.ultimo || item.cierre || item.Ultimo || item.Cierre || 0);
      if (tk && px > 0) precios[tk] = px;
    });
    res.status(200).json(precios);
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}
