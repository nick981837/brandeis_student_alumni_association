const User = require("../models/user");
const passport = require("passport");
const { resolveInclude } = require("ejs");
// Function to get user parameters from request body and locals
const getUserParams = (body) => {
    return {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      graduationYear: body.graduationYear,
      major: body.major,
      job: body.job,
      company: body.company,
      city: body.city,
      state: body.state,
      country: body.country,
      zipCode: body.zipCode,
      bio: body.bio,
      interests: body.interests.split(","),
    };
  };
// check if user has permission to get access to the event
const checkHasAuthorization = (res, req, userId, next) => {
  if (!res.locals.loggedIn || res.locals.currentUser._id.toString() != userId) {
    let messages = "You cannot get access to other's account";
    req.skip = true;
    req.flash("error", messages);
    res.locals.redirect = `/users/${userId}`;
    next();
}
}
  // Define route handlers
  module.exports = {
    index: (req, res, next) => {
      User.find({})
        .then((users) => {
          res.locals.users = users;
          next();
        })
        .catch((error) => {
          console.log(`Error fetching users: ${error.message}`);
          next(error);
        });
    },
    // GET route for rendering user index page
    indexView: (req, res) => {
      res.render("users/index");
    },
    // GET route for rendering new user form
    new: (req, res) => {
      res.render("users/new");
    },
    // POST route for creating a new user
    create: (req, res, next) => {
      if (req.skip) return next();
      let newUser = new User(getUserParams(req.body));
      User.register(newUser, req.body.password, (error, user) => {
        if (user) {
          req.flash("success", `${user.name}'s account created successfully!`);
          res.locals.redirect = "/users";
          next();
        } else {
          req.flash(
            "error",
            `Failed to create user account because: ${error.message}.`
          );
          res.redirect("/users/new");
        }
      });
    },
    // Middleware to handle redirect after POST requests
    redirectView: (req, res, next) => {
      let redirectPath = res.locals.redirect;
      if (redirectPath) res.redirect(redirectPath);
      else next();
    },
    // GET route for displaying a single user
    show: (req, res, next) => {
      let userId = req.params.id;
      User.findById(userId)
        .then((user) => {
          res.locals.user = user;
          next();
        })
        .catch((error) => {
          console.log(`Error fetching user by ID: ${error.message}`);
          next(error);
        });
    },
    // GET route for rendering single user page
    showView: (req, res) => {
      res.render("users/show");
    },
    // GET route for rendering job edit form
    edit: (req, res, next) => {
      let userId = req.params.id;
      checkHasAuthorization(res,req, userId, next);
      User.findById(userId)
        .then((user) => {
          if (req.skip) {
            res.render("users/show", {
              user: user,
            });
          } else {
            res.render("users/edit", {
              user: user,
            });
          }
        })
        .catch((error) => {
          console.log(`Error fetching user by ID: ${error.message}`);
          next(error);
        });
    },
    // PUT route to update the job
    update: (req, res, next) => {
      if (req.skip) return next();
      let userId = req.params.id,
        userParams = getUserParams(req.body);
      User.findByIdAndUpdate(userId, {
        $set: userParams,
      })
        .then((user) => {
          req.flash("success", `${user.name}'s account updated successfully!`);
          res.locals.redirect = `/users/${userId}`;
          res.locals.user = user;
          next();
        })
        .catch((error) => {
          req.flash("error", error.messages);
          res.redirect(`/users/${userId}/edit`);

        });
    },
    // DELETE route to delete a user
    delete: (req, res, next) => {
      let userId = req.params.id;
      checkHasAuthorization(res,req, userId, next)
      if (!req.skip) {
      User.findByIdAndRemove(userId)
        .then(() => {
          req.flash("success", `Your account deleted successfully!`);
          res.locals.redirect = "/users/new";
          next();
        })
        .catch((error) => {
          console.log(`Error deleting user by ID: ${error.message}`);
          next();
        });
    }
  },
    login: (req, res) => {
      res.render("users/login", { title: "Login" });
    },
    //Authenticates the user using Passport's local strategy, which checks if the user exists in the database and if their password matches the hashed password stored in the database
    authenticate: passport.authenticate("local", {
      failureRedirect: "/users/login",
      failureFlash: "Your email and password do not match. Please try again.",
      successRedirect: "/",
    }),
    // validate the form data
    validate: (req, res, next) => {
      let userId = req.params.id;
      req.sanitizeBody("email").trim();
      req.check("email", "Email is invalid").isEmail();
      req.check("name", "Name cannot be empty").notEmpty();
      req.check("password", "Password cannot be empty").notEmpty();
      req.check("zipCode", "Zip code can not be empty").notEmpty();
      req.check("zipCode", "Zip code should be numbers").isInt();
      req
        .check("zipCode", "Zip code should have 5 digits")
        .isInt({ min: 10000, max: 99999 });
      req.check("graduationYear", "Graduation Year should be numbers").isInt();
      req.check("graduationYear", "Graduation Year cannot be empty").notEmpty();
      req.check("major", "Major cannot be empty").notEmpty();
      req.getValidationResult().then((error) => {
        if (!error.isEmpty()) {
          let messages = error.array().map((e) => e.msg);
          req.skip = true;
          req.flash("error", messages);
          if (req.method === "PUT") {
            res.redirect(`/users/${userId}/edit`)
          }
          else {
            res.redirect("/users/new");
          }
        } else {
          next();
        }
      });
    },
    // GET route to logout
    logout: (req, res, next) => {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        // clear the session
        req.flash("success", "You have been logged out!");
        res.locals.redirect = "/";
        next();
      });
    },
    verifyToken: (req, res, next) => {
      let token = req.query.apiToken;
      if (token) {
        User.findOne({ apiToken: token })
          .then((user) => {
            if (user) next();
            else next(new Error("Invalid API token."));
          })
          .catch((error) => {
            next(new Error(error.message));
          });
      } else {
        next(new Error("Invalid API token."));
      }
    },
  };