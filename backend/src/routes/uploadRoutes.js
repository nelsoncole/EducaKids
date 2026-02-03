const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerConfig = require('../config/multer');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = multer(multerConfig).single('image');

// Rota para upload de imagem única
router.post('/', authMiddleware.authenticate, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('❌ Erro do Multer:', err);
      return res.status(400).json({ success: false, message: `Erro no upload: ${err.message}` });
    } else if (err) {
      console.error('❌ Erro no upload:', err);
      return res.status(500).json({ success: false, message: `Erro interno: ${err.message}` });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado ou formato inválido'
      });
    }

    try {
      const protocol = req.protocol;
      const host = req.get('host');

      if (!host) {
        console.error('❌ Host não identificado');
        return res.status(500).json({
          success: false,
          message: 'Erro interno: Host não identificado'
        });
      }

      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      console.log(`✅ Upload concluído: ${req.file.filename} -> ${fileUrl}`);

      return res.json({
        success: true,
        message: 'Upload realizado com sucesso',
        data: {
          filename: req.file.filename,
          url: fileUrl,
          size: req.file.size
        }
      });
    } catch (urlError) {
      console.error('❌ Erro ao gerar URL:', urlError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar URL do arquivo',
        error: urlError.message
      });
    }
  });
});

module.exports = router;
