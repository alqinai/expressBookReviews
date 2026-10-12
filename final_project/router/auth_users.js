const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'local-classroom-demo-secret';
const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid Login. Check username and password' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken: token, username };
  return res.json({ message: 'User successfully logged in', token });
});
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.query.review ?? req.body?.review;
  if (typeof review !== 'string' || !review.trim()) return res.status(400).json({ message: 'Review required' });
  book.reviews[req.user.username] = review;
  return res.json({ message: 'Review successfully added/updated', reviews: book.reviews });
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) return res.status(404).json({ message: 'No review found for this user' });
  delete book.reviews[req.user.username];
  return res.json({ message: 'Review successfully deleted', reviews: book.reviews });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
module.exports.JWT_SECRET = JWT_SECRET;
