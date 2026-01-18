export default function securityMiddleware(req, res, next) {
  const blocked = ['/src/', '/components/', '.jsx', '.tsx'];
  if (blocked.some(path => req.url.includes(path))) {
    console.log(`🚫 Blocked: ${req.url}`);
    res.statusCode = 404;
    return res.end('Not Found');
  }
  next();
}