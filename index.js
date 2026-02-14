require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

console.log("MACG Data Engine iniciado en nube...");

async function guardarDatos() {
  try {
    const response = await axios.get('https://api.bitso.com/v3/ticker/');
    const tickers = response.data.payload;

    for (const pair of tickers) {
      if (!pair.book.endsWith('_mxn')) continue;

      const price = parseFloat(pair.last);
      if (!price) continue;

      await supabase.from('market_data').insert([
        {
          symbol: pair.book.toUpperCase(),
          price: price,
          source: 'bitso'
        }
      ]);
    }

    console.log("Datos guardados");
  } catch (err) {
    console.log("Error:", err.message);
  }
}

setInterval(guardarDatos, 60000);
guardarDatos();
