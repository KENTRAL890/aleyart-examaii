// errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  if (err.name === 'ValidationError')
    return res.status(400).json({ success: false, message: err.message });
  if (err.code === 'P2002')
    return res.status(409).json({ success: false, message: 'A record with this value already exists' });
  if (err.code === 'P2025')
    return res.status(404).json({ success: false, message: 'Record not found' });
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
};

module.exports = { errorHandler, notFound };
