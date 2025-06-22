const bcrypt = require('bcryptjs');
const User = require('../models/User');

function register(req, res) {
  const { name, email, phone, password, role } = req.body;
  
  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error during registration');
    }

    // Check if email already exists
    User.checkEmailExists(email, null, (err, emailExists) => {
      if (err) {
        console.error('Error checking email:', err);
        return res.status(500).send('Error during registration');
      }

      if (emailExists) {
        return res.status(400).send('Email already exists');
      }

      // Register user
      User.registerUser(name, email, phone, hashedPassword, role, (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).send('Error during registration');
        }

        res.redirect('/login');
      });
    });
  });
}

function login(req, res) {
  const { email, password, role } = req.body;
  
  console.log('Login attempt for email:', email);
  
  User.findUserByEmail(email, (err, user) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).send('Error during login');
    }

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).send('Invalid credentials');
    }

    console.log('User found:', { id: user.id, name: user.name, role: user.role });
    console.log('Password in DB:', user.password ? 'exists' : 'null/undefined');

    // Check if password is hashed (starts with $2a$ or $2b$)
    const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    
    console.log('Password is hashed:', isHashed);
    
    if (isHashed) {
      // Password is hashed, use bcrypt.compare
      bcrypt.compare(password, user.password, (err, isPasswordValid) => {
        if (err) {
          console.error('Error comparing password:', err);
          return res.status(500).send('Error during login');
        }

        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
          return res.status(400).send('Invalid credentials');
        }

        // Set session
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        };

        console.log('Session set for user:', user.name);

        if (user.role === 'pencari') {
          return res.redirect('/indexPencariKos');
        } else if (user.role === 'pemilik') {
          return res.redirect('/indexPemilikKos');
        }
      });
    } else {
      // Password is plain text, compare directly
      console.log('Comparing plain text passwords');
      
      if (user.password === password) {
        console.log('Plain text password match');
        
        // Set session
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        };

        // Hash the password and update it in database for future logins
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (!err) {
            User.updatePassword(user.id, hashedPassword, (updateErr) => {
              if (updateErr) {
                console.error('Error updating password hash:', updateErr);
              } else {
                console.log('Password hashed and updated in database');
              }
            });
          }
        });

        if (user.role === 'pencari') {
          return res.redirect('/indexPencariKos');
        } else if (user.role === 'pemilik') {
          return res.redirect('/indexPemilikKos');
        }
      } else {
        console.log('Plain text password mismatch');
        return res.status(400).send('Invalid credentials');
      }
    }
  });
}

module.exports = {
  register,
  login
};
