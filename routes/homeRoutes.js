const router = require("express").Router();
const homeController = require("../controllers/homeController");
const utils = require("../public/util/util");
router.get("/", homeController.index);
router.get("/home", homeController.index);
router.get("/about", homeController.about);
router.get("/contact", homeController.contact);
router.post("/contact", homeController.thank);
router.get("/chat", utils.isAuthenticated, homeController.chat);

module.exports = router;