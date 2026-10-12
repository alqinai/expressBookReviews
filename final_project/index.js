const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticated: customer_routes, JWT_SECRET } = require('./router/auth_users.js');
const genl_routes = require('./router/general.js').general;
const app = express();

app.use(express.json());
app.use('/customer', session({ secret: process.env.SESSION_SECRET || 'local-classroom-session', resave: false, saveUninitialized: false }));
app.use('/customer/auth', (req, res, next) => {
  const bearer = req.get('authorization');
  const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : req.session?.authorization?.accessToken;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
});
app.use('/customer', customer_routes);
app.use('/', genl_routes);
const PORT = Number(process.env.PORT || 5000);
if (require.main === module) app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
