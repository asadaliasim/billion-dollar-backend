// /middlewares/authMiddleware.js
module.exports = function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401)
}
