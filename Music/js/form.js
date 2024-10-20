emailjs.init("lgpDL8FflToF6UuYU"); // Initialize EmailJS with your public key

function sendEmail(yourName, songTitle, artist, yourEmail, message) {
  emailjs.send("service_cnvsnja", "template_ycfvacl", {
    yourName: yourName,
    songTitle: songTitle,
    artist: artist,
    yourEmail: yourEmail,
    message: message
  }).then(function(response) {
    console.log("Email sent successfully", response);
    alert("Thank you! Your song request has been submitted. 😘");
    window.location.href = "index.html";
  }, function(error) {
    console.error("Email sending failed", error);
    alert("Sorry, there was an error submitting your song request. Please try again later.");
  });
}

function submitForm(event) {
  event.preventDefault(); // Prevent form submission

  // Get form values
  var yourName = document.getElementById("yourName").value;
  var songTitle = document.getElementById("songTitle").value;
  var artist = document.getElementById("artist").value;
  var yourEmail = document.getElementById("yourEmail").value;
  var message = document.getElementById("message").value;

  // Send email
  sendEmail(yourName, songTitle, artist, yourEmail, message);
}