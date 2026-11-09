document.addEventListener("DOMContentLoaded", () => {

  const search = document.getElementById("homeSearch");

  search.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

      const query = search.value.trim();

      if (!query) {
        showToast("Type something to search");
        return;
      }

      window.location.href =
        "../marketplace/marketplace.html?search=" +
        encodeURIComponent(query);
    }
  });

  document
    .querySelector(".notification-btn")
    .addEventListener("click", () => {
      showToast("No new notifications");
    });

});

function showToast(message) {

  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}