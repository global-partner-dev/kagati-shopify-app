console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
  console.log("Push Recieved...", e);
  const data = e.data.json();

  console.log("Push Recieved...");


  self.registration.showNotification(data.title, {
    body: "Knock Knock",
    sound: 'https://res.cloudinary.com/djjovgwyk/video/upload/v1740160779/simple-alarm_zvmdh0.mp3',

  });
});