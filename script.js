const modal = document.querySelector("#bookingModal");
const form = document.querySelector("#bookingForm");
const stepLabel = document.querySelector("#stepLabel");
const modalTitle = document.querySelector("#modalTitle");
const statusNode = document.querySelector("#formStatus");
const calendarGrid = document.querySelector("#calendarGrid");
const timeGrid = document.querySelector("#timeGrid");
const slotHint = document.querySelector("#slotHint");
const summaryList = document.querySelector("#summaryList");
const backButton = document.querySelector("#backButton");
const nextButton = document.querySelector("#nextButton");
const submitButton = document.querySelector("#submitButton");
const successStep = document.querySelector("#successStep");
const successText = document.querySelector("#successText");
const mailLink = document.querySelector("#mailLink");
const progressItems = [...document.querySelectorAll(".modal-progress span")];
const stepPanels = [...document.querySelectorAll(".modal-step")];
const galleryLabel = document.querySelector("#galleryLabel");
const galleryButtons = [...document.querySelectorAll(".gallery-button")];

const state = {
  step: 0,
  date: "",
  time: ""
};

const titles = [
  "Выберите программу",
  "Выберите дату",
  "Выберите время",
  "Подтвердите бронь"
];

const dates = [
  { value: "2026-08-01", day: "1", label: "1 августа", weekday: "сб", available: true },
  { value: "2026-08-02", day: "2", label: "2 августа", weekday: "вс", available: true },
  { value: "2026-08-03", day: "3", label: "3 августа", weekday: "пн", available: false },
  { value: "2026-08-04", day: "4", label: "4 августа", weekday: "вт", available: true },
  { value: "2026-08-05", day: "5", label: "5 августа", weekday: "ср", available: true },
  { value: "2026-08-06", day: "6", label: "6 августа", weekday: "чт", available: false },
  { value: "2026-08-07", day: "7", label: "7 августа", weekday: "пт", available: true }
];

const slots = {
  "2026-08-01": [
    { time: "11:00", available: true },
    { time: "15:00", available: false },
    { time: "19:00", available: true }
  ],
  "2026-08-02": [
    { time: "10:00", available: false },
    { time: "14:00", available: true },
    { time: "18:00", available: true }
  ],
  "2026-08-04": [
    { time: "12:00", available: true },
    { time: "16:00", available: true },
    { time: "20:00", available: false }
  ],
  "2026-08-05": [
    { time: "13:00", available: true },
    { time: "17:00", available: true }
  ],
  "2026-08-07": [
    { time: "11:00", available: true },
    { time: "19:00", available: true }
  ]
};

const programPrices = {
  "Путь": "от 10 000 ₽",
  "Ресурс": "14 000 ₽",
  "Основа": "15 000 ₽",
  "Предел": "17 000 ₽"
};

function formData() {
  const data = new FormData(form);
  return {
    program: data.get("program") || "",
    guests: data.get("guests") || "4",
    occasion: data.get("occasion") || "Просто отдых",
    addons: data.getAll("addons"),
    name: data.get("name") || "",
    phone: data.get("phone") || "",
    comment: data.get("comment") || ""
  };
}

function selectedDate() {
  return dates.find((date) => date.value === state.date);
}

