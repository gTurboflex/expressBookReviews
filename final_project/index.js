const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { randomBytes } = require('node:crypto');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
const PORT = Number(process.env.PORT || 5000);
app.locals.baseUrl = 'http://127.0.0.1:' + PORT;
app.locals.jwtSecret = process.env.JWT_SECRET || randomBytes(32).toString('hex');
app.use(express.json());
app.use('/customer', session({ secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'), resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: 'lax', maxAge: 3600000 } }));
app.use('/customer/auth', (req, res, next) => {
 const token = req.session.authorization?.accessToken;
 if (!token) return res.status(401).json({ message: 'You must log in before managing reviews.' });
 try {
  req.user = jwt.verify(token, app.locals.jwtSecret, { algorithms: ['HS256'] });
  return next();
 } catch (error) { return res.status(401).json({ message: 'Invalid or expired session.' }); }
});
app.use('/customer', customer_routes);
app.use('/', genl_routes);
if (require.main === module) app.listen(PORT, '127.0.0.1', () => console.log('Book review server listening on ' + PORT));
module.exports = app;
