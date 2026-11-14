"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* Greeting by time of day */
  const hour = new Date().getHours();
  const greeting = document.getElementById("greeting");
  if (greeting) {
    greeting.textContent =
      (hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening") + " 👋";
  }

  /* Search → marketplace */
  const search = document.getElementById("homeSearch");
  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const query = search.value.trim();
    if (!query) {
      showToast("Type something to search");
      return;
    }
    window.location.href =
      "../marketplace/marketplace.html?search=" + encodeURIComponent(query);
  });

  /* Notifications */
  document.querySelector(".notification-btn").addEventListener("click", () => {
    showToast("No new notifications");
  });

  /* "Continue learning" reflects real course progress when available */
  const progress = FarmSetu.readJson("farmsetu-course-progress", {});
  const courses = { compost: { title: "Compost Making", lessons: 5 } };
  const done = Array.isArray(progress.compost) ? progress.compost.length : 2;
  const percent = Math.round((done / courses.compost.lessons) * 100);
  const bar = document.getElementById("continueBar");
  const text = document.getElementById("continueText");
  if (bar) bar.style.width = percent + "%";
  if (text) text.textContent = percent + "% completed";
});