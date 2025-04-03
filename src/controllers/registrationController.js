const pool = require('../config/db');
const supabase = require('../config/supabase');

const createRegistration = async (req, res) => {
  const { files } = req;
  const {
    first_name,
    last_name,
    fide_id,
    birthdate,
    category,
    participant_type,
    federation,
    email,
    hotel,
    document_number,
    comments
  } = req.body;

  try {
    // Subir comprobante de pago a Supabase Storage
    const paymentFile = files['payment_proof'][0];
    const paymentFileName = `payment-${Date.now()}-${paymentFile.originalname}`;
    const { data: paymentData, error: paymentError } = await supabase.storage
      .from('payment-proofs')
      .upload(paymentFileName, paymentFile.buffer, {
        contentType: paymentFile.mimetype
      });

    if (paymentError) throw new Error('Error subiendo comprobante de pago');

    // Obtener URL pública del comprobante de pago
    const { data: paymentUrlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(paymentFileName);

    // Subir aval de federación a Supabase Storage
    const approvalFile = files['federation_approval'][0];
    const approvalFileName = `approval-${Date.now()}-${approvalFile.originalname}`;
    const { data: approvalData, error: approvalError } = await supabase.storage
      .from('payment-proofs')
      .upload(approvalFileName, approvalFile.buffer, {
        contentType: approvalFile.mimetype
      });

    if (approvalError) throw new Error('Error subiendo aval de federación');

    // Obtener URL pública del aval de federación
    const { data: approvalUrlData } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(approvalFileName);

    // Insertar en PostgreSQL
    const result = await pool.query(
      'INSERT INTO registrations (first_name, last_name, fide_id, birthdate, category, participant_type, federation, payment_proof, federation_approval, email, hotel, document_number, comments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [
        first_name,
        last_name,
        fide_id,
        birthdate,
        category,
        participant_type,
        federation,
        paymentUrlData.publicUrl,
        approvalUrlData.publicUrl,
        email,
        hotel,
        document_number,
        comments
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