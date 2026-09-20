const state = {
  chapters: [],
  topics: [],
  questions: [],
  answers: [],

  chapterLoaded: false,

  currentCourse: null,
  currentClass: null,
  currentSubject: null,
  currentChapterId: null,
  currentChapterName: null,
  currentTopicId: null,

  filters: {
    type: null,
    exam: null,
    year: null,
    ncert: false,
    exemplar: false,
    reference: false
  },

  currentPage: 1,
  questionsPerPage: 10,

  returnScrollY: 0
};


const $ = id =>
  document.getElementById(id);


const TYPES = [
  ["mcq", "MCQ"],
  ["vsaq", "VSAQ"],
  ["saq", "SAQ"],
  ["laq", "LAQ"],
  ["assertion-reason", "Assertion-Reason"],
  ["numerical", "Numerical"],
  ["case-study", "Case Study"],
  ["derivation", "Derivation"],
  ["diagram-based", "Diagram-Based"],
  ["conceptual", "Conceptual"],
  ["competency-based", "Competency Based"]
];


const EXAMS = [
  ["boards", "Boards"],
  ["neet", "NEET"],
  ["jee-main", "JEE Main"],
  ["jee-advanced", "JEE Advanced"],
  ["cuet", "CUET"],
  ["other", "Others"]
];


/*
  Show only one main view.
*/
function showOnly(id) {

  [
    "homeView",
    "courseView",
    "chapterView",
    "questionView"
  ].forEach(view => {

    const element = $(view);

    if (element) {
      element.classList.add("hidden");
    }

  });


  const target = $(id);

  if (target) {
    target.classList.remove("hidden");
  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/*
  Load JSON file.
*/
async function loadJson(path) {

  const response =
    await fetch(path);

  if (!response.ok) {

    throw new Error(
      `Could not load ${path}`
    );

  }

  return response.json();
}
/*
  Load chapters.json for the selected
  course / class / subject.
*/
async function loadChapters(
  courseId,
  className,
  subject
) {

  let basePath;

  if (courseId === "cbse") {

    basePath =
      `data/cbse/class${className}/${subject}`;

  } else {

    basePath =
      `data/${courseId}/${subject}`;

  }

  const path =
    `${basePath}/chapters.json`;

  console.log(
    "Loading chapters:",
    path
  );

  const data =
    await loadJson(path);

  state.chapters =
    data.chapters || data;

  state.topics = [];
  state.questions = [];
  state.answers = [];

  state.chapterLoaded = false;

  state.currentChapterId = null;
  state.currentChapterName = null;
  state.currentTopicId = null;
}
/*
  Load the three JSON files belonging
  to the selected chapter.
*/
async function loadChapterData(
  courseId,
  className,
  subject,
  chapterName
) {
  state.chapterLoaded = false;
  let basePath;
  if (courseId === "cbse") {
    basePath =
      `data/cbse/class${className}/${subject}`;

  } else {

    basePath =
      `data/${courseId}/${subject}`;

  }


  /*
    Chapter folder uses the complete
    chapter name.

    Example:

    Ray Optics and Optical Instruments
  */
  const chapterPath =
    `${basePath}/${encodeURIComponent(
      chapterName
    )}`;


  const topicsPath =
    `${chapterPath}/topics.json`;

  const questionsPath =
    `${chapterPath}/questions.json`;

  const answersPath =
    `${chapterPath}/answers.json`;


  console.log(
    "--------------------------------"
  );

  console.log(
    "Loading chapter data"
  );

  console.log(
    "Course:",
    courseId
  );

  console.log(
    "Class:",
    className
  );

  console.log(
    "Subject:",
    subject
  );

  console.log(
    "Chapter:",
    chapterName
  );

  console.log(
    "Topics:",
    topicsPath
  );

  console.log(
    "Questions:",
    questionsPath
  );

  console.log(
    "Answers:",
    answersPath
  );


  try {

    const topicsData =
      await loadJson(
        topicsPath
      );


    const questionsData =
      await loadJson(
        questionsPath
      );


    const answersData =
      await loadJson(
        answersPath
      );


    state.topics =
      topicsData.topics ||
      topicsData;


    state.questions =
      questionsData.questions ||
      questionsData;


    state.answers =
      answersData.answers ||
      answersData;


    state.chapterLoaded = true;


    console.log(
      "Chapter loaded successfully."
    );

    console.log(
      "Topics:",
      state.topics.length
    );

    console.log(
      "Questions:",
      state.questions.length
    );

    console.log(
      "Answers:",
      state.answers.length
    );

  } catch (error) {

    console.error(
      "Chapter loading failed:",
      error
    );

    throw error;
  }
}


/*
  Reset all filters.
*/
function resetFilters() {

  state.filters = {

    type: null,
    exam: null,
    year: null,
    ncert: false,
    exemplar: false,
    reference: false

  };


  state.currentTopicId = null;

  state.currentPage = 1;
}


/*
  Render question-type and exam filters.
*/
function renderFilterButtons() {

  $("typeFilters").innerHTML =
    TYPES
      .map(item => {

        const active =
          state.filters.type ===
          item[0]
            ? "active"
            : "";


        return `
          <button
            type="button"
            class="filter-chip ${active}"
            data-type="${esc(item[0])}">
            ${esc(item[1])}
          </button>
        `;

      })
      .join("");


  $("examFilters").innerHTML =
    EXAMS
      .map(item => {

        const active =
          state.filters.exam ===
          item[0]
            ? "active"
            : "";


        return `
          <button
            type="button"
            class="filter-chip ${active}"
            data-exam="${esc(item[0])}">
            ${esc(item[1])}
          </button>
        `;

      })
      .join("");


  /*
    Type buttons.
  */
  document
    .querySelectorAll(
      "[data-type]"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();


          state.filters.type =
            state.filters.type ===
            button.dataset.type
              ? null
              : button.dataset.type;


          state.currentPage = 1;


          renderResults();

        };

    });


  /*
    Exam buttons.
  */
  document
    .querySelectorAll(
      "[data-exam]"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();


          state.filters.exam =
            state.filters.exam ===
            button.dataset.exam
              ? null
              : button.dataset.exam;


          state.currentPage = 1;


          renderResults();

        };

    });
}


