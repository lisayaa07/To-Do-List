/* ========= หน้า index.html ========= */
if (document.getElementById('taskInput')) {
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const totalCount = document.getElementById('totalCount');
  const doneCount = document.getElementById('doneCount');
  const pendingCount = document.getElementById('pendingCount');

  const filterAll = document.getElementById('filterAll');
  const filterPending = document.getElementById('filterPending');
  const filterDone = document.getElementById('filterDone');
  const openDiary = document.getElementById('openDiary');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentFilter = 'all';

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function updateDashboard() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    totalCount.textContent = total;
    doneCount.textContent = done;
    pendingCount.textContent = pending;
  }

  function renderTasks() {
    taskList.innerHTML = '';

    // เรียงลำดับตามวันที่ (ใกล้สุดก่อน)
    tasks.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
//แสดงจำนวนงานตาม dashboard
    let filteredTasks = [];
    if (currentFilter === 'all') filteredTasks = tasks;
    else if (currentFilter === 'done') filteredTasks = tasks.filter(t => t.completed);
    else filteredTasks = tasks.filter(t => !t.completed);

    if (filteredTasks.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'ไม่มีงานในหมวดนี้';
      msg.className = 'empty';
      taskList.appendChild(msg);
      updateDashboard();
      return;
    }

    filteredTasks.forEach(task => {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.onchange = () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      };

      const infoDiv = document.createElement('div');
      infoDiv.className = 'task-info';

      const span = document.createElement('span');
      span.textContent = task.text;
      if (task.completed) span.style.textDecoration = 'line-through';

      const dateSpan = document.createElement('span');
      dateSpan.className = 'task-date';
      dateSpan.textContent = task.date
        ? `วันที่กำหนด: ${task.date}`
        : 'ไม่ระบุวันที่';

      infoDiv.appendChild(span);
      infoDiv.appendChild(dateSpan);
// ปุ่มแก้ไขและลบ
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'แก้ไข';
      editBtn.className = 'edit-btn';
      editBtn.onclick = () => {
        localStorage.setItem('editIndex', tasks.indexOf(task));
        localStorage.setItem('editTask', JSON.stringify(task));
        window.location.href = 'edit.html';
      };

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'ลบ';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => {
        tasks.splice(tasks.indexOf(task), 1);
        saveTasks();
        renderTasks();
      };

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(infoDiv);
      li.appendChild(btnGroup);
      taskList.appendChild(li);
    });

    updateDashboard();
  }

  function addTask() {
    const text = taskInput.value.trim();
    const date = dateInput.value;
    if (text === '') return;

    tasks.push({ text, date, completed: false });
    saveTasks();
    renderTasks();

    taskInput.value = '';
    dateInput.value = '';
  }

  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
  });

  filterAll.addEventListener('click', () => { currentFilter = 'all'; renderTasks(); });
  filterPending.addEventListener('click', () => { currentFilter = 'pending'; renderTasks(); });
  filterDone.addEventListener('click', () => { currentFilter = 'done'; renderTasks(); });

  if (openDiary) {
    openDiary.addEventListener('click', () => window.location.href = 'diary.html');
  }

  renderTasks();
}

