"use strict";

/* FarmSetu organic training — course catalogue + progress tracking */

document.addEventListener("DOMContentLoaded", () => {

  const { escapeHtml, readJson, writeJson } = FarmSetu;
  const PROGRESS_KEY = "farmsetu-course-progress";

  const courses = [
    {
      id: "compost", icon: "🌿", level: "Beginner", title: "Compost Making",
      summary: "Turn crop residue and farmyard manure into rich, stable compost.",
      lessons: [
        { title: "Why compost matters", minutes: 4, text: "Compost feeds soil life, improves structure and holds water. It releases nutrients slowly and reduces the need for bought-in inputs.", points: ["Improves soil structure and water holding", "Feeds beneficial microbes", "Recycles farm waste"] },
        { title: "Collecting the right materials", minutes: 6, text: "Good compost balances dry 'brown' material (straw, dry leaves, crop residue) with moist 'green' material (fresh weeds, vegetable waste, manure).", points: ["Roughly 2–3 parts brown to 1 part green", "Chop large stalks so they break down faster", "Avoid diseased plants, plastics and chemicals"] },
        { title: "Building the heap or pit", minutes: 7, text: "Build in layers on well-drained ground in a shaded spot. Start with coarse material at the base for airflow, then alternate brown and green layers.", points: ["A heap about 1–1.5 m high works well", "Sprinkle water between layers", "Cover with straw or a sack to hold moisture"] },
        { title: "Moisture and turning", minutes: 5, text: "The heap should feel like a squeezed-out sponge: damp but not dripping. Turn it every 2–3 weeks to add air and mix the outer material into the centre.", points: ["Too wet and smelly → add dry material and turn", "Too dry and slow → add water", "Heat in the middle shows microbes are active"] },
        { title: "Knowing when it's ready", minutes: 4, text: "Finished compost is dark, crumbly and smells earthy. Original materials are no longer recognisable. This usually takes about 2–4 months depending on conditions.", points: ["Apply before sowing or during bed preparation", "Mix lightly into the top soil layer", "Store spare compost under cover"] }
      ]
    },
    {
      id: "pest", icon: "🐛", level: "Beginner", title: "Natural Pest Control",
      summary: "Prevent and manage pests using field hygiene, traps and biological methods.",
      lessons: [
        { title: "Scout your field regularly", minutes: 5, text: "Walk the field at least twice a week and check the underside of leaves, growing tips and fruit. Early detection means simpler control.", points: ["Record what you see and where", "Check several spots, not just the edges", "Take a clear photo to compare over time"] },
        { title: "Identify before you treat", minutes: 5, text: "Many insects are harmless or even helpful. Identify the pest and the damage before acting. Ask your local agriculture officer if unsure.", points: ["Ladybirds and spiders eat pests", "Match damage type to the likely pest", "Don't spray on a guess"] },
        { title: "Traps and barriers", minutes: 6, text: "Yellow and blue sticky traps, pheromone traps and light traps reduce populations and show when pests arrive. Insect nets protect nurseries.", points: ["Place traps just above crop height", "Replace sticky cards when full", "Use nets over seedling beds"] },
        { title: "Botanical and biological options", minutes: 7, text: "Neem-based products and approved biological agents can help when pest numbers cross a threshold. Always follow the label and test on a few plants first.", points: ["Spray early morning or evening", "Never mix unknown preparations", "Keep records of what you applied"] }
      ]
    },
    {
      id: "soil", icon: "🌍", level: "Beginner", title: "Soil Health Basics",
      summary: "Understand your soil and build fertility over the seasons.",
      lessons: [
        { title: "Know your soil type", minutes: 5, text: "Sandy soils drain fast, clay soils hold water, loam balances both. A simple squeeze test tells you a lot about texture.", points: ["Squeeze a moist handful and see if it holds shape", "Note drainage after rain", "Get a lab soil test at least once a year"] },
        { title: "Organic matter is the foundation", minutes: 5, text: "Organic matter improves nutrient supply, water holding and soil life. Add compost, green manure and crop residue regularly.", points: ["Return crop residue where possible", "Grow green manure crops between seasons", "Avoid leaving soil bare"] },
        { title: "Reduce tillage", minutes: 4, text: "Excess ploughing breaks soil structure and dries the soil. Till only as much as the crop needs.", points: ["Keep soil covered with mulch", "Avoid working very wet soil", "Protect against erosion on slopes"] },
        { title: "Read your crops", minutes: 5, text: "Pale leaves, stunted growth or purple tints can hint at nutrient issues — but also water stress or disease. Combine observation with a soil test.", points: ["Compare affected and healthy plants", "Check roots before blaming nutrients", "Fix problems in the soil, not just the leaf"] }
      ]
    },
    {
      id: "rotation", icon: "🔄", level: "Intermediate", title: "Crop Rotation Planning",
      summary: "Plan rotations that break pest cycles and balance nutrients.",
      lessons: [
        { title: "Why rotate?", minutes: 4, text: "Growing the same crop repeatedly builds up pests and diseases and drains the same nutrients. Rotation breaks these cycles.", points: ["Different crops use different nutrients", "Pests lose their host", "Root types improve soil structure"] },
        { title: "Crop families", minutes: 6, text: "Rotate by plant family, not just by name. Do not follow a crop with another from the same family — for example tomato then brinjal (both nightshades).", points: ["Cereals, legumes, vegetables, oilseeds", "Include a legume to fix nitrogen", "Alternate deep and shallow rooted crops"] },
        { title: "Build a 3-season plan", minutes: 7, text: "A simple plan: heavy feeder (vegetable) → legume (chickpea) → cereal (wheat), then repeat. Adjust for your climate and market.", points: ["Draw a field map with plots", "Record each season's crop", "Review yields and problems yearly"] },
        { title: "Cover crops and gaps", minutes: 4, text: "Use short-duration green manure crops in gaps to protect soil and add organic matter.", points: ["Dhaincha and sunhemp are common green manures", "Incorporate before flowering", "Allow 2–3 weeks to decompose before sowing"] }
      ]
    },
    {
      id: "water", icon: "💧", level: "Intermediate", title: "Water & Drip Irrigation",
      summary: "Save water and improve yield with smarter irrigation.",
      lessons: [
        { title: "When to irrigate", minutes: 5, text: "Check soil moisture a hand-depth below the surface instead of watering on a fixed calendar. Crop stage matters: flowering and fruit set are sensitive.", points: ["Early morning is best", "Avoid constant saturation", "Mulch reduces evaporation"] },
        { title: "Drip system parts", minutes: 6, text: "A drip kit has a filter, mainline, laterals and emitters. Clean filters regularly to prevent clogging.", points: ["Match emitter spacing to crop spacing", "Check pressure at the far end", "Flush lines at the start of each season"] },
        { title: "Scheduling and fertigation", minutes: 6, text: "Short, frequent irrigations keep the root zone evenly moist. Soluble nutrients can be applied through drip, but only in amounts advised for the crop.", points: ["Follow local agronomy advice for doses", "Flush with clean water after fertigation", "Monitor for leaks weekly"] },
        { title: "Maintenance", minutes: 4, text: "Inspect for rodent damage, blocked emitters and UV-cracked tubing. A little regular care keeps a system working for years.", points: ["Keep spare emitters and connectors", "Cover and protect tanks", "Record water use per crop"] }
      ]
    },
    {
      id: "seeds", icon: "🌱", level: "Intermediate", title: "Seed Selection & Saving",
      summary: "Choose good seed and save your own where suitable.",
      lessons: [
        { title: "Choosing quality seed", minutes: 5, text: "Buy certified seed from a reputed source. Check the tag for variety, purity, germination percentage and date.", points: ["Keep the bill and the tag", "Match the variety to your season", "Avoid damaged or discoloured seed"] },
        { title: "Germination test at home", minutes: 5, text: "Place 20 seeds on a damp cloth, keep warm and count how many sprout in a few days. Low germination means sow thicker or change the lot.", points: ["Below ~70% is usually poor", "Repeat with a second sample", "Record the result"] },
        { title: "Saving your own seed", minutes: 6, text: "Open-pollinated varieties can be saved; hybrids do not breed true. Pick seed from the healthiest plants and dry thoroughly.", points: ["Label variety and year", "Store dry in airtight containers", "Keep away from direct sun and pests"] }
      ]
    }
  ];

  function getProgress() {
    const data = readJson(PROGRESS_KEY, {});
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  }

  function doneLessons(courseId) {
    const data = getProgress();
    if (Array.isArray(data[courseId])) return data[courseId];
    return courseId === "compost" ? [0, 1] : []; // demo: compost starts at 40%
  }

  function saveDone(courseId, list) {
    const data = getProgress();
    data[courseId] = list;
    writeJson(PROGRESS_KEY, data);
  }

  /* ---------------------------------------------- Course list page */

  const courseList = document.getElementById("courseList");

  if (courseList) {

    const search = document.getElementById("courseSearch");
    const none = document.getElementById("noCourses");
    let level = "All";

    function renderStats() {
      let lessons = 0, completed = 0;
      courses.forEach((c) => {
        const d = doneLessons(c.id).length;
        lessons += d;
        if (d >= c.lessons.length) completed++;
      });
      document.getElementById("statCourses").textContent = courses.length;
      document.getElementById("statLessons").textContent = lessons;
      document.getElementById("statComplete").textContent = completed;
    }

    function renderList() {
      const query = search.value.trim().toLowerCase();
      const visible = courses.filter((c) =>
        (level === "All" || c.level === level) &&
        (c.title + " " + c.summary).toLowerCase().includes(query));

      courseList.innerHTML = "";
      none.hidden = visible.length > 0;

      visible.forEach((c) => {
        const done = doneLessons(c.id).length;
        const percent = Math.round((done / c.lessons.length) * 100);
        const link = document.createElement("a");
        link.className = "course-card";
        link.href = "course.html?id=" + encodeURIComponent(c.id);
        link.innerHTML = `
          <div class="course-icon">${c.icon}</div>
          <div class="course-info">
            <small>${escapeHtml(c.level.toUpperCase())}</small>
            <b>${escapeHtml(c.title)}</b>
            <div class="progress"><span style="width:${percent}%"></span></div>
            <p>${done} of ${c.lessons.length} lessons · ${percent}% completed</p>
          </div>
          <span>›</span>`;
        courseList.appendChild(link);
      });
    }

    search.addEventListener("input", renderList);
    document.getElementById("levelChips").addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (!chip) return;
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      level = chip.dataset.level;
      renderList();
    });

    renderStats();
    renderList();
    return;
  }

  /* ---------------------------------------------- Single course page */

  const lessonList = document.getElementById("lessonList");
  if (!lessonList) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const course = courses.find((c) => c.id === id) || courses[0];

  document.title = "FarmSetu | " + course.title;
  document.getElementById("courseHeading").textContent = course.title;
  document.getElementById("courseIcon").textContent = course.icon;
  document.getElementById("courseLevel").textContent = course.level.toUpperCase();
  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("courseSummary").textContent = course.summary;

  let openIndex = Math.min(doneLessons(course.id).length, course.lessons.length - 1);

  function renderCourse() {
    const done = doneLessons(course.id);
    const percent = Math.round((done.length / course.lessons.length) * 100);

    document.getElementById("courseBar").style.width = percent + "%";
    document.getElementById("courseProgressText").textContent =
      done.length + " of " + course.lessons.length + " lessons completed (" + percent + "%)";

    lessonList.innerHTML = "";

    course.lessons.forEach((lesson, index) => {
      const isDone = done.includes(index);
      const item = document.createElement("article");
      item.className = "lesson" + (isDone ? " done" : "") + (index === openIndex ? " open" : "");
      item.innerHTML = `
        <button class="lesson-head" type="button" data-toggle="${index}">
          <span class="lesson-number">${isDone ? "✓" : index + 1}</span>
          <span><b>${escapeHtml(lesson.title)}</b><small>${lesson.minutes} min read</small></span>
          <span>${index === openIndex ? "▴" : "▾"}</span>
        </button>
        <div class="lesson-body">
          <p>${escapeHtml(lesson.text)}</p>
          <ul>${lesson.points.map((p) => "<li>" + escapeHtml(p) + "</li>").join("")}</ul>
          <button class="btn ${isDone ? "secondary" : ""}" type="button" data-complete="${index}">
            ${isDone ? "Mark as not done" : "Mark lesson complete"}
          </button>
        </div>`;
      lessonList.appendChild(item);
    });
  }

  lessonList.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle]");
    const complete = event.target.closest("[data-complete]");

    if (toggle) {
      const index = Number(toggle.dataset.toggle);
      openIndex = openIndex === index ? -1 : index;
      renderCourse();
      return;
    }

    if (complete) {
      const index = Number(complete.dataset.complete);
      let done = doneLessons(course.id).slice();
      if (done.includes(index)) {
        done = done.filter((i) => i !== index);
      } else {
        done.push(index);
        if (index + 1 < course.lessons.length) openIndex = index + 1;
      }
      saveDone(course.id, done);
      renderCourse();
      if (done.length === course.lessons.length) showToast("🎉 Course completed. Well done!");
    }
  });

  document.getElementById("resetCourse").addEventListener("click", () => {
    if (!window.confirm("Reset your progress for this course?")) return;
    saveDone(course.id, []);
    openIndex = 0;
    renderCourse();
    showToast("Progress reset");
  });

  renderCourse();
});