/*
  Render year filters based on
  questions in the current chapter.
*/
function renderYears() {

  const years = [
    ...new Set(
      state.questions
        .map(q => q.year)
        .filter(
          year =>
            year !== null &&
            year !== undefined &&
            year !== ""
        )
    )
  ].sort((a, b) => b - a);


  if (years.length === 0) {

    $("yearFilters").innerHTML =
      `<span class="muted">
        No years available
      </span>`;

    return;
  }


  $("yearFilters").innerHTML =
    years
      .map(year => {

        const active =
          String(state.filters.year) ===
          String(year)
            ? "active"
            : "";

        return `
          <button
            type="button"
            class="filter-chip ${active}"
            data-year="${esc(year)}">

            ${esc(year)}

          </button>
        `;

      })
      .join("");


  document
    .querySelectorAll("[data-year]")
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();

          state.filters.year =
            String(state.filters.year) ===
            button.dataset.year
              ? null
              : button.dataset.year;

          state.currentPage = 1;

          renderResults();

        };

    });
}


/*
  Get questions matching filters.
*/
function getResults() {

  return state.questions.filter(
    question =>

      (
        !state.currentTopicId ||
        question.topic ===
        state.currentTopicId
      )

      &&

      (
        !state.filters.type ||
        question.type ===
        state.filters.type
      )

      &&

      (
        !state.filters.exam ||
        question.exam ===
        state.filters.exam
      )

      &&

      (
        !state.filters.year ||
        String(question.year) ===
        String(state.filters.year)
      )

      &&

      (
        !state.filters.ncert ||
        question.ncert === true
      )

      &&

      (!state.filters.reference || question.reference === true)

      &&

      (!state.filters.exemplar || question.exemplar === true)


  );
}

