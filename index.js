const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const userRouter = require("./routes/user.routes");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const connectDB = require("./config/db");
const userModel = require("./models/user.model");
const generateToken = require("./utils/jwt");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const PORT = process.env.PORT || 3000;

connectDB();

/* Google auth */
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "352706182914-aid550g0kflki6g68qaarj08hlgk0of7.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Your logic to store user information in the database or session
      const u = await userModel.findOne({ email: profile.emails[0].value });
      if (u) {
        return done(null, {
          message: "User already exists!",
          status: 400,
        });
      }

      // User does not exist, create a new user
      const newUser = await userModel.create({
        username: profile.name.familyName,
        lastname: profile.name.familyName,
        firstname: profile.name.givenName,
        email: profile.emails[0].value,
      });

      // create a token
      const token = generateToken(newUser._id);
      return done(null, {
        newUser,
        status: 201,
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// route for google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after successful Google login
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirect after successful login
  }
);

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.status == 201) {
      res.send(`Welcome, ${req.user.newUser.username}!`);
    } else {
      res.send(req.user.message);
    }
  } else {
    res.redirect("/");
  }
});

app.get("/", (req, res) => {
  res.send('Home page. <a href="/auth/google">Login with Google</a>');
});

/* USER */
app.use("/api/v1/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server listening port ${PORT}...`);
});
