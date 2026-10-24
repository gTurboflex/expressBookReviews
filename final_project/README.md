# Book Review REST API

Course project based on IBM Skills Network expressBookReviews.

Run npm install, then npm start (default port 5000). PORT can override the port.

Public routes: GET /, /isbn/:isbn, /author/:author, /title/:title, /review/:isbn; POST /register.
Registered routes: POST /customer/login; PUT and DELETE /customer/auth/review/:isbn.

Sessions contain an expiring, verified JWT. Reviews are keyed by the authenticated username, so users can edit or delete only their own review. Passwords are stored as salted scrypt hashes. Four catalog lookups use Axios with promises or async/await.

Verification completed: nine cURL demonstrations, seven negative/ownership checks, and twenty concurrent lookups. Books and registrations are in memory for this instructional application and reset when the server restarts. Demo credentials in verification examples are synthetic test data.