/*
  Render the question results area.
*/
function renderResults() {

  /*
    Do not render anything until the chapter
    data has loaded successfully.
  */
  if (!state.chapterLoaded) {

    $("typeFilters").innerHTML = "";
    $("examFilters").innerHTML = "";
    $("yearFilters").innerHTML = "";

    $("chapterResults")
      .classList
      .add("hidden");

    return;
  }


  /*
    Render all filter buttons.
  */
  renderFilterButtons();

  renderYears();


  /*
    Question Type is OPTIONAL.
    Therefore, we do NOT stop here when
    no type is selected.
  */


  /*
    Hide the instruction message because
    questions are now shown by default.
  */
  $("filterMessage")
    .classList
    .add("hidden");


  /*
    Always show the question results.
  */
  $("chapterResults")
    .classList
    .remove("hidden");


  /*
    Get questions according to the currently
    selected filters.

    If no filters are selected,
    getResults() returns ALL questions.
  */
  const results =
    getResults();


  /*
    Result count.
  */
  $("resultsCount").textContent =
    `${results.length} question${
      results.length === 1
        ? ""
        : "s"
    } found`;


  /*
    Active filter labels.
  */
  const activeFilters = [];


  if (state.filters.type) {

    const type =
      TYPES.find(
        item =>
          item[0] ===
          state.filters.type
      );


    if (type) {

      activeFilters.push(
        type[1]
      );

    }

  }


  if (state.filters.exam) {

    const examName =
      EXAMS.find(
        item =>
          item[0] ===
          state.filters.exam
      );


    if (examName) {

      activeFilters.push(
        examName[1]
      );

    }

  }


  if (state.filters.year) {

    activeFilters.push(
      state.filters.year
    );

  }


  if (state.filters.ncert) {

    activeFilters.push(
      "NCERT"
    );

  }

  if (state.filters.exemplar) {

    activeFilters.push(
      "EXEMPLAR"
    );

  }

  if (state.filters.reference) {

    activeFilters.push(
      "REFERENCE"
    );

  }


  $("activeFilters").innerHTML =
    activeFilters
      .map(
        item =>
          `<span class="active-filter">
            ${esc(item)}
          </span>`
      )
      .join("");


  /*
    Pagination.
  */
  const pages =
    Math.ceil(
      results.length /
      state.questionsPerPage
    );


  if (
    pages > 0 &&
    state.currentPage > pages
  ) {

    state.currentPage =
      pages;

  }


  /*
    If there are no pages, keep page 1.
  */
  if (pages === 0) {

    state.currentPage = 1;

  }


  const start =
    (
      state.currentPage - 1
    ) *
    state.questionsPerPage;


  const page =
    results.slice(
      start,
      start +
      state.questionsPerPage
    );


  /*
    Render questions.
  */
  $("questionList").innerHTML =
    page.length

      ? page
          .map(card)
          .join("")

      : `
          <div class="no-results">
            No questions match these criteria.
          </div>
        `;


  /*
    Render pagination.
  */
  pagination(
    results.length
  );


  /*
    Attach solution buttons.
  */
  document
    .querySelectorAll(
      "[data-question]"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();

          openQuestion(
            button.dataset.question
          );

        };

    });


  /*
    Render mathematical expressions.
  */
  if (window.MathJax) {

    MathJax
      .typesetPromise([
        $("questionList")
      ])
      .catch(() => {});

  }
}


/*
  Pagination.
*/
function pagination(total) {

  const pages =
    Math.ceil(
      total /
      state.questionsPerPage
    );


  if (pages <= 1) {

    $("paginationTop")
      .innerHTML = "";

    $("paginationBottom")
      .innerHTML = "";

    return;
  }


  const html = `

    <button
      type="button"
      class="page-button"
      data-page="${
        state.currentPage - 1
      }"
      ${
        state.currentPage === 1
          ? "disabled"
          : ""
      }>
      ← Previous
    </button>


    ${
      Array.from(
        { length: pages },
        (_, index) => {

          const pageNumber =
            index + 1;


          const active =
            pageNumber ===
            state.currentPage
              ? "active"
              : "";


          return `
            <button
              type="button"
              class="page-button ${active}"
              data-page="${pageNumber}">
              ${pageNumber}
            </button>
          `;

        }
      ).join("")
    }


    <button
      type="button"
      class="page-button"
      data-page="${
        state.currentPage + 1
      }"
      ${
        state.currentPage === pages
          ? "disabled"
          : ""
      }>
      Next →
    </button>

  `;


  $("paginationTop").innerHTML =
    html;

  $("paginationBottom").innerHTML =
    html;


  document
    .querySelectorAll(
      ".page-button:not([disabled])"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();


          state.currentPage =
            Number(
              button.dataset.page
            );


          renderResults();


          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        };

    });
}


