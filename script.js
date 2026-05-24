const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");

const timeline = document.getElementById("timeline");
const timeLabels = document.getElementById("timeLabels");

const selectedDateText =
  document.getElementById("selectedDateText");

const addScheduleBtn =
  document.getElementById("addScheduleBtn");

const detailTitle =
  document.getElementById("detailTitle");

const detailDate =
  document.getElementById("detailDate");

const detailStart =
  document.getElementById("detailStart");

const detailEnd =
  document.getElementById("detailEnd");

const detailColor =
  document.getElementById("detailColor");

const saveDetailBtn =
  document.getElementById("saveDetailBtn");

const deleteDetailBtn =
  document.getElementById("deleteDetailBtn");

let currentDate = new Date();

let selectedDate = null;
let selectedEvent = null;

let schedules =
  JSON.parse(localStorage.getItem("schedules"))
  || {};

const HOUR_HEIGHT = 60;

/* 시간축 */
function createTimelineLines() {

  timeLabels.innerHTML = "";
  timeline.innerHTML = "";

  for(let i=0; i<24; i++) {

    const label =
      document.createElement("div");

    label.className = "time-label";

    label.textContent =
      `${String(i).padStart(2,"0")}:00`;

    timeLabels.appendChild(label);

    const line =
      document.createElement("div");

    line.className = "hour-line";

    timeline.appendChild(line);
  }
}

/* 달력 */
function renderCalendar() {

  calendarGrid.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  monthTitle.textContent =
    `${year}년 ${month + 1}월`;

  const firstDay =
    new Date(year, month, 1).getDay();

  const lastDate =
    new Date(year, month + 1, 0).getDate();

  for(let i=0; i<firstDay; i++) {

    const empty =
      document.createElement("div");

    calendarGrid.appendChild(empty);
  }

  for(let day=1; day<=lastDate; day++) {

    const date =
      `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    const dayEl =
      document.createElement("div");

    dayEl.className = "day";

    const number =
      document.createElement("div");

    number.className = "day-number";
    number.textContent = day;

    dayEl.appendChild(number);

    if(schedules[date]) {

      schedules[date].forEach((event)=>{

        const mini =
          document.createElement("div");

        mini.className = "mini-event";

        mini.style.background =
          event.color;

        mini.textContent =
          `${event.start}:00 ${event.title}`;

        dayEl.appendChild(mini);
      });
    }

    dayEl.addEventListener("click",()=>{

      selectedDate = date;

      selectedDateText.textContent =
        date;

      renderTimeline();
    });

    calendarGrid.appendChild(dayEl);
  }
}

/* 타임라인 */
function renderTimeline() {

  timeline
    .querySelectorAll(".event-block")
    .forEach((el)=>el.remove());

  if(!selectedDate) return;

  const daySchedules =
    schedules[selectedDate] || [];

  daySchedules.forEach((event,index)=>{

    const block =
      document.createElement("div");

    block.className = "event-block";

    block.style.background =
      event.color;

    block.style.top =
      `${event.start * HOUR_HEIGHT}px`;

    block.style.height =
      `${(event.end-event.start) * HOUR_HEIGHT}px`;

    block.innerHTML = `
      <div class="event-block-title">
        ${event.title}
      </div>

      <div>
        ${event.start}:00 ~ ${event.end}:00
      </div>

      <div class="resize-handle"></div>
    `;

    /* 일정 선택 */
    block.addEventListener("click",(e)=>{

      e.stopPropagation();

      selectedEvent = {
        index:index,
        date:selectedDate
      };

      detailTitle.value =
        event.title;

      detailDate.value =
        selectedDate;

      detailStart.value =
        `${String(event.start).padStart(2,"0")}:00`;

      detailEnd.value =
        `${String(event.end).padStart(2,"0")}:00`;

      detailColor.value =
        event.color;
    });

    /* 리사이즈 */
    const handle =
      block.querySelector(".resize-handle");

    handle.addEventListener("mousedown",(e)=>{

      e.stopPropagation();

      const startY =
        e.clientY;

      const startHeight =
        parseInt(block.style.height);

      function resizeMove(ev){

        const diff =
          ev.clientY - startY;

        let newHeight =
          startHeight + diff;

        if(newHeight < HOUR_HEIGHT){
          newHeight = HOUR_HEIGHT;
        }

        block.style.height =
          `${newHeight}px`;
      }

      function resizeEnd(){

        const top =
          parseInt(block.style.top);

        const height =
          parseInt(block.style.height);

        const newEnd =
          Math.round(
            (top + height)
            / HOUR_HEIGHT
          );

        schedules[selectedDate][index].end =
          newEnd;

        localStorage.setItem(
          "schedules",
          JSON.stringify(schedules)
        );

        renderCalendar();
        renderTimeline();

        window.removeEventListener(
          "mousemove",
          resizeMove
        );

        window.removeEventListener(
          "mouseup",
          resizeEnd
        );
      }

      window.addEventListener(
        "mousemove",
        resizeMove
      );

      window.addEventListener(
        "mouseup",
        resizeEnd
      );
    });

    timeline.appendChild(block);
  });
}

/* 일정 생성 버튼 */
addScheduleBtn.addEventListener("click",()=>{

  if(!selectedDate){

    alert("날짜를 먼저 선택해주세요.");
    return;
  }

  if(!schedules[selectedDate]){

    schedules[selectedDate] = [];
  }

  schedules[selectedDate].push({
    title:"새 일정",
    start:9,
    end:10,
    color:"#4f46e5"
  });

  localStorage.setItem(
    "schedules",
    JSON.stringify(schedules)
  );

  renderCalendar();
  renderTimeline();
});

/* 저장 */
saveDetailBtn.addEventListener("click",()=>{

  if(!selectedEvent) return;

  const event =
    schedules[selectedEvent.date]
    [selectedEvent.index];

  event.title =
    detailTitle.value;

  event.color =
    detailColor.value;

  event.start =
    parseInt(
      detailStart.value.split(":")[0]
    );

  event.end =
    parseInt(
      detailEnd.value.split(":")[0]
    );

  localStorage.setItem(
    "schedules",
    JSON.stringify(schedules)
  );

  renderCalendar();
  renderTimeline();
});

/* 삭제 */
deleteDetailBtn.addEventListener("click",()=>{

  if(!selectedEvent) return;

  schedules[selectedEvent.date]
    .splice(selectedEvent.index,1);

  localStorage.setItem(
    "schedules",
    JSON.stringify(schedules)
  );

  selectedEvent = null;

  renderCalendar();
  renderTimeline();
});

/* 월 이동 */
document
.getElementById("prevMonth")
.addEventListener("click",()=>{

  currentDate.setMonth(
    currentDate.getMonth()-1
  );

  renderCalendar();
});

document
.getElementById("nextMonth")
.addEventListener("click",()=>{

  currentDate.setMonth(
    currentDate.getMonth()+1
  );

  renderCalendar();
});

/* 시작 */
createTimelineLines();

renderCalendar();
