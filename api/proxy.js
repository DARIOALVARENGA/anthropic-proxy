export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // Traer cotizaciones de rava.com
    const [rAcc, rBon] = await Promise.allSettled([
      fetch('https://www.rava.com/empresas/cotizaciones.php?formato=json'),
      fetch('https://www.rava.com/renta-fija/cotizaciones.php?formato=json')
    ]);

    const precios = {};

    if (rAcc.status === 'fulfilled' && rAcc.value.ok) {
      const data = await rAcc.value.json();
      Object.entries(data).forEach(([tk, v]) => {
        const px = parseFloat(v?.ultimo || v?.cierre || v?.price || 0);
        if (px > 0) precios[tk.toUpperCase()] = px;
      });
    }

    if (rBon.status === 'fulfilled' && rBon.value.ok) {
      const data = await rBon.value.json();
      Object.entries(data).forEach(([tk, v]) => {
        const px = parseFloat(v?.ultimo || v?.cierre || v?.price || 0);
        if (px > 0) precios[tk.toUpperCase()] = px;
      });
    }

    res.status(200).json(precios);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
