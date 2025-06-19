const bcrypt = require('bcryptjs');
const userModel = require('../models/User');

async function register(req, res) {
  const { name, email, phone, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.registerUser(name, email, phone, hashedPassword, role);
  res.redirect('/login');
}

async function login(req, res) {
  const { email, password, role } = req.body;
  const user = await userModel.findUserByEmail(email);

  if (!user) {
    return res.status(400).send('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).send('Invalid credentials');
  }

req.session.user = {
  id: user.id,       // Ambil ID user dari database yang login
  name: user.name,
  role: user.role   // Nama user
};

  if (user.role === 'pencari') {
    return res.redirect('/indexpencarikos');
  } else if (user.role === 'pemilik') {
    return res.redirect('/indexpemilikkos');
  }
}

module.exports = {
  register,
  login
};
