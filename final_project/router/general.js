const express = require('express');
const axios = require('axios');
const { scryptSync, randomBytes } = require('node:crypto');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const public_users = express.Router();
public_users.post('/register', (req, res) => {
 const { username, password } = req.body;
 if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'A username and password of at least 8 characters are required.' });
 if (isValid(username)) return res.status(409).json({ message: 'Username already registered.' });
 const salt = randomBytes(16).toString('hex');
 users.push({ username, salt, passwordHash: scryptSync(password, salt, 64) });
 return res.status(201).json({ message: 'User successfully registered. You can now log in.', username });
});
// A fixed internal endpoint supplies asynchronous data, without accepting a URL from the client.
public_users.get('/catalog', (req, res) => res.json(books));
const catalogUrl = req => req.app.locals.baseUrl + '/catalog';
const options = { timeout: 5000, proxy: false };
const unavailable = (res, error) => res.status(502).json({ message: 'Catalog request failed.', error: error.message });
// Task 10: Axios promise callbacks retrieve the full catalog.
public_users.get('/', (req, res) => axios.get(catalogUrl(req), options).then(response => res.json(response.data)).catch(error => unavailable(res, error)));
// Task 10: Axios with async/await retrieves one ISBN.
public_users.get('/isbn/:isbn', async (req, res) => {
 try {
  const { data } = await axios.get(catalogUrl(req), options);
  return data[req.params.isbn] ? res.json(data[req.params.isbn]) : res.status(404).json({ message: 'Book not found.' });
 } catch (error) { return unavailable(res, error); }
});
// Task 10: Axios with async/await retrieves all matching authors.
public_users.get('/author/:author', async (req, res) => {
 try {
  const { data } = await axios.get(catalogUrl(req), options);
  return res.json(Object.fromEntries(Object.entries(data).filter(([, book]) => book.author.toLowerCase() === req.params.author.toLowerCase())));
 } catch (error) { return unavailable(res, error); }
});
// Task 10: Axios promise chaining retrieves matching titles.
public_users.get('/title/:title', (req, res) => axios.get(catalogUrl(req), options).then(({ data }) => res.json(Object.fromEntries(Object.entries(data).filter(([, book]) => book.title.toLowerCase() === req.params.title.toLowerCase())))).catch(error => unavailable(res, error)));
public_users.get('/review/:isbn', (req, res) => {
 const book = books[req.params.isbn];
 return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found.' });
});
module.exports.general = public_users;
