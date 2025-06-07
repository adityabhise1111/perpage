import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {Strategy as GitHubStrategy} from 'passport-github2';


dotenv.config();

export default function initialize(passport) {
  // Local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user with that email' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    }
  ));

  // Google strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
  }, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        googleId: profile.id,
        email: profile.emails[0].value,
        profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
      
      },
      { upsert: true, new: true }
    );
    }
    return done(null, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
}




// git  strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`; // fallback
    let user = await User.findOne({ githubId: profile.id });
    if (user) {
      return done(null, user);
    }
    user = await User.findOne({ email });
    if (user) {
      user.githubId = profile.id;
      await user.save();
      return done(null, user);
    }
    const newUser = new User({
      username: profile.username,
      email,
      githubId: profile.id
    });
    await newUser.save();
    return done(null, newUser);
  } catch (err) {
    return done(err, null);
  }
}));
