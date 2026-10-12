# Express Book Reviews — IBM Full Stack Final Project

This repository is forked from IBM's `expressBookReviews` starter and implements the bookstore REST API: list and search books, retrieve reviews, register/login, and manage authenticated reviews.

## Run

```bash
cd final_project
npm install
npm start
```

The server listens on `http://localhost:5000` by default. You may set `PORT`, `JWT_SECRET`, and `SESSION_SECRET` environment variables.

## Capture Coursera evidence

With the server running, from the repository root:

```bash
bash capture-evidence.sh
```

The script saves actual request commands and responses to `evidence/` under the filenames required by the grading instructions: `githubrepo`, `getallbooks`, `getbooksbyISBN`, `getbooksbyauthor`, `getbooksbytitle`, `getbookreview`, `register`, `login`, `reviewadded`, `deletereview`.

Copy their contents into the corresponding Coursera submissions. The outputs require a running server. Do not commit the `evidence/` directory: the login response contains a token.

## Task 11

The file [final_project/router/general.js](final_project/router/general.js) includes four `async/await` functions that call catalog endpoints via Axios.

**Educational demo only:** user accounts and reviews are stored in memory; passwords are not hashed. Restarting the server resets changes. Do not use this authentication approach in production.
