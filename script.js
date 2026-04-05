let tasks = [];

// Load tasks from Local Storage and handle legacy array of strings
function init() {
    const stored = localStorage.getItem("tasks");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Migrate legacy string array to object array backward compatibility
            tasks = parsed.map(t => {
                if (typeof t === 'string') {
                    return { id: Date.now() + Math.random(), text: t, completed: false };
                }
                return t;
            });
        } catch (e) {
            tasks = [];
        }
    }
    renderTasks();
}

window.onload = init;

// Allow pressing Enter to add task
document.getElementById("taskInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        addTask();
    }
});

function addTask() {
    let input = document.getElementById("taskInput");
    let text = input.value.trim();

    if (text === "") return;

    let newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();

    input.value = "";
    input.focus(); // keep focus for continuous typing
    renderTasks();
}

function toggleTask(id) {
    let task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id, element) {
    // Add exit animation
    element.classList.add("removing");
    
    // Wait for animation to finish before updating state and DOM
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }, 300);
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    let list = document.getElementById("taskList");
    let emptyState = document.getElementById("emptyState");
    let taskCount = document.getElementById("taskCount");
    
    list.innerHTML = "";

    // Update the counter
    let pendingCount = tasks.filter(t => !t.completed).length;
    taskCount.innerText = `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending`;

    if (tasks.length === 0) {
        emptyState.classList.add("show");
    } else {
        emptyState.classList.remove("show");
    }

    // Render uncompleted first, then completed
    let sortedTasks = [...tasks].sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);

    sortedTasks.forEach((task) => {
        let li = document.createElement("li");
        if (task.completed) {
            li.classList.add("completed");
        }

        let contentDiv = document.createElement("div");
        contentDiv.className = "task-content";
        contentDiv.onclick = () => toggleTask(task.id);

        let icon = document.createElement("i");
        icon.className = task.completed ? "ph-fill ph-check-circle check-btn" : "ph ph-circle check-btn";

        let textSpan = document.createElement("span");
        textSpan.className = "task-text";
        textSpan.innerText = task.text;

        contentDiv.appendChild(icon);
        contentDiv.appendChild(textSpan);

        let delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.innerHTML = '<i class="ph ph-trash"></i>';
        delBtn.setAttribute("aria-label", "Delete task");
        delBtn.onclick = (e) => {
            e.stopPropagation(); // prevent toggling completion when deleting
            deleteTask(task.id, li);
        };

        li.appendChild(contentDiv);
        li.appendChild(delBtn);

        list.appendChild(li);
    });
}