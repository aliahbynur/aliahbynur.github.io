const state = {
  mode: 'notice',
  data: {
    notice: { date: '', noticeNo: '', subject: '', body: '' },
    agenda: { date: '', time: '', venue: '', meeting: '', items: [''] },
    minutes: { date: '', time: '', venue: '', meeting: '', members: '', discussion: '', decisions: '', actions: '' },
    attendance: { date: '', meeting: '', time: '', participants: [{ name: '', year: '' }] }
  }
};

const titles = {
  notice: 'Create Notice',
  agenda: 'Create Agenda',
  minutes: 'Create Minutes',
  attendance: 'Create Attendance Sheet'
};

const paperTitles = {
  notice: 'NOTICE',
  agenda: 'AGENDA',
  minutes: 'MINUTES OF MEETING',
  attendance: 'ATTENDANCE SHEET'
};

const formContent = document.getElementById('formContent');
const formTitle = document.getElementById('formTitle');
const paper = document.getElementById('paper');

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[c]));
}

function formatDate(value) {
  if (!value) return '__________________';
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
}

function templateFor(mode) {
  const template = document.getElementById(`${mode}FormTemplate`);
  return template.content.cloneNode(true);
}

function bindInputs() {
  formContent.querySelectorAll('input[name], textarea[name]').forEach(input => {
    input.addEventListener('input', () => {
      state.data[state.mode][input.name] = input.value;
      renderPaper();
    });
  });
}

function renderForm() {
  formContent.innerHTML = '';
  formContent.appendChild(templateFor(state.mode));
  formTitle.textContent = titles[state.mode];

  if (state.mode === 'agenda') renderAgendaItems();
  if (state.mode === 'attendance') renderParticipants();

  const data = state.data[state.mode];
  formContent.querySelectorAll('input[name], textarea[name]').forEach(input => {
    if (input.type === 'date') input.value = data[input.name] || '';
    else if (input.name in data && typeof data[input.name] === 'string') input.value = data[input.name];
  });

  bindInputs();

  const addAgenda = document.getElementById('addAgenda');
  if (addAgenda) addAgenda.addEventListener('click', () => {
    state.data.agenda.items.push('');
    renderAgendaItems();
    renderPaper();
  });

  const addParticipant = document.getElementById('addParticipant');
  if (addParticipant) addParticipant.addEventListener('click', () => {
    state.data.attendance.participants.push({ name:'', year:'' });
    renderParticipants();
    renderPaper();
  });
}

function renderAgendaItems() {
  const list = document.getElementById('agendaItems');
  if (!list) return;
  list.innerHTML = state.data.agenda.items.map((item, i) => `
    <div class="repeat-row">
      <div class="number">${i + 1}</div>
      <input data-agenda-index="${i}" value="${escapeHTML(item)}" placeholder="Agenda item ${i + 1}" />
      <button class="remove-btn" type="button" data-remove-agenda="${i}" aria-label="Remove item">×</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-agenda-index]').forEach(input => input.addEventListener('input', e => {
    state.data.agenda.items[Number(e.target.dataset.agendaIndex)] = e.target.value;
    renderPaper();
  }));

  list.querySelectorAll('[data-remove-agenda]').forEach(button => button.addEventListener('click', e => {
    const i = Number(e.currentTarget.dataset.removeAgenda);
    if (state.data.agenda.items.length === 1) state.data.agenda.items[0] = '';
    else state.data.agenda.items.splice(i, 1);
    renderAgendaItems();
    renderPaper();
  }));
}

function renderParticipants() {
  const list = document.getElementById('participantItems');
  if (!list) return;
  list.innerHTML = state.data.attendance.participants.map((p, i) => `
    <div class="repeat-row" style="grid-template-columns:34px 1fr 130px 32px">
      <div class="number">${i + 1}</div>
      <input data-person-name="${i}" value="${escapeHTML(p.name)}" placeholder="Participant name" />
      <input data-person-year="${i}" value="${escapeHTML(p.year)}" placeholder="Year / Semester" />
      <button class="remove-btn" type="button" data-remove-person="${i}" aria-label="Remove participant">×</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-person-name]').forEach(input => input.addEventListener('input', e => {
    state.data.attendance.participants[Number(e.target.dataset.personName)].name = e.target.value;
    renderPaper();
  }));
  list.querySelectorAll('[data-person-year]').forEach(input => input.addEventListener('input', e => {
    state.data.attendance.participants[Number(e.target.dataset.personYear)].year = e.target.value;
    renderPaper();
  }));
  list.querySelectorAll('[data-remove-person]').forEach(button => button.addEventListener('click', e => {
    const i = Number(e.currentTarget.dataset.removePerson);
    if (state.data.attendance.participants.length === 1) state.data.attendance.participants[0] = {name:'',year:''};
    else state.data.attendance.participants.splice(i, 1);
    renderParticipants();
    renderPaper();
  }));
}

