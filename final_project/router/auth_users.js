const express = require('express');
const jwt = require('jsonwebtoken');
const { scryptSync, timingSafeEqual } = require('node:crypto');
const books = require('./booksdb.js');
const regd_users = express.Router();
const users = [];
const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) => {
 const user = users.find(item => item.username === username);
 return !!user && typeof password === 'string' && timingSafeEqual(user.passwordHash, scryptSync(password, user.salt, 64));
};
regd_users.post('/login', (req, res) => {
 const { username, password } = req.body;
 if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password.' });
 req.session.regenerate(error => {
  if (error) return res.status(500).json({ message: 'Unable to establish session.' });
  const accessToken = jwt.sign({ username }, req.app.locals.jwtSecret, { expiresIn: '1h', algorithm: 'HS256' });
  req.session.authorization = { accessToken, username };
  return res.json({ message: 'Successfully logged in.', username });
 });
});
regd_users.put('/auth/review/:isbn', (req, res) => {
 const book = books[req.params.isbn];
 if (!book) return res.status(404).json({ message: 'Book not found.' });
 const review = req.query.review || req.body.review;
 if (typeof review !== 'string' || !review.trim()) return res.status(400).json({ message: 'A non-empty review is required.' });
 // The owner comes from the verified JWT, never a user-supplied owner field.
 book.reviews[req.user.username] = review;
 return res.json({ message: 'Review successfully added or modified.', reviews: book.reviews });
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
 const book = books[req.params.isbn];
 if (!book) return res.status(404).json({ message: 'Book not found.' });
 if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) return res.status(404).json({ message: 'No review by this user exists for the book.' });
 delete book.reviews[req.user.username];
 return res.json({ message: 'Review successfully deleted.', reviews: book.reviews });
});
module.exports = { authenticated: regd_users, isValid, users, authenticatedUser };