/*
  Create a question card.
*/
function card(question) {

  const answer =
    state.answers.find(
      item =>
        item.id ===
        question.answerId
    );


  const topic =
    state.topics.find(
      item =>
        item.id ===
        question.topic
    );


  let source = "";


  if (question.ncert) {

    source = "NCERT";

  } 

  else if (question.exemplar) {

    source = "EXEMPLAR";

  }
  else if (question.reference) {

    source = "REFERENCE";

  }
  
  else if (
    question.pyq &&
    question.exam
  ) {

    source =
      `${exam(question.exam)}${
        question.year
          ? " " + question.year
          : ""
      } PYQ`;

  } 
  
  else if (
    question.exam
  ) {

    source =
      exam(question.exam);

  }


  return `

    <article
      class="question-card">


      <div
        class="question-meta">


        <span
          class="question-number">

          Q. ${esc(question.id)}

        </span>


        ${
          question.marks != null

            ? `
              <span class="meta">

                ${question.marks}
                Mark${
                  question.marks === 1
                    ? ""
                    : "s"
                }

              </span>
            `

            : ""
        }


        <span class="meta">

          ${esc(question.type)}

        </span>


        ${
          source

            ? `
              <span class="meta">

                ${esc(source)}

              </span>
            `

            : ""
        }


      </div>


      ${
        topic

          ? `
            <p class="muted">

              ${esc(topic.name)}

            </p>
          `

          : ""
      }


      <div
  class="question-preview">

  ${question.question || ""}


  ${
    question.image

      ? `
        <img
          src="${esc(
            question.image
          )}"
          alt="Question diagram">
      `

      : ""
  }


  ${
    question.type === "mcq" &&
    Array.isArray(question.options)

      ? `
        <div class="mcq-options ${
  question.options.every(option => option.length <= 20)
    ? "short-options"
    : question.options.some(option => option.length > 100)
      ? "long-options"
      : ""
}">

          ${question.options
            .map(
              (option, index) => `
                <div class="mcq-option">

                  <span class="option-label">
                    (${String.fromCharCode(97 + index)})
                  </span>

                  <span class="option-text">
                    ${option}
                  </span>

                </div>
              `
            )
            .join("")}

        </div>
      `

      : ""
  }

</div>


      ${
        answer

          ? `
            <button
              type="button"
              class="solution-button"
              data-question="${esc(
                question.id
              )}">

              View Solution →

            </button>
          `

          : ""
      }


    </article>

  `;
}


