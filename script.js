// ====== DOM Elements ======
const themeToggleBtn = document.getElementById('theme-toggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const htmlElement = document.documentElement;

// Notes & Grid
const notesGrid = document.getElementById('notes-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');

// Modal Elements
const modal = document.getElementById('note-modal');
const modalTitle = document.getElementById('modal-title');
const fabAdd = document.getElementById('fab-add');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const noteTitleInput = document.getElementById('note-title-input');
const noteDescInput = document.getElementById('note-desc-input');

// ====== State ======
let notes = [];

// ====== Initialization ======
function init() {
    loadTheme();
    loadNotes();
    renderNotes();
    setupEventListeners();
}

// ====== Event Listeners ======
function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Modal Operations
    fabAdd.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form Submit
    noteForm.addEventListener('submit', handleNoteSubmit);

    // Search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        renderNotes(searchTerm);
    });
}

// ====== Theme Logic ======
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// ====== Notes Data Logic ======
function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// ====== Modal Logic ======
function openModal(noteToEdit = null) {
    if (noteToEdit) {
        modalTitle.textContent = 'Edit Note';
        noteIdInput.value = noteToEdit.id;
        noteTitleInput.value = noteToEdit.title;
        noteDescInput.value = noteToEdit.description;
    } else {
        modalTitle.textContent = 'Add Note';
        noteForm.reset();
        noteIdInput.value = '';
    }

    modal.classList.remove('hidden');
    noteTitleInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    noteForm.reset();
    noteIdInput.value = '';
}

function handleNoteSubmit(e) {
    e.preventDefault();

    const title = noteTitleInput.value.trim();
    const description = noteDescInput.value.trim();
    const id = noteIdInput.value;

    if (!title || !description) return;

    if (id) {
        // Edit existing note
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].description = description;
            notes[noteIndex].dateUpdated = Date.now();
        }
    } else {
        // Add new note
        const newNote = {
            id: generateId(),
            title,
            description,
            dateCreated: Date.now(),
        };
        notes.unshift(newNote); // Add to beginning
    }

    saveNotes();
    renderNotes(searchInput.value.toLowerCase());
    closeModal();
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes(searchInput.value.toLowerCase());
    }
}

// ====== Render Logic ======
function renderNotes(searchTerm = '') {
    notesGrid.innerHTML = '';

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.description.toLowerCase().includes(searchTerm)
    );

    if (notes.length === 0) {
        emptyState.classList.remove('hidden');
        notesGrid.style.display = 'none';
    } else if (filteredNotes.length === 0 && notes.length > 0) {
        emptyState.classList.add('hidden');
        notesGrid.style.display = 'block';
        notesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); width: 100%; padding: 2rem;">No notes match your search.</p>';
    } else {
        emptyState.classList.add('hidden');
        notesGrid.style.display = 'grid';

        filteredNotes.forEach(note => {
            const noteCard = createNoteElement(note);
            notesGrid.appendChild(noteCard);
        });
    }
}

function createNoteElement(note) {
    const div = document.createElement('div');
    div.classList.add('note-card');

    const date = new Date(note.dateCreated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    div.innerHTML = `
        <h3 class="note-title"></h3>
        <p class="note-desc"></p>
        <div class="note-footer">
            <span class="note-date">${date}</span>
            <div class="note-actions">
                <button class="action-btn edit" aria-label="Edit note" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="action-btn delete" aria-label="Delete note" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        </div>
    `;

    // Securing against XSS by using textContent
    div.querySelector('.note-title').textContent = note.title;
    div.querySelector('.note-desc').textContent = note.description;

    // Attach event listeners for edit and delete
    const editBtn = div.querySelector('.edit');
    const deleteBtn = div.querySelector('.delete');

    editBtn.addEventListener('click', () => openModal(note));
    deleteBtn.addEventListener('click', () => deleteNote(note.id));

    return div;
}

// ====== Utility ======
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
