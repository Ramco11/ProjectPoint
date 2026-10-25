let projects = [
  {
    name: "Website Redesign",
    description: "Redesign company website",
    points: 120,
    status: "In Progress"
  },
  {
    name: "Mobile App",
    description: "Create a new mobile application",
    points: 90,
    status: "In Progress"
  },
  {
    name: "Marketing Campaign",
    description: "Launch social media campaign",
    points: 60,
    status: "Completed"
  }
];

const projectList = document.getElementById("projectList");
const searchInput = document.getElementById("searchInput");
const addProjectBtn = document.getElementById("addProjectBtn");

function displayProjects(projectArray) {

  projectList.innerHTML = "";

  projectArray.forEach(function(project) {

    const card = document.createElement("div");
    card.className = "project-card";

    const statusClass =
      project.status === "Completed"
        ? "completed"
        : "progress";

    card.innerHTML = `
      <h3>${project.name}</h3>

      <p>${project.description}</p>

      <span class="points">
        ${project.points} Points
      </span>

      <div class="status ${statusClass}">
        ${project.status}
      </div>
    `;

    projectList.appendChild(card);
  });

  updateStats();
}

function updateStats() {

  document.getElementById("totalProjects").textContent =
    projects.length;

  const completedProjects = projects.filter(
    project => project.status === "Completed"
  ).length;

  const progressProjects = projects.filter(
    project => project.status === "In Progress"
  ).length;

  const totalPoints = projects.reduce(
    (total, project) => total + project.points,
    0
  );

  document.getElementById("completed").textContent =
    completedProjects;

  document.getElementById("inProgress").textContent =
    progressProjects;

  document.getElementById("totalPoints").textContent =
    totalPoints;
}

/* Search Projects */

searchInput.addEventListener("input", function() {

  const search = searchInput.value.toLowerCase();

  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(search)
  );

  displayProjects(filteredProjects);
});

/* Add New Project */

addProjectBtn.addEventListener("click", function() {

  const name = prompt("Enter project name:");

  if (!name) {
    return;
  }

  const description = prompt(
    "Enter project description:"
  );

  const pointsInput = prompt(
    "Enter project points:"
  );

  const points = Number(pointsInput);

  projects.push({
    name: name,
    description: description || "No description",
    points: Number.isFinite(points) ? points : 0,
    status: "In Progress"
  });

  displayProjects(projects);
});

/* Start App */

displayProjects(projects);