/*
  Open a complete question and solution.
*/
function openQuestion(id) {
  state.returnScrollY = window.scrollY;
  const question =
    state.questions.find(
      item =>
        item.id === id
    );


  if (!question) {

    return;
  }


  const answer =
    state.answers.find(
      item =>
        item.id ===
        question.answerId
    );


  const topic =
    state.topics.find(
      item =>
        item.id ===
        question.topic
    );


  let source = "";


  if (question.ncert) {

    source = "NCERT";

  } else if (
    question.pyq &&
    question.exam
  ) {

    source =
      `${exam(question.exam)}${
        question.year
          ? " · " + question.year
          : ""
      } PYQ`;

  } else if (
    question.exam
  ) {

    source =
      exam(question.exam);

  }


  $("questionDetail").innerHTML = `

    <p class="eyebrow">

      QUESTION

    </p>


    <h1>

      ${esc(question.id)}

    </h1>


    <div
      class="question-meta">


      ${
        topic

          ? `
            <span class="meta">

              ${esc(topic.name)}

            </span>
          `

          : ""
      }


      ${
        question.marks != null

          ? `
            <span class="meta">

              ${question.marks}

              Mark${
                question.marks === 1
                  ? ""
                  : "s"
              }

            </span>
          `

          : ""
      }


      <span class="meta">

        ${esc(question.type)}

      </span>


      ${
        source

          ? `
            <span class="meta">

              ${esc(source)}

            </span>
          `

          : ""
      }


    </div>


    <div
      class="question-preview">


      ${question.question || ""}


      ${
        question.image

          ? `
            <img
              src="${esc(
                question.image
              )}"
              alt="Question diagram">
          `

          : ""
      }


    </div>


    ${
      answer

        ? `
          <section
            class="solution">

            <h2>
              Solution
            </h2>

            <div>
              ${answer.solution || ""}
            </div>

          </section>
        `

        : `
          <p class="muted">
            Solution not available.
          </p>
        `
    }

  `;


  showOnly(
    "questionView"
  );


  if (window.MathJax) {

    MathJax
      .typesetPromise([
        $("questionDetail")
      ])
      .catch(() => {});

  }
}


/*
  Render chapter list.
*/
function renderChapters() {

  const search =
    $("chapterSearch")
      .value
      .trim()
      .toLowerCase();


  const chapters =
    state.chapters.filter(
      chapter =>

        chapter.name
          .toLowerCase()
          .includes(search)

    );


  $("chapterCount").textContent =
    `${chapters.length} chapter${
      chapters.length === 1
        ? ""
        : "s"
    }`;


  $("chapterList").innerHTML =
    chapters.length

      ? chapters
          .map(
            chapter => `

              <button
                type="button"
                class="chapter-button"
                data-chapter="${esc(
                  chapter.id
                )}">

                <span>

                  ${esc(
                    chapter.name
                  )}

                </span>

                <span>
                  →
                </span>

              </button>

            `
          )
          .join("")

      : `

          <div class="no-results">

            No chapters found.

          </div>

        `;


  /*
    Attach click handlers AFTER
    the buttons have been created.
  */
  document
    .querySelectorAll(
      "[data-chapter]"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();


          openChapter(
            button.dataset.chapter
          );

        };

    });
}
/*
  Topic search and topic selection.
*/
function renderTopics(value) {

  if (!state.chapterLoaded) {

    return;
  }


  const search =
    value
      .trim()
      .toLowerCase();


  const topics =
    state.topics.filter(
      topic =>

        !search ||

        topic.name
          .toLowerCase()
          .includes(search)

    );


  $("topicSuggestions").innerHTML =
    topics.length

      ? topics
          .map(
            topic => `

              <button
                type="button"
                class="suggestion"
                data-topic="${esc(
                  topic.id
                )}">

                ${esc(
                  topic.name
                )}

              </button>

            `
          )
          .join("")

      : `

          <div class="suggestion">

            No topic found.

          </div>

        `;


  $("topicSuggestions")
    .classList
    .remove("hidden");


  document
    .querySelectorAll(
      "[data-topic]"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();


          const topic =
            state.topics.find(
              item =>
                item.id ===
                button.dataset.topic
            );


          if (!topic) {

            return;
          }


          state.currentTopicId =
            topic.id;


          state.currentPage =
            1;


          $("topicSearch").value =
            topic.name;


          $("topicSuggestions")
            .classList
            .add("hidden");


          $("selectedTopic")
            .textContent =
            `Topic: ${topic.name}`;


          $("selectedTopic")
            .classList
            .remove("hidden");


          renderResults();

        };

    });
}


