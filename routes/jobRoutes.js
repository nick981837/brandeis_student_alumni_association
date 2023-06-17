const router = require("express").Router();
const jobsController = require("../controllers/jobsController");
const utils = require("../public/util/util");
// Handle routes for job models
router.get("/", jobsController.index, jobsController.indexView);
router.get("/new", utils.isAuthenticated, jobsController.new)
router.post("/create", utils.isAuthenticated,  jobsController.validate, jobsController.create, jobsController.redirectView)
router.get("/:id", jobsController.show, jobsController.showView);
router.get("/:id/edit", utils.isAuthenticated, jobsController.edit);
router.put(
  "/:id/update",
  utils.isAuthenticated,
  jobsController.validate,
  jobsController.update,
  jobsController.redirectView
);
router.delete(
  "/:id/delete",
  utils.isAuthenticated,
  jobsController.delete,
  jobsController.redirectView
);


module.exports = router;