function paperHeader() {
  return `<header class="paper-header">
    <div class="paper-university">ALIAH UNIVERSITY</div>
    <div class="paper-department">Department of English</div>
    <div class="paper-campus">Park Circus Campus</div>
  </header>
  <section class="paper-club">
    <div class="paper-club-name">Fabulinus</div>
    <div class="paper-club-sub">Drama Club · Department of English</div>
  </section>`;
}

function signatures() {
  return `<div class="paper-signatures">
    <div class="paper-signature"><div class="line"></div><strong>HEAD OF THE DEPARTMENT</strong><small>Department of English</small></div>
    <div class="paper-signature"><div class="line"></div><strong>SUPERVISOR</strong><small>Fabulinus · Drama Club</small></div>
  </div>`;
}

function renderPaper() {
  const d = state.data[state.mode];
  let content = `${paperHeader()}<div class="paper-title">${paperTitles[state.mode]}</div>`;

  if (state.mode === 'notice') {
    content += `<div class="paper-meta"><span>Date: ${formatDate(d.date)}</span><span>Notice No.: ${escapeHTML(d.noticeNo) || '__________________'}</span></div>
      <div class="paper-subject">Subject: ${escapeHTML(d.subject) || '____________________________________________'}</div>
      <div class="paper-body">${escapeHTML(d.body)}</div>`;
  }

  if (state.mode === 'agenda') {
    content += `<div class="paper-meta"><span>Date: ${formatDate(d.date)}</span><span>Time: ${escapeHTML(d.time) || '__________________'}</span></div>
      <div class="paper-meta"><span>Venue: ${escapeHTML(d.venue) || '__________________'}</span></div>
      <div class="paper-section"><h3>Meeting / Event</h3><div class="paper-lines">${escapeHTML(d.meeting) || '____________________________'}</div></div>
      <div class="paper-section"><h3>Agenda Items</h3><ol class="paper-list">${d.items.filter(x => x.trim()).map(x => `<li>${escapeHTML(x)}</li>`).join('') || '<li></li><li></li><li></li>'}</ol></div>`;
  }

  if (state.mode === 'minutes') {
    content += `<div class="paper-meta"><span>Date: ${formatDate(d.date)}</span><span>Time: ${escapeHTML(d.time) || '__________________'}</span></div>
      <div class="paper-meta"><span>Venue: ${escapeHTML(d.venue) || '__________________'}</span></div>
      <div class="paper-section"><h3>Meeting / Event</h3><div class="paper-lines">${escapeHTML(d.meeting)}</div></div>
      <div class="paper-section"><h3>Members Present</h3><div class="paper-lines">${escapeHTML(d.members)}</div></div>
      <div class="paper-section"><h3>Discussion</h3><div class="paper-lines">${escapeHTML(d.discussion)}</div></div>
      <div class="paper-section"><h3>Decisions / Resolutions</h3><div class="paper-lines">${escapeHTML(d.decisions)}</div></div>
      <div class="paper-section"><h3>Action Items</h3><div class="paper-lines">${escapeHTML(d.actions)}</div></div>`;
  }

  if (state.mode === 'attendance') {
    content += `<div class="paper-meta"><span>Date: ${formatDate(d.date)}</span><span>Time: ${escapeHTML(d.time) || '__________________'}</span></div>
      <div class="paper-section"><h3>Meeting / Event</h3><div class="paper-lines">${escapeHTML(d.meeting)}</div></div>
      <table class="paper-table"><thead><tr><th>SL. NO.</th><th>NAME</th><th>YEAR / SEMESTER</th><th>SIGNATURE</th></tr></thead><tbody>
      ${d.participants.map((p,i)=>`<tr><td>${i+1}</td><td>${escapeHTML(p.name)}</td><td>${escapeHTML(p.year)}</td><td></td></tr>`).join('')}
      </tbody></table>`;
  }

  paper.innerHTML = `${content}${signatures()}`;
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-card').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  renderForm();
  renderPaper();
}

document.querySelectorAll('.mode-card').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

document.getElementById('printBtn').addEventListener('click', () => window.print());

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all entered data?')) return;
  state.data = {
    notice:{date:'',noticeNo:'',subject:'',body:''},
    agenda:{date:'',time:'',venue:'',meeting:'',items:['']},
    minutes:{date:'',time:'',venue:'',meeting:'',members:'',discussion:'',decisions:'',actions:''},
    attendance:{date:'',meeting:'',time:'',participants:[{name:'',year:''}]}
  };
  renderForm();
  renderPaper();
});

renderForm();
renderPaper();
