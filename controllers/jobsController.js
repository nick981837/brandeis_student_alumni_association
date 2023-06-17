const Job = require("../models/job");
// Function to get job parameters from request body and locals
const getJobParams = (body) => {
  return {
    title: body.title,
    company: body.company,
    location: body.location,
    description: body.description,
    requirements: body.requirements,
    salary: body.salary,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    postDate: body.postDate,
    deadlineDate: body.deadlineDate,
    isActive: body.isActive === "true" ? true : false,
  };
};
// Define route handlers
module.exports = {
  // GET route for displaying all jobs
  index: (req, res, next) => {
    Job.find({})
      .then((jobs) => {
        res.locals.jobs = jobs;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching jobss: ${error.message}`);
        next(error);
      });
  },
  // GET route for rendering jobs index page
  indexView: (req, res) => {
    res.render("jobs/index", { title: "Jobs" });
  },
  // GET route for rendering new job form
  new: (req, res) => {
    res.render("jobs/new");
  },
  // POST route for creating a new event
  create: (req, res, next) => {
    if (req.skip) return next();
    let newJob = new Job(getJobParams(req.body));
    newJob
      .save()
      .then((job) => {
        req.flash("success", `${job.title} was posted successfully!`);
        res.locals.redirect = "/jobs";
        next();
      })
      .catch((error) => {
        req.flash("error", `Failed to post jobs because: ${error.message}.`);
        res.locals.redirect = "/jobs/new";
        next();
      });
  },
  // Middleware to handle redirect after POST requests
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  // GET route for displaying a single job
  show: (req, res, next) => {
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },
  // GET route for rendering single job page
  showView: (req, res) => {
    res.render("jobs/show");
  },
  // GET route for rendering job edit form
  edit: (req, res, next) => {
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.render("jobs/edit", {
          job: job,
        });
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },
  // PUT route to update the job
  update: (req, res, next) => {
    let jobId = req.params.id,
      jobParams = getJobParams(req.body);
    Job.findByIdAndUpdate(jobId, {
      $set: jobParams,
    })
      .then((job) => {
        res.locals.redirect = `/jobs/${jobId}`;
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error updating job by ID: ${error.message}`);
        next(error);
      });
  },
  // DELETE route to delete a event
  delete: (req, res, next) => {
    let jobId = req.params.id;
    Job.findByIdAndRemove(jobId)
      .then(() => {
        res.locals.redirect = "/jobs";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting job by ID: ${error.message}`);
        next();
      });
  },
  // validate the form data
  validate: (req, res, next) => {
    if (!res.locals.loggedIn) {
      // if not, redirect to login page with error message
      let messages = "You need to login to post a job";
      req.skip = true;
      req.flash("error", messages);
      res.locals.redirect = "/users/login";
      next();
    }
    let jobId = req.params.id;
    req.check("title", "Title cannot be empty").notEmpty();
    req.check("company", "Company cannot be empty").notEmpty();
    req.check("location", "Location cannot be empty").notEmpty();
    req.check("description", "Description can not be empty").notEmpty();
    req.check("requirements", "Requirement cannot be empty").notEmpty();
    req.check("salary", "Salary should be numbers").isInt();
    req.check("salary", "Salary cannot be empty").notEmpty();
    req.check("contactEmail", "Contact Email cannot be empty").notEmpty();
    req.check("contactEmail", "Email is invalid").isEmail();
    req.check("contactPhone", "Contact Phone cannot be empty").notEmpty();
    req.check("deadlineDate", "Deadline Date cannot be empty").notEmpty();
    req.getValidationResult().then((error) => {
      if (!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages);
        if (req.method === "PUT") {
          res.redirect(`/jobs/${jobId}/edit`);
        }
        else {
          res.locals.redirect = "/jobs/new";
          next();
        }
      } else {
        next();
      }
    });
  },
};