/*
  Open a course.
*/
function openCourse(courseId) {

  state.currentCourse =
    courseId;


  $("courseTitle").textContent =
    course(courseId);


  $("courseDescription")
    .textContent =
    courseId === "cbse"

      ? "Select class and subject."

      : "This path is prepared for future content.";


  /*
    Reset selectors.
  */
  $("classSelect").value =
    "";

  $("subjectSelect").value =
    "";


  state.currentClass =
    null;

  state.currentSubject =
    null;


  state.chapters = [];
  state.topics = [];
  state.questions = [];
  state.answers = [];

  state.chapterLoaded =
    false;


  resetFilters();


  $("chapterList").innerHTML =
    "";

  $("chapterCount").textContent =
    "";

  $("chapterSearch").value =
    "";


  showOnly(
    "courseView"
  );
}


/*
  Open a chapter.
*/
async function openChapter(id) {

  const chapter =
    state.chapters.find(
      item =>
        item.id === id
    );


  if (!chapter) {

    console.error(
      "Chapter not found:",
      id
    );

    return;
  }


  state.currentChapterId =
    chapter.id;


  state.currentChapterName =
    chapter.name;


  resetFilters();


  $("chapterTitle")
    .textContent =
    chapter.name;


  $("chapterDescription")
    .textContent =
    "Search a topic and select a question type to view questions.";


  $("topicSearch").value =
    "";


  $("selectedTopic")
    .classList
    .add("hidden");


  $("ncertFilter")
    .checked =
    false;

    $("exemplarFilter")
    .checked =
    false;

  $("referenceFilter")
    .checked =
    false;


  /*
    Clear previous chapter data.
  */
  state.topics = [];
  state.questions = [];
  state.answers = [];

  state.chapterLoaded =
    false;


  /*
    Clear old filter controls.
  */
  $("typeFilters").innerHTML =
    "";

  $("examFilters").innerHTML =
    "";

  $("yearFilters").innerHTML =
    "";


  $("chapterResults")
    .classList
    .add("hidden");


  $("filterMessage")
    .textContent =
    "Loading chapter data...";


  $("filterMessage")
    .classList
    .remove("hidden");


  showOnly(
    "chapterView"
  );


  try {

    await loadChapterData(

      state.currentCourse,

      state.currentClass,

      state.currentSubject,

      chapter.name

    );


    /*
      Only after successful loading
      do we render the filters.
    */
    renderResults();


  } catch (error) {

    console.error(
      "Could not load chapter data:",
      error
    );


    $("filterMessage")
      .textContent =
      `Could not load chapter data.
       ${error.message}`;


    $("filterMessage")
      .classList
      .remove("hidden");


    $("chapterResults")
      .classList
      .add("hidden");
  }
}


/*
  Course names.
*/
function course(c) {

  return {

    cbse:
      "CBSE Academics",

    ssc:
      "SSC",

    neet:
      "NEET",

    jee:
      "JEE",

    cuet:
      "CUET",

    railway:
      "Railway"

  }[c] || c;
}


/*
  Exam names.
*/
function exam(e) {

  return {

    boards:
      "Boards",

    neet:
      "NEET",

    "jee-main":
      "JEE Main",

    "jee-advanced":
      "JEE Advanced",

    cuet:
      "CUET",

    other:
      "Other"

  }[e] || e;
}


/*
  Escape HTML.
*/
function esc(value) {

  return String(
    value ?? ""
  )

    .replace(
      /[&<>"']/g,

      character => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      }[character])

    );
}


/*
  Load chapters after both
  class and subject are selected.
*/
async function loadSelectedSubject() {

  const className =
    $("classSelect").value;


  const subject =
    $("subjectSelect").value;


  if (
    !className ||
    !subject
  ) {

    return;
  }


  state.currentClass =
    className;


  state.currentSubject =
    subject;


  state.chapterLoaded =
    false;


  /*
    Clear previous subject data.
  */
  state.chapters = [];

  state.topics = [];
  state.questions = [];
  state.answers = [];

  state.currentChapterId = null;
  state.currentChapterName = null;
  state.currentTopicId = null;


  /*
    Clear previous chapter list from the screen.
  */
  $("chapterList")
    .innerHTML = "";

  $("chapterCount")
    .textContent = "";


  try {

    await loadChapters(

      state.currentCourse,

      className,

      subject

    );


    renderChapters();


  } catch (error) {

    console.error(
      "Could not load chapters:",
      error
    );


    /*
      Make absolutely sure old chapters
      cannot remain after a failed load.
    */
    state.chapters = [];


    $("chapterList")
      .innerHTML = `

        <div class="no-results">

          No chapters available for
          ${esc(subject)}.

        </div>

      `;


    $("chapterCount")
      .textContent =
      "0 chapters";

  }
}


