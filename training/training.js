"use strict";

const courses = [
    {
        id: "soil",
        icon: "🌍",
        level: "Beginner",
        title: "Healthy Soil Preparation",
        description:
            "Understand soil structure, testing and organic matter.",
        content: `
            <h3>Check the soil</h3>
            <p>
                Review drainage, texture and previous crop history.
                A laboratory soil test gives better information about
                pH and nutrient conditions.
            </p>

            <h3>Improve organic matter</h3>
            <ul>
                <li>Add mature compost.</li>
                <li>Use suitable cover crops.</li>
                <li>Avoid repeated unnecessary tillage.</li>
                <li>Protect the soil from erosion.</li>
            </ul>
        `
    },
    {
        id: "compost",
        icon: "♻️",
        level: "Beginner",
        title: "Compost Making",
        description:
            "Learn how to combine green and dry farm materials.",
        content: `
            <h3>Basic materials</h3>
            <p>
                Combine nitrogen-rich green material with dry
                carbon-rich material. Maintain moisture without
                making the pile waterlogged.
            </p>

            <h3>Good practice</h3>
            <ul>
                <li>Turn the pile periodically.</li>
                <li>Keep airflow through the material.</li>
                <li>Do not use contaminated waste.</li>
                <li>Use compost only after it has matured.</li>
            </ul>
        `
    },
    {
        id: "vermicompost",
        icon: "🪱",
        level: "Intermediate",
        title: "Vermicomposting",
        description:
            "Use suitable earthworms to process organic material.",
        content: `
            <h3>Vermicompost bed</h3>
            <p>
                Place the bed in a shaded, protected and well-drained
                location. Keep the material moist but not flooded.
            </p>

            <h3>Important precautions</h3>
            <ul>
                <li>Avoid excessive heat.</li>
                <li>Do not add pesticide-contaminated material.</li>
                <li>Protect the bed from ants and predators.</li>
            </ul>
        `
    },
    {
        id: "pest",
        icon: "🐞",
        level: "Intermediate",
        title: "Natural Pest Management",
        description:
            "Monitor pests and use preventive controls first.",
        content: `
            <h3>Integrated approach</h3>
            <p>
                Correctly identify the pest before selecting a
                treatment. One damaged leaf does not always indicate
                a serious infestation.
            </p>

            <ul>
                <li>Use crop rotation.</li>
                <li>Remove infected plant waste.</li>
                <li>Use traps where appropriate.</li>
                <li>Protect beneficial insects.</li>
            </ul>
        `
    },
    {
        id: "water",
        icon: "💧",
        level: "Intermediate",
        title: "Efficient Irrigation",
        description:
            "Reduce water waste and protect roots from saturation.",
        content: `
            <h3>Water based on crop need</h3>
            <p>
                Check moisture below the soil surface. Irrigation
                frequency depends on crop, soil, weather and growth
                stage.
            </p>

            <ul>
                <li>Water early in the morning.</li>
                <li>Repair leaks promptly.</li>
                <li>Use mulch to reduce evaporation.</li>
                <li>Consider drip irrigation.</li>
            </ul>
        `
    },
    {
        id: "rotation",
        icon: "🔄",
        level: "Advanced",
        title: "Crop Rotation",
        description:
            "Plan different crop families across growing seasons.",
        content: `
            <h3>Why rotate crops?</h3>
            <p>
                Rotation can interrupt pest cycles, improve soil use
                and reduce repeated demand for the same nutrients.
            </p>

            <ul>
                <li>Record crops by field and season.</li>
                <li>Avoid repeating the same crop family.</li>
                <li>Include legumes where suitable.</li>
                <li>Plan rotations before purchasing seeds.</li>
            </ul>
        `
    }
];

const courseGrid = document.getElementById("courseGrid");
const lessonModal = document.getElementById("lessonModal");
const lessonTitle = document.getElementById("lessonTitle");
const lessonContent = document.getElementById("lessonContent");
const closeLessonModal = document.getElementById(
    "closeLessonModal"
);

const completeLessonButton = document.getElementById(
    "completeLessonButton"
);

const completedCount = document.getElementById("completedCount");
const progressFill = document.getElementById("progressFill");

let activeCourseId = "";

function getCompletedCourses() {
    try {
        return JSON.parse(
            localStorage.getItem("farmsetu-completed-courses") || "[]"
        );
    } catch (error) {
        return [];
    }
}

function updateProgress() {
    const completed = getCompletedCourses();
    const percentage = Math.round(
        (completed.length / courses.length) * 100
    );

    completedCount.textContent =
        `${completed.length} of ${courses.length} lessons`;

    progressFill.style.width = `${percentage}%`;
}

function renderCourses() {
    const completed = getCompletedCourses();

    courseGrid.innerHTML = "";

    courses.forEach(function (course) {
        const isCompleted = completed.includes(course.id);
        const card = document.createElement("article");

        card.className =
            `course-card${isCompleted ? " completed" : ""}`;

        card.innerHTML = `
            <div class="course-icon">${course.icon}</div>
            <span class="course-level">${course.level}</span>
            <h2>${course.title}</h2>
            <p>${course.description}</p>

            <button type="button">
                ${isCompleted ? "✓ Review Lesson" : "Start Lesson"}
            </button>
        `;

        card.querySelector("button").addEventListener(
            "click",
            function () {
                activeCourseId = course.id;
                lessonTitle.textContent = course.title;
                lessonContent.innerHTML = course.content;

                completeLessonButton.textContent = isCompleted
                    ? "Lesson Completed"
                    : "Mark as Completed";

                lessonModal.classList.add("show");
                document.body.classList.add("modal-open");
            }
        );

        courseGrid.appendChild(card);
    });

    updateProgress();
}

closeLessonModal.addEventListener("click", function () {
    lessonModal.classList.remove("show");
    document.body.classList.remove("modal-open");
});

lessonModal.addEventListener("click", function (event) {
    if (event.target === lessonModal) {
        lessonModal.classList.remove("show");
        document.body.classList.remove("modal-open");
    }
});

completeLessonButton.addEventListener("click", function () {
    if (!activeCourseId) {
        return;
    }

    const completed = getCompletedCourses();

    if (!completed.includes(activeCourseId)) {
        completed.push(activeCourseId);

        localStorage.setItem(
            "farmsetu-completed-courses",
            JSON.stringify(completed)
        );
    }

    lessonModal.classList.remove("show");
    document.body.classList.remove("modal-open");

    renderCourses();
});

renderCourses();