// Selecting DOM elements
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDueDateInput = document.getElementById('taskDueDate');
const tasksContainer = document.getElementById('tasksContainer');

const listForm = document.getElementById('listForm');
const listNameInput = document.getElementById('listName');
const listsContainer = document.getElementById('listsContainer');

const currentListTitle = document.getElementById('currentListTitle');

const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-button');
const editTaskForm = document.getElementById('editTaskForm');
const editTaskTitleInput = document.getElementById('editTaskTitle');
const editTaskDescriptionInput = document.getElementById('editTaskDescription');
const editTaskDueDateInput = document.getElementById('editTaskDueDate');

const gameModeSelect = document.getElementById('gameMode');

const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');
const playerXWins = document.getElementById('playerXWins');
const playerOWins = document.getElementById('playerOWins');
const ties = document.getElementById('ties');

// Application State
let lists = [];
let tasks = [];
let currentList = 'All Tasks';
let editTaskId = null;

// Initialize Application
window.onload = () => {
    loadFromLocalStorage();
    renderLists();
    renderTasks();
    updateCurrentListTitle();
};

// Utility Functions
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Load Data from localStorage
function loadFromLocalStorage() {
    const storedLists = JSON.parse(localStorage.getItem('lists'));
    const storedTasks = JSON.parse(localStorage.getItem('tasks'));
    const storedScores = JSON.parse(localStorage.getItem('scores'));

    if (storedLists) lists = storedLists;
    else {
        lists = ['All Tasks'];
        saveToLocalStorage();
    }

    if (storedTasks) tasks = storedTasks;
    if (storedScores) {
        if (storedScores.X) playerXWins.innerText = storedScores.X;
        if (storedScores.O) playerOWins.innerText = storedScores.O;
        if (storedScores.Ties) ties.innerText = storedScores.Ties;
    }
}

// Save Data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const scores = {
        X: parseInt(playerXWins.innerText),
        O: parseInt(playerOWins.innerText),
        Ties: parseInt(ties.innerText)
    };
    localStorage.setItem('scores', JSON.stringify(scores));
}

// Render Lists
function renderLists() {
    listsContainer.innerHTML = '';
    lists.forEach(list => {
        const li = document.createElement('li');
        li.classList.add('list-item');
        if (list === currentList) li.classList.add('active');

        li.innerHTML = `
            <span>${list}</span>
            ${list !== 'All Tasks' ? `<i class="fas fa-trash"></i>` : ''}
        `;

        // List Click Event
        li.addEventListener('click', () => {
            currentList = list;
            renderLists();
            renderTasks();
            updateCurrentListTitle();
        });

        // Delete List Event
        const trashIcon = li.querySelector('.fa-trash');
        if (trashIcon) {
            trashIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteList(list);
            });
        }

        listsContainer.appendChild(li);
    });
}

// Add New List
listForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const listName = listNameInput.value.trim();
    if (listName && !lists.includes(listName)) {
        lists.push(listName);
        listNameInput.value = '';
        saveToLocalStorage();
        renderLists();
    }
});

// Delete List
function deleteList(listName) {
    // Confirm Deletion
    if (confirm(`Are you sure you want to delete the list "${listName}"? All associated tasks will also be deleted.`)) {
        lists = lists.filter(list => list !== listName);
        tasks = tasks.filter(task => task.list !== listName);
        if (currentList === listName) currentList = 'All Tasks';
        saveToLocalStorage();
        renderLists();
        renderTasks();
        updateCurrentListTitle();
    }
}

// Render Tasks
function renderTasks() {
    tasksContainer.innerHTML = '';
    let filteredTasks = tasks;
    if (currentList !== 'All Tasks') {
        filteredTasks = tasks.filter(task => task.list === currentList);
    }

    // Sort tasks by due date
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('task-item');
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="task-details">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                ${task.dueDate ? `<span class="due-date"><i class="fas fa-calendar-alt"></i> Due: ${formatDate(task.dueDate)}</span>` : ''}
            </div>
            <div class="task-actions">
                <i class="fas fa-check ${task.completed ? 'fa-undo' : 'fa-check'}" title="${task.completed ? 'Mark as Incomplete' : 'Mark as Completed'}"></i>
                <i class="fas fa-edit" title="Edit Task"></i>
                <i class="fas fa-trash" title="Delete Task"></i>
            </div>
        `;

        // Mark as Completed/Incomplete
        const checkIcon = li.querySelector('.fa-check, .fa-undo');
        checkIcon.addEventListener('click', () => {
            toggleTaskCompletion(task.id);
        });

        // Edit Task
        const editIcon = li.querySelector('.fa-edit');
        editIcon.addEventListener('click', () => {
            openEditModal(task.id);
        });

        // Delete Task
        const deleteIcon = li.querySelector('.fa-trash');
        deleteIcon.addEventListener('click', () => {
            deleteTask(task.id);
        });

        tasksContainer.appendChild(li);
    });
}

// Format Date
function formatDate(dateStr) {
    const options = { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    };
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, options);
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const dueDate = taskDueDateInput.value;

    if (title) {
        const newTask = {
            id: generateId(),
            title,
            description,
            dueDate,
            completed: false,
            list: currentList !== 'All Tasks' ? currentList : 'All Tasks'
        };
        tasks.push(newTask);
        taskForm.reset();
        saveToLocalStorage();
        renderTasks();
    }
});

// Toggle Task Completion
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
    }
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveToLocalStorage();
        renderTasks();
    }
}

// Open Edit Modal
function openEditModal(taskId) {
    editTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        editTaskTitleInput.value = task.title;
        editTaskDescriptionInput.value = task.description;
        editTaskDueDateInput.value = task.dueDate ? task.dueDate.substring(0,16) : '';
        editModal.style.display = 'block';
    }
}

// Close Edit Modal
closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    editTaskForm.reset();
    editTaskId = null;
});

// Handle Outside Click to Close Modal
window.addEventListener('click', (e) => {
    if (e.target == editModal) {
        editModal.style.display = 'none';
        editTaskForm.reset();
        editTaskId = null;
    }
});

// Save Edited Task
editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = editTaskTitleInput.value.trim();
    const description = editTaskDescriptionInput.value.trim();
    const dueDate = editTaskDueDateInput.value;

    if (title && editTaskId) {
        const taskIndex = tasks.findIndex(t => t.id === editTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = description;
            tasks[taskIndex].dueDate = dueDate;
            saveToLocalStorage();
            renderTasks();
            editModal.style.display = 'none';
            editTaskForm.reset();
            editTaskId = null;
        }
    }
});

// Update Current List Title
function updateCurrentListTitle() {
    currentListTitle.innerText = currentList;
}

// Handle Game Mode (Optional Feature Placeholder)
gameModeSelect.addEventListener('change', (e) => {
    // Future implementation for different modes
    console.log(`Game Mode changed to: ${e.target.value}`);
});

// Utility: Get Current List Tasks
function getCurrentListTasks() {
    if (currentList === 'All Tasks') {
        return tasks;
    }
    return tasks.filter(task => task.list === currentList);
}

// Initialize Default List if Needed
if (!lists.includes('All Tasks')) {
    lists.unshift('All Tasks');
    saveToLocalStorage();
}
