-- Columna para comprobante de pago
ALTER TABLE guests ADD COLUMN payment_proof_url text;

-- Bucket privado para comprobantes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guest-payment-proofs',
  'guest-payment-proofs',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Políticas: anon puede subir, solo admin puede leer/borrar
CREATE POLICY "guest-payment-proofs: public upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'guest-payment-proofs');

CREATE POLICY "guest-payment-proofs: admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'guest-payment-proofs');

CREATE POLICY "guest-payment-proofs: admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'guest-payment-proofs');
