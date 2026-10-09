// タスク一覧の配列（localStorageから読み込み）
let todos = JSON.parse(localStorage.getItem('monaca_todos')) || [];
let currentFilter = 'all';

// ページ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', () => {
    // 期限のデフォルト値を「今日」に設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dueDate').value = today;
    
    renderToDos();
});

// ローカルストレージに保存
function saveToDos() {
    localStorage.setItem('monaca_todos', JSON.stringify(todos));
    renderToDos();
}

// 新規タスクの追加
function addToDo() {
    const nameInput = document.getElementById('name');
    const dueDateInput = document.getElementById('dueDate');
    const priorityInput = document.getElementById('priority');
    const categoryInput = document.getElementById('category');

    const text = nameInput.value.trim();
    if (!text) {
        alert('タスク名を入力してください');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        dueDate: dueDateInput.value,
        priority: priorityInput.value,
        category: categoryInput.value,
        completed: false
    };

    todos.push(newTodo);
    saveToDos();

    // フォームリセット
    nameInput.value = '';
    nameInput.focus();
}

// 完了ステータスのトグル
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveToDos();
}

// タスク削除
function deleteToDo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToDos();
}

// 完了済みタスクの一括削除
function clearCompleted() {
    if (confirm('完了したタスクをすべて削除しますか？')) {
        todos = todos.filter(todo => !todo.completed);
        saveToDos();
    }
}

// フィルターの設定
function setFilter(filter, buttonEl) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');
    renderToDos();
}

// プログレスバーの更新
function updateProgressBar() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressText').innerText = `${percent}% (${completed}/${total})`;
}

// タスク一覧の描画
function renderToDos() {
    const todoListEl = document.getElementById('ToDoList');
    todoListEl.innerHTML = '';

    // フィルター処理
    let filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    // 表示順序（未完了を優先、その後優先度順）
    filteredTodos.sort((a, b) => a.completed - b.completed);

    if (filteredTodos.length === 0) {
        todoListEl.innerHTML = `<li class="empty-message">タスクはありません</li>`;
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const priorityText = todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低';
            
            li.innerHTML = `
                <div class="todo-main">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete(${todo.id})">
                    <div class="todo-details">
                        <span class="todo-text">${escapeHtml(todo.text)}</span>
                        <div class="todo-meta">
                            <span class="badge priority-${todo.priority}">優先度: ${priorityText}</span>
                            <span class="badge category">${escapeHtml(todo.category)}</span>
                            ${todo.dueDate ? `<span class="due-date">📅 ${todo.dueDate}</span>` : ''}
                        </div>
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteToDo(${todo.id})">削除</button>
            `;
            todoListEl.appendChild(li);
        });
    }

    updateProgressBar();
}

// XSS対策のエスケープ処理
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}