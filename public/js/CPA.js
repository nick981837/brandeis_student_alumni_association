$(document).ready(() => {
  let apiToken = $("#apiToken").text();
  // Click event handler for the modal button
  $("#modal-button").click(() => {
    $(".modal-body").html("");
    $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
      let data = results.data;
      if (!data || !data.events) return;
      data.events.forEach((event) => {
        // Loop through the events and append them to the modal body
        $(".modal-body").append(
          `<div>
          <span >
          Title:
          ${event.title}
          </span>
          <div >
          Description:
          ${event.description}
          </div>
          <button class="join-button btn btn-primary mt-3 mb-3" style="background-color: #5072A7;" data-id="${event._id}">Join</button>
          </div>`
        )
      });
    }).then(() => {
      addJoinButtonListener(apiToken);
    });
  });
});

// Function to handle join button click events
let addJoinButtonListener = (token) => {
  $(".join-button").click((event) => {
    let $button = $(event.target),
      eventId = $button.data("id");
      // Perform an AJAX request to join the event
    $.get(`/api/events/${eventId}/join?apiToken=${token}`, (results = {}) => {
      let data = results.data;
      if (data && data.success) {
        $button
          .text("Joined")
          .addClass("joined-button")
          .removeClass("join-button");
      } else {
        $button.text("Try again");
      }
    });
  });
};
// Initialize Socket.IO
const socket = io();
// Submit event handler for the chat form
$("#chatForm").submit(() => {
  let text = $("#chat-input").val(),
    userName = $("#chat-user-name").val(),
    userId = $("#chat-user-id").val();
  socket.emit("message", { content: text, userId: userId, userName: userName });
  $("#chat-input").val("");
  return false;
});
// Socket event handler for receiving new messages
socket.on("message", (message) => {
  displayMessage(message);
  for (let i = 0; i < 5; i++) {
    $(".chat-icon").fadeOut(200).fadeIn(200);
  }
});
// Socket event handler for loading all messages
socket.on("load all messages", (data) => {
  data.forEach((message) => {
    displayMessage(message);
  });
});
// Socket event handler for user disconnection
socket.on("user disconnected", () => {
  displayMessage({
    userName: "Notice",
    content: "User left the chat",
  });
});
// Function to display a chat message
let displayMessage = (message) => {
  $("#chat").prepend(
    $("<li>").html(
      `<strong class="message ${getCurrentUserClass(message.user)}">${
        message.userName
      }</strong> ${message.content}`
    )
  );
};
// Function to determine the CSS class for the current user's message
let getCurrentUserClass = (id) => {
  let userId = $("#chat-user-id").val();
  return userId === id ? "current-user" : "other-user";
};
