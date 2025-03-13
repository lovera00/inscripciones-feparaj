const pool = require('../config/db');
const supabase = require('../config/supabase');

const createRegistration = async (req, res) => {
  const { file } = req;
  const {
    first_name,
    last_name,
    fide_id,
    birthdate,
    category,
    participant_type,
    federation,
    email
  } = req.body;

  try {
    // Subir archivo a Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });

    if (error) throw new Error('Error subiendo archivo');

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    // Insertar en PostgreSQL
    const result = await pool.query(
      'INSERT INTO registrations (first_name, last_name, fide_id, birthdate, category, participant_type, federation, payment_proof, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        first_name,
        last_name,
        fide_id,
        birthdate,
        category,
        participant_type,
        federation,
        urlData.publicUrl,
        email
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'FIDE ID ya existe' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRegistration
};