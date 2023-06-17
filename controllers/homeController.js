module.exports = {
  chat: (req, res) => {
    res.render("common/chat");
  },
  // Renders the index page with the title "We Are Proud"
  index: (req, res) => {
    res.render("common/index", { title: "We Are Proud" });
  },
  // Renders the about page with the title "About Us"
  about: (req, res) => {
    res.render("common/about", { title: "About Us" });
  },
  // Renders the contact page with the title "Contact Us" and disable the thankYouMessage
  contact: (req, res) => {
    res.render("common/contact", { thankYouMessage: false, title: "Contact Us" });
  },
  // Renders the contact page with the title "Contact Us", and enable the thankYouMessage
  thank: (req, res) => {
    res.render("common/contact", {
      thankYouMessage: true,
      name: req.body.name,
      title: "Contact Us",
    });
  },
};