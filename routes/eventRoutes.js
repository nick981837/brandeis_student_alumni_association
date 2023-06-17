const router = require("express").Router();
const eventsController = require("../controllers/eventsController")
const utils = require("../public/util/util");
// Handle routes for event models
router.get("/", eventsController.index, eventsController.indexView);
router.get("/new", utils.isAuthenticated, eventsController.new)
router.post("/create", utils.isAuthenticated, eventsController.validate, eventsController.create, eventsController.redirectView)
router.get("/:id", eventsController.show, eventsController.showView);
router.get("/:id/edit", utils.isAuthenticated, eventsController.edit);
router.get("/:id/join", utils.isAuthenticated, eventsController.join);
router.put(
  "/:id/update",
  utils.isAuthenticated,
  eventsController.update,
  eventsController.redirectView
);
router.put(
  "/:id/register",
  utils.isAuthenticated,
  eventsController.register,
  eventsController.redirectView
);
router.delete(
  "/:id/delete",
  eventsController.delete,
  eventsController.redirectView
);


module.exports = router;