/*
  Initialize application.
*/
async function init() {


  /*
    Theme toggle.
  */
  $("themeToggle").onclick =
    event => {

      event.preventDefault();

      document.body
        .classList
        .toggle("dark");

    };


  /*
    Back to home.
  */
  $("backHome").onclick =
    event => {

      event.preventDefault();

      showOnly(
        "homeView"
      );

    };


  /*
    Back to course.
  */
  $("backToCourse").onclick =
    event => {

      event.preventDefault();

      showOnly(
        "courseView"
      );

    };


  /*
    Back to question results.
  */
$("backToResults").onclick =
    event => {

      event.preventDefault();

      showOnly(
        "chapterView"
      );

      requestAnimationFrame(() => {

        window.scrollTo({
          top: state.returnScrollY,
          behavior: "auto"
        });

      });

    };


  /*
    Course cards.
  */
  document
    .querySelectorAll(
      "[data-course]"
    )
    .forEach(button => {

      button.onclick =
        event => {

          event.preventDefault();


          openCourse(
            button.dataset.course
          );

        };

    });


  /*
    Class selector.
  */
  $("classSelect")
    .onchange =
    loadSelectedSubject;


  /*
    Subject selector.
  */
  $("subjectSelect")
    .onchange =
    loadSelectedSubject;


  /*
    Chapter search.
  */
  $("chapterSearch")
    .oninput =
    renderChapters;


  /*
    Topic search.
  */
  $("topicSearch")
    .onfocus =
    () => {

      renderTopics(
        $("topicSearch").value
      );

    };


  $("topicSearch")
    .oninput =
    event => {

      renderTopics(
        event.target.value
      );

    };


  /*
    NCERT checkbox.
  */
  $("ncertFilter").onchange = event => {

      if (
        !state.chapterLoaded
      ) {

        event.target.checked =
          false;

        return;
      }


      state.filters.ncert =
        event.target.checked;


      state.currentPage =
        1;


      renderResults();

    };

  /*
    EXEMPLAR checkbox.
  */
  $("exemplarFilter").onchange = event => {

      if (
        !state.chapterLoaded
      ) {

        event.target.checked =
          false;

        return;
      }


      state.filters.exemplar =
        event.target.checked;


      state.currentPage =
        1;


      renderResults();

    };

  /*
    REFERENCE checkbox.
  */
  $("referenceFilter").onchange = event => {

      if (
        !state.chapterLoaded
      ) {

        event.target.checked =
          false;

        return;
      }


      state.filters.reference =
        event.target.checked;


      state.currentPage =
        1;


      renderResults();

    };


  /*
    Clear filters.
  */
  $("clearFilters")
    .onclick =
    event => {

      event.preventDefault();


      if (
        !state.chapterLoaded
      ) {

        return;
      }


      resetFilters();


      $("topicSearch")
        .value =
        "";


      $("selectedTopic")
        .classList
        .add("hidden");


      $("ncertFilter")
        .checked =
        false;

      $("exemplarFilter")
        .checked =
        false;

      $("referenceFilter")
        .checked =
        false;


      renderResults();

    };

  /*
    Close topic suggestions
    when clicking elsewhere.
  */
  document.addEventListener(
    "click",
    event => {

      if (
        !event.target.closest(
          ".topic-search-wrapper"
        )
      ) {

        $("topicSuggestions")
          .classList
          .add("hidden");

      }

    }
  );

  /*
    Start at home.
  */
  showOnly(
    "homeView"
  );
}

/*
  Start Questora.
*/
console.log(
  "Questora app.js loaded"
);

init();