/* ========= หน้า edit.html ========= */
if (document.getElementById('editTaskInput')) {
  const editTaskInput = document.getElementById('editTaskInput');
  const editDateInput = document.getElementById('editDateInput');
  const saveBtn = document.getElementById('saveBtn');

  const editData = JSON.parse(localStorage.getItem('editTask'));
  const editIndex = localStorage.getItem('editIndex');

  if (editData) {
    editTaskInput.value = editData.text;
    editDateInput.value = editData.date || '';
  }

  saveBtn.addEventListener('click', () => {
    const updatedText = editTaskInput.value.trim();
    const updatedDate = editDateInput.value;
    if (updatedText === '') {
      alert('กรุณากรอกงาน');
      return;
    }

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const index = parseInt(editIndex);
    if (tasks[index]) {
      tasks[index].text = updatedText;
      tasks[index].date = updatedDate;
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    alert('บันทึกการแก้ไขเรียบร้อย!');
    window.location.href = 'index.html';
  });
}

/* ========= Diary Page ========= */
if (document.getElementById('diaryDate')) {
  const diaryDate = document.getElementById('diaryDate');
  const diaryText = document.getElementById('diaryText');
  const diaryImage = document.getElementById('diaryImage');
  const previewImage = document.getElementById('previewImage');
  const saveBtn = document.getElementById('saveDiary');
  const diaryList = document.getElementById('diaryList');
  const popupOverlay = document.getElementById('popupOverlay');
  const popupDate = document.getElementById('popupDate');
  const popupText = document.getElementById('popupText');
  const closePopup = document.getElementById('closePopup');

  let diaries = JSON.parse(localStorage.getItem('diaries')) || [];

  // แสดงรูป preview ทันทีที่เลือก
  diaryImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        previewImage.src = event.target.result;
        previewImage.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.style.display = 'none';
    }
  });

  // 💾 บันทึก diary
  function saveDiary() {
    const date = diaryDate.value;
    const text = diaryText.value.trim();
    const image = previewImage.src || null;

    if (!date || (!text && !image)) {
      alert('Please select a date and write something or add an image.');
      return;
    }

    const existing = diaries.find(d => d.date === date);
    if (existing) {
      existing.text = text;
      existing.image = image;
    } else {
      diaries.push({ date, text, image });
    }

    localStorage.setItem('diaries', JSON.stringify(diaries));

    // reset ฟอร์ม
    diaryText.value = '';
    diaryImage.value = '';
    previewImage.style.display = 'none';

    renderDiaryList();
  }

  // แสดง popup ของแต่ละวัน
  function showPopup(entry) {
    popupDate.textContent = ` Date: ${entry.date}`;
    popupText.innerHTML = ''; // เคลียร์เนื้อหาเก่า

    //ข้อความในไดอารี่
    if (entry.text) {
      const diaryPara = document.createElement('p');
      diaryPara.textContent = entry.text;
      popupText.appendChild(diaryPara);
    }

    // แสดงรูปถ้ามี
    if (entry.image) {
      const img = document.createElement('img');
      img.src = entry.image;
      img.alt = 'Diary Image';
      img.classList.add('popup-img');

      popupText.appendChild(img);
    }

    // To-Do ที่เสร็จแล้วของวันเดียวกัน
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const doneTasks = tasks.filter(t => t.completed && t.date === entry.date);

    if (doneTasks.length > 0) {
      const taskTitle = document.createElement('h4');
      taskTitle.textContent = 'To Do List Completed :';
      popupText.appendChild(taskTitle);

      const taskList = document.createElement('ul');
      doneTasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `- ${task.text}`;
        taskList.appendChild(li);
      });
      popupText.appendChild(taskList);
    }

    popupOverlay.style.display = 'flex';
  }

  // แสดงรายการ diary ทั้งหมด
  function renderDiaryList() {
    diaryList.innerHTML = '';
    if (diaries.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'ยังไม่มี Diary ในรายการ เริ่มเขียนได้เลย!';
      msg.className = 'empty';
      diaryList.appendChild(msg);
      return;
    }

    // เรียงตามวันที่ใหม่ → เก่า
    diaries.sort((a, b) => new Date(b.date) - new Date(a.date));

    diaries.forEach(entry => {
      const li = document.createElement('li');
      const info = document.createElement('span');
      info.textContent = entry.date;
      info.style.flex = '1';
      info.style.cursor = 'pointer';
      info.onclick = () => showPopup(entry);

      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';

      // แก้ไข
      const editBtn = document.createElement('button');
      editBtn.textContent = 'แก้ไข';
      editBtn.className = 'edit-btn';
      editBtn.onclick = (e) => {
        e.stopPropagation();
        diaryDate.value = entry.date;
        diaryText.value = entry.text || '';
        if (entry.image) {
          previewImage.src = entry.image;
          previewImage.style.display = 'block';
        } else {
          previewImage.style.display = 'none';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      // ลบ
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'ลบ';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Delete diary on ${entry.date}?`)) {
          diaries = diaries.filter(d => d.date !== entry.date);
          localStorage.setItem('diaries', JSON.stringify(diaries));
          renderDiaryList();
        }
      };

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);
      li.appendChild(info);
      li.appendChild(btnGroup);
      diaryList.appendChild(li);
    });
  }

  saveBtn.addEventListener('click', saveDiary);
  closePopup.addEventListener('click', () => (popupOverlay.style.display = 'none'));
  renderDiaryList();
}
/* Flatpickr*/
if (typeof flatpickr !== "undefined") {
  // หน้า To-Do List
  if (document.getElementById('dateInput')) {
    flatpickr("#dateInput", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "F j, Y",
      theme: "material_yellow",
      allowInput: true,
      onReady: function(selectedDates, dateStr, instance) {
        instance.altInput.placeholder = "กรุณาเลือก ว/ด/ป";
      }
    });
  }

  // หน้า Diary
  if (document.getElementById('diaryDate')) {
    flatpickr("#diaryDate", {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "F j, Y",
      theme: "material_yellow",
      allowInput: true,
      onReady: function(selectedDates, dateStr, instance) {
        instance.altInput.placeholder = "กรุณาเลือก ว/ด/ป";
      }
    });
  }
}


