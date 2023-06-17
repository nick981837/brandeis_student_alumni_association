const { resolveInclude } = require("ejs");
const Event = require("../models/event");
const User = require("../models/user");
const httpStatus = require("http-status-codes");
// Function to get event parameters from request body and locals
const getEventParams = (body, res) => {
  return {
    title: body.title,
    description: body.description,
    location: body.location,
    startDate: body.startDate,
    endDate: body.endDate,
    organizer: res.locals.currentUser,
    isOnline: body.isOnline === "true" ? true : false,
    registrationLink: body.registrationLink,
    organizer: res.locals.currentUser,
    attendees: body.attendees,
  };
};
// check if user has permission to get access to the event
const checkHasAuthorization = (res, event, req) => {
  if (
    !res.locals.loggedIn ||
    res.locals.currentUser._id.toString() != event.organizer.toString()
  ) {
    // If not, skip to next middleware with error message
    req.skip = true;
    let messages = "You cannot get access to other's events";
    req.flash("error", messages);
    res.redirect("back");
  }
  return true;
}
// Define route handlers
module.exports = {
  // GET route for displaying all events
  index: (req, res, next) => {
    Event.find({})
      .then((events) => {
        res.locals.events = events;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching Events: ${error.message}`);
        next(error);
      });
  },
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    });
  },
  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }
    res.json(errorObject);
  },
  join: (req, res, next) => {
    let eventId = req.params.id;
    if (res.locals.currentUser) {
      Event.findByIdAndUpdate(eventId, {
        $addToSet: { attendees: res.locals.currentUser._id },
        },
      ).then(() => {
          res.locals.success = true;
          next();
        })
        .catch((error) => {
          next(error);
        });
    } else {
      next(new Error("User must log in."));
    }
  },
  // GET route for rendering events index page
  indexView: (req, res) => {
    res.render("events/index", { title: "Events" });
  },
  // GET route for rendering new event form
  new: (req, res) => {
    res.render("events/new");
  },
  // POST route for creating a new event
  create: (req, res, next) => {
    if (req.skip) return next();
    let newEvent = new Event(getEventParams(req.body, res));
    newEvent
      .save()
      .then((event) => {
        // If successful, redirect to events index page with success message
        req.flash("success", `${event.title} was posted successfully!`);
        res.locals.redirect = "/events";
        next();
      })
      .catch((error) => {
        // If error, redirect to new event form with error message
        req.flash("error", `Failed to post events because: ${error.message}.`);
        res.locals.redirect = "/events/new";
        next();
      });
  },
  // Middleware to handle redirect after POST requests
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  // GET route for displaying a single event
  show: (req, res, next) => {
    let eventId = req.params.id;
    Event.findById(eventId)
      .populate("organizer")
      .populate("attendees")
      .exec()
      .then((event) => {
        res.locals.event = event;
        next();
        // event now contains the requested event and its referenced organizer and attendees documents
      })
      .catch((error) => {
        console.log(`Error fetching Event by ID: ${error.message}`);
        next(error);
      });
  },
  // GET route for rendering single event page
  showView: (req, res) => {
    res.render("events/show");
  },

  // GET route for rendering event edit form
  edit: (req, res, next) => {
    let eventId = req.params.id;
    Event.findById(eventId)
      .then((event) => {
        // Check if current user is organizer of the event
          checkHasAuthorization(res, event, req)
            res.render("events/edit", {
              event: event,
            });
      })
      .catch((error) => {
        console.log(`Error fetching Event by ID: ${error.message}`);
        next(error);
      });
  },
  // POST route to update the event
  update: (req, res, next) => {
    let eventId = req.params.id,
      eventParams = getEventParams(req.body, res);
    Event.findByIdAndUpdate(eventId, {
      $set: eventParams,
    })
      .then((event) => {
        res.locals.redirect = `/events/${eventId}`;
        res.locals.event = event;
        req.flash("success", `${event.title} was updated successfully!`);
        next();
      })
      .catch((error) => {
        console.log(`Error updating Event by ID: ${error.message}`);
        next(error);
      });
  },
  // POST route to register a event
  register: (req, res, next) => {
    let eventId = req.params.id;
    Event.findOneAndUpdate(
      { _id: eventId },
      { $addToSet: { attendees: res.locals.currentUser } }
    )
      .then((event) => {
        // if success, redirect to individual event page
        res.locals.redirect = `/events/${eventId}`;
        res.locals.event = event;
        req.flash("success", `You registered ${event.title} successfully!`);
        next();
      })
      .catch((error) => {
        req.flash("error", `Failed to register events because: ${error.message}.`);
        console.log(`Error registering Event by ID: ${error.message}`);
        next(error);
      });
  },
  // DELETE route to delete a event
  delete: (req, res, next) => {
    let eventId = req.params.id;
    Event.findById(eventId)
      .then((event) => {
        // check if user is the organizer of the event
        checkHasAuthorization(res, event, req);
        if (!req.skip) {
        Event.findByIdAndRemove(eventId)
          .then(() => {
            res.locals.redirect = "/events";
            req.flash("success", `${event.title} was deleted successfully!`);
            next();
          })
          .catch((error) => {
            console.log(`Error deleting Event by ID: ${error.message}`);
            req.flash("error", `Failed to delete events because: ${error.message}.`);
            next();
          });
        }
      })
      .catch((error) => {
        req.flash("error", `Failed to delete events because: ${error.message}.`);
        console.log(`Error fetching Event by ID: ${error.message}`);
        next(error);
      });
  },
  // validate the input form
  validate: (req, res, next) => {
    // check if user is logged in
    // if (!res.locals.loggedIn) {
    //   // if not, redirect to login page with error message
    //   let messages = "You need to login to post a event";
    //   req.skip = true;
    //   req.flash("error", messages);
    //   res.locals.redirect = "/users/login";
    //   next();
    // }
    req.check("title", "Title cannot be empty").notEmpty();
    req.check("location", "Location cannot be empty").notEmpty();
    req.check("description", "Description can not be empty").notEmpty();
    req.check("startDate", "Start Date cannot be empty").notEmpty();
    req.check("endDate", "End Date cannot be empty").notEmpty();
    req.getValidationResult().then((error) => {
      if (!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages);
        res.locals.redirect = "/events/new";
        next();
      } else {
        next();
      }
    });
  },
};