function updateSummary() {
  const data = formData();
  const rows = [
    ["Программа", data.program ? `${data.program}, ${programPrices[data.program]}` : "Не выбрана"],
    ["Дата", selectedDate()?.label || "Не выбрана"],
    ["Время", state.time || "Не выбрано"],
    ["Гости", data.guests],
    ["Формат", data.occasion],
    ["Процедуры", data.addons.length ? data.addons.join(", ") : "Без дополнений"]
  ];

  summaryList.innerHTML = rows
    .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`)
    .join("");
}

function renderCalendar() {
  const weekdayLabels = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]
    .map((day) => `<div class="calendar-label">${day}</div>`)
    .join("");
  const offset = '<div class="calendar-spacer"></div>'.repeat(5);
  const days = dates
    .map(
      (date) => `
        <button
          class="calendar-day ui-button ui-button--secondary t-control ${state.date === date.value ? "is-selected" : ""}"
          type="button"
          data-date="${date.value}"
          ${date.available ? "" : "disabled"}
        >
          <span>${date.day}</span>
          <small>${date.available ? "Доступно" : "Недоступно"}</small>
        </button>
      `
    )
    .join("");

  calendarGrid.innerHTML = weekdayLabels + offset + days;
}

function renderTimes() {
  const dateSlots = slots[state.date] || [];

  if (!state.date) {
    timeGrid.innerHTML = "";
    slotHint.textContent = "Сначала выберите дату.";
    return;
  }

  timeGrid.innerHTML = dateSlots
    .map(
      (slot) => `
        <button
          class="time-option ui-button ui-button--secondary t-control ${state.time === slot.time ? "is-selected" : ""}"
          type="button"
          data-time="${slot.time}"
          ${slot.available ? "" : "disabled"}
        >
          <span>${slot.time}</span>
          <small>${slot.available ? "Доступно" : "Недоступно"}</small>
        </button>
      `
    )
    .join("");

  slotHint.textContent = "Недоступное время нельзя выбрать. Администратор подтвердит бронь.";
}

function validateStep() {
  const data = formData();

  if (state.step === 0 && !data.program) return "Выберите программу.";
  if (state.step === 1 && !state.date) return "Выберите доступную дату.";
  if (state.step === 2 && !state.time) return "Выберите доступное время.";
  if (state.step === 3 && (!data.name || !data.phone)) return "Заполните имя и телефон.";

  return "";
}

function renderStep() {
  modal.classList.toggle("is-confirming", state.step === 3);
  modal.classList.remove("is-success");
  successStep.hidden = true;
  stepLabel.textContent = `Шаг ${state.step + 1} из 4`;
  modalTitle.textContent = titles[state.step];
  statusNode.textContent = "";

  stepPanels.forEach((panel, index) => {
    panel.classList.toggle("is-active", index === state.step);
  });

  progressItems.forEach((item, index) => {
    item.classList.toggle("is-active", index <= state.step);
  });

  backButton.disabled = state.step === 0;
  nextButton.hidden = state.step === 3;
  submitButton.hidden = state.step !== 3;
  updateSummary();
}

function openBooking(program = "") {
  if (program) {
    const input = form.querySelector(`input[name="program"][value="${program}"]`);
    if (input) input.checked = true;
  }

  state.step = 0;
  statusNode.textContent = "";
  renderStep();
  modal.showModal();
}

function finishBooking() {
  const data = formData();
  const date = selectedDate();
  const body = [
    `Программа: ${data.program}`,
    `Дата: ${date.label}`,
    `Время: ${state.time}`,
    `Гостей: ${data.guests}`,
    `Формат: ${data.occasion}`,
    `Процедуры: ${data.addons.length ? data.addons.join(", ") : "без дополнений"}`,
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Комментарий: ${data.comment || "нет"}`
  ].join("\n");

  const request = {
    ...data,
    date: state.date,
    time: state.time,
    createdAt: new Date().toISOString()
  };

  window.localStorage.setItem("banya-rubinstein-last-booking", JSON.stringify(request));
  mailLink.href = `mailto:spa7@dostoevsky-hotel.com?subject=${encodeURIComponent(
    "Бронь с сайта Баня на Рубинштейна"
  )}&body=${encodeURIComponent(body)}`;
  successText.textContent = `${data.program}, ${date.label}, ${state.time}. Вскоре менеджер свяжется с вами для подтверждения брони и оплаты.`;
  modal.classList.add("is-success");
  stepLabel.textContent = "Бронь";
  modalTitle.textContent = "Забронировано";
}

document.querySelectorAll("[data-open-booking]").forEach((button) => {
  button.addEventListener("click", () => openBooking());
});

document.querySelectorAll(".select-program").forEach((button) => {
  button.addEventListener("click", () => openBooking(button.dataset.program));
});

document.querySelector("[data-close-modal]").addEventListener("click", () => modal.close());

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    galleryLabel.textContent = button.dataset.gallery;
    galleryButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-selected", isSelected);
      item.classList.toggle("ui-button--primary", isSelected);
      item.classList.toggle("ui-button--secondary", !isSelected);
    });
  });
});

calendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".calendar-day");
  if (!button || button.disabled) return;
  state.date = button.dataset.date;
  state.time = "";
  renderCalendar();
  renderTimes();
  updateSummary();
});

timeGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".time-option");
  if (!button || button.disabled) return;
  state.time = button.dataset.time;
  renderTimes();
  updateSummary();
});

backButton.addEventListener("click", () => {
  if (state.step > 0) {
    state.step -= 1;
    renderStep();
  }
});

nextButton.addEventListener("click", () => {
  const error = validateStep();
  if (error) {
    statusNode.textContent = error;
    return;
  }
  state.step += 1;
  renderStep();
});

form.addEventListener("input", updateSummary);
form.addEventListener("change", updateSummary);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const error = validateStep();
  if (error) {
    statusNode.textContent = error;
    return;
  }
  finishBooking();
});

renderCalendar();
renderTimes();
updateSummary();
