const router = require("express").Router();
const usersController = require("../controllers/usersController");

// Handle routes for user models
router.get("/", usersController.index, usersController.indexView);
router.get("/new", usersController.new);
router.post("/create", usersController.validate, usersController.create, usersController.authenticate, usersController.redirectView);
router.get("/login", usersController.login);
router.post(
  "/login",
  usersController.authenticate,
  usersController.redirectView
);
router.get(
  "/logout",
  usersController.logout,
  usersController.redirectView
);
router.get("/:id", usersController.show, usersController.showView);
router.get("/:id/edit", usersController.edit, usersController.redirectView);
router.put(
  "/:id/update",
  usersController.validate,
  usersController.update,
  usersController.redirectView
);
router.delete(
  "/:id/delete",
  usersController.delete,
  usersController.redirectView
);


module.exports = router;