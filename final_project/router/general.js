const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (isValid(username)) return res.status(409).json({ message: 'User already exists.' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. Now you can login' });
});
public_users.get('/', (req, res) => res.json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});
public_users.get('/author/:author', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.author.toLowerCase() === req.params.author.toLowerCase()));
  return res.json(matches);
});
public_users.get('/title/:title', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.title.toLowerCase() === req.params.title.toLowerCase()));
  return res.json(matches);
});
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

// Asynchronous Axios methods for the IBM final project.
const api = axios.create({ baseURL: process.env.BOOKS_API_URL || 'http://127.0.0.1:5000' });
async function getAllBooks() { return (await api.get('/')).data; }
async function getBookByISBN(isbn) { return (await api.get(`/isbn/${encodeURIComponent(isbn)}`)).data; }
async function getBooksByAuthor(author) { return (await api.get(`/author/${encodeURIComponent(author)}`)).data; }
async function getBooksByTitle(title) { return (await api.get(`/title/${encodeURIComponent(title)}`)).data; }

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
