const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const MaskData = require('maskdata');


const User = require('../models/User');

// créer un compte
exports.signup = (req, res, next) => {
    const emailMask2Options = {
      maskWith: "*", 
      unmaskedStartCharactersBeforeAt: 3,
      unmaskedEndCharactersAfterAt: 2,
      maskAtTheRate: false
    };

    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: MaskData.maskEmail2(req.body.email, emailMask2Options),
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

// Connexion à son compte
exports.login = (req, res, next) => {
  const emailMask2Options = {
    maskWith: "*", 
    unmaskedStartCharactersBeforeAt: 3,
    unmaskedEndCharactersAfterAt: 2,
    maskAtTheRate: false
  };
  User.findOne({ email: MaskData.maskEmail2(req.body.email, emailMask2Options)})
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              '&VEq2#!WyA#XhTGjwQ2E7Y^@5fRbn7',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

