/**
 * Enhanced To-Do List Application v2.0
 * Advanced task management with priorities, due dates, categories, statistics, and more
 * Features: CRUD operations, filtering, search, bulk actions, drag & drop, PWA capabilities
 */

class TodoApp {
    constructor() {
        // Initialize application state
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.currentSort = 'created';
        this.searchQuery = '';
        this.editingTaskId = null;
        this.bulkSelectMode = false;
        this.selectedTasks = new Set();
        this.draggedTask = null;
        
        // Task templates
        this.templates = [
            { name: 'Daily Tasks', icon: '🌅', tasks: ['Check emails', 'Review calendar', 'Plan day priorities'] },
            { name: 'Work Project', icon: '💼', tasks: ['Project planning', 'Team meeting', 'Code review', 'Documentation'] },
            { name: 'Health & Fitness', icon: '🏃‍♂️', tasks: ['Morning workout', 'Drink 8 glasses of water', 'Take vitamins'] },
            { name: 'Home & Family', icon: '🏠', tasks: ['Grocery shopping', 'Clean house', 'Family time'] },
            { name: 'Learning', icon: '📚', tasks: ['Read for 30 minutes', 'Practice new skill', 'Take online course'] },
            { name: 'Shopping List', icon: '🛒', tasks: ['Milk', 'Bread', 'Eggs', 'Fruits'] }
        ];
        
        // DOM element references
        this.elements = {
            // Core elements
            taskForm: $('#task-form'),
            taskInput: $('#task-input'),
            prioritySelect: $('#priority-select'),
            dueDateInput: $('#due-date'),
            categoryInput: $('#category-input'),
            addBtn: $('#add-btn'),
            taskList: $('#task-list'),
            emptyState: $('#empty-state'),
            
            // Search and filtering
            searchInput: $('#search-input'),
            clearSearch: $('#clear-search'),
            filterButtons: $('input[name="filter"]'),
            categoryFilter: $('#category-filter-menu'),
            sortDropdown: $('#sortDropdown').next('.dropdown-menu'),
            
            // Bulk operations
            bulkSelectToggle: $('#bulk-select-toggle'),
            bulkActions: $('#bulk-actions'),
            selectedCount: $('#selected-count'),
            bulkComplete: $('#bulk-complete'),
            bulkIncomplete: $('#bulk-incomplete'),
            bulkDelete: $('#bulk-delete'),
            bulkCancel: $('#bulk-cancel'),
            
            // Statistics
            statsCard: $('#stats-card'),
            countAll: $('#count-all'),
            countActive: $('#count-active'),
            countCompleted: $('#count-completed'),
            countOverdue: $('#count-overdue'),
            statTotal: $('#stat-total'),
            statCompleted: $('#stat-completed'),
            statActive: $('#stat-active'),
            statProgress: $('#stat-progress'),
            progressBar: $('#progress-bar'),
            
            // Theme and UI
            themeToggle: $('#theme-toggle'),
            themeIcon: $('#theme-icon'),
            toastContainer: $('#notification-toast'),
            toastMessage: $('#toast-message'),
            
            // Import/Export
            exportBtn: $('#export-btn'),
            importBtn: $('#import-btn'),
            importFile: $('#import-file'),
            clearCompletedBtn: $('#clear-completed-btn'),
            
            // Floating Action Button
            fabMain: $('#fab-main'),
            fabMenu: $('#fab-menu'),
            fabAddTask: $('#fab-add-task'),
            fabAddTemplate: $('#fab-add-template'),
            fabStats: $('#fab-stats'),
            fabExport: $('#fab-export'),
            
            // Modals
            statsModal: $('#statsModal'),
            templatesModal: $('#templatesModal'),
            statsLink: $('#stats-link')
        };
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        console.log('🔄 Initializing Todo App...');
        this.loadTasks();
        console.log('📝 Loaded tasks:', this.tasks.length);
        this.loadTheme();
        this.bindEvents();
        this.setupDragAndDrop();
        this.initializeTemplates();
        
        // Ensure render happens after DOM is ready
        setTimeout(() => {
            this.render();
            this.updateCounts();
            this.updateCategoryFilter();
            console.log('🎨 Tasks rendered to DOM');
        }, 200);
        
        this.checkDueDates();
        
        // Set minimum date to today for due date input
        const today = new Date().toISOString().split('T')[0];
        this.elements.dueDateInput.attr('min', today);
        
        // Focus on input field when page loads
        this.elements.taskInput.focus();
        
        // Check for overdue tasks periodically
        setInterval(() => this.checkDueDates(), 60000); // Check every minute
        
        console.log('� Enhanced Todo App v2.0 initialized successfully!');
        console.log('📊 Features: Priorities, Due Dates, Categories, Search, Bulk Actions, Statistics');
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Task form submission
        this.elements.taskForm.on('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });
        
        // Search functionality
        this.elements.searchInput.on('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
            this.elements.clearSearch.toggle(this.searchQuery.length > 0);
        });
        
        this.elements.clearSearch.on('click', () => {
            this.searchQuery = '';
            this.elements.searchInput.val('');
            this.elements.clearSearch.hide();
            this.render();
        });
        
        // Filter button changes
        this.elements.filterButtons.on('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });
        
        // Category filter
        this.elements.categoryFilter.on('click', 'a', (e) => {
            e.preventDefault();
            this.currentCategory = $(e.target).data('category');
            this.render();
        });
        
        // Sort dropdown
        this.elements.sortDropdown.on('click', 'a', (e) => {
            e.preventDefault();
            this.currentSort = $(e.target).data('sort');
            this.render();
        });
        
        // Bulk selection
        this.elements.bulkSelectToggle.on('click', () => {
            this.toggleBulkSelect();
        });
        
        this.elements.bulkComplete.on('click', () => {
            this.bulkAction('complete');
        });
        
        this.elements.bulkIncomplete.on('click', () => {
            this.bulkAction('incomplete');
        });
        
        this.elements.bulkDelete.on('click', () => {
            this.bulkAction('delete');
        });
        
        this.elements.bulkCancel.on('click', () => {
            this.toggleBulkSelect();
        });
        
        // Theme toggle
        this.elements.themeToggle.on('click', () => {
            this.toggleTheme();
        });
        
        // Import/Export
        this.elements.exportBtn.on('click', () => {
            this.exportTasks();
        });
        
        this.elements.importBtn.on('click', () => {
            this.elements.importFile.click();
        });
        
        this.elements.importFile.on('change', (e) => {
            this.importTasks(e.target.files[0]);
        });
        
        this.elements.clearCompletedBtn.on('click', () => {
            this.clearCompleted();
        });
        
        // FAB Menu
        this.elements.fabMain.on('click', () => {
            this.toggleFABMenu();
        });
        
        this.elements.fabAddTask.on('click', () => {
            this.elements.taskInput.focus();
            this.toggleFABMenu();
        });
        
        this.elements.fabAddTemplate.on('click', () => {
            this.showTemplatesModal();
            this.toggleFABMenu();
        });
        
        this.elements.fabStats.on('click', () => {
            this.showStatsModal();
            this.toggleFABMenu();
        });
        
        this.elements.fabExport.on('click', () => {
            this.exportTasks();
            this.toggleFABMenu();
        });
        
        // Statistics modal
        this.elements.statsLink.on('click', (e) => {
            e.preventDefault();
            this.showStatsModal();
        });
        
        // Keyboard shortcuts
        $(document).on('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Task list event delegation
        this.elements.taskList.on('click', '.task-checkbox', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            this.toggleTask(taskId);
        });
        
        this.elements.taskList.on('click', '.bulk-checkbox', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            this.toggleTaskSelection(taskId);
        });
        
        this.elements.taskList.on('click', '.edit-btn', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            this.startEdit(taskId);
        });
        
        this.elements.taskList.on('click', '.delete-btn', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            this.deleteTask(taskId);
        });
        
        this.elements.taskList.on('click', '.save-btn', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            this.saveEdit(taskId);
        });
        
        this.elements.taskList.on('click', '.cancel-btn', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            this.cancelEdit(taskId);
        });
        
        // Edit input handling
        this.elements.taskList.on('keydown', '.task-edit-input', (e) => {
            const taskId = $(e.target).closest('.task-item').data('task-id');
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveEdit(taskId);
            } else if (e.key === 'Escape') {
                this.cancelEdit(taskId);
            }
        });
        
        // Task item keyboard navigation
        this.elements.taskList.on('keydown', '.task-checkbox', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                const taskId = $(e.target).closest('.task-item').data('task-id');
                this.toggleTask(taskId);
            }
        });
        
        // Close FAB menu when clicking outside
        $(document).on('click', (e) => {
            if (!$(e.target).closest('.fab-container').length) {
                this.closeFABMenu();
            }
        });
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Prevent shortcuts when typing in inputs
        if ($(e.target).is('input, textarea, select') && !e.ctrlKey && !e.metaKey) {
            return;
        }
        
        // Global shortcuts
        if (e.key === 'Escape') {
            if (this.editingTaskId) {
                this.cancelEdit(this.editingTaskId);
            }
            if (this.bulkSelectMode) {
                this.toggleBulkSelect();
            }
            this.closeFABMenu();
        }
        
        // Ctrl/Cmd shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    if (this.elements.taskInput.is(':focus')) {
                        e.preventDefault();
                        this.handleAddTask();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    this.elements.searchInput.focus();
                    break;
                case 'a':
                    if (this.tasks.length > 0) {
                        e.preventDefault();
                        this.selectAllTasks();
                    }
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportTasks();
                    break;
                case 'n':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.elements.taskInput.focus();
                    }
                    break;
            }
        }
        
        // Delete key
        if (e.key === 'Delete' && this.selectedTasks.size > 0) {
            e.preventDefault();
            this.bulkAction('delete');
        }
    }
    
    /**
     * Handle adding a new task
     */
    handleAddTask() {
        const text = this.elements.taskInput.val().trim();
        const priority = this.elements.prioritySelect.val();
        const dueDate = this.elements.dueDateInput.val();
        const category = this.elements.categoryInput.val().trim();
        
        if (!text) {
            this.showToast('Please enter a task description', 'error');
            this.elements.taskInput.addClass('animate-shake');
            setTimeout(() => this.elements.taskInput.removeClass('animate-shake'), 500);
            this.elements.taskInput.focus();
            return;
        }
        
        if (text.length > 200) {
            this.showToast('Task description is too long (max 200 characters)', 'error');
            return;
        }
        
        const task = {
            id: this.generateId(),
            text: text,
            priority: priority,
            dueDate: dueDate || null,
            category: category || null,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task); // Add to beginning of array
        this.saveTasks();
        
        // Reset form
        this.elements.taskInput.val('');
        this.elements.prioritySelect.val('medium');
        this.elements.dueDateInput.val('');
        this.elements.categoryInput.val('');
        
        this.render();
        this.updateCounts();
        this.updateCategoryFilter();
        
        // Add bounce animation to the new task
        setTimeout(() => {
            $(`.task-item[data-task-id="${task.id}"]`).addClass('animate-bounce');
        }, 100);
        
        const priorityEmoji = { high: '🔴', medium: '📋', low: '🟢' };
        this.showToast(`${priorityEmoji[priority]} Task "${text}" added successfully!`, 'success');
        
        // Focus back on input for continuous adding
        setTimeout(() => {
            this.elements.taskInput.focus();
        }, 100);
    }
    
    /**
     * Toggle task completion status
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        
        if (task.completed) {
            task.completedAt = new Date().toISOString();
        } else {
            task.completedAt = null;
        }
        
        this.saveTasks();
        this.render();
        this.updateCounts();
        
        // Add celebration animation for completion
        if (task.completed) {
            const $taskItem = $(`.task-item[data-task-id="${taskId}"]`);
            $taskItem.addClass('animate-bounce');
            setTimeout(() => $taskItem.removeClass('animate-bounce'), 600);
        }
        
        const status = task.completed ? 'completed' : 'active';
        const emoji = task.completed ? '✅' : '↩️';
        this.showToast(`${emoji} Task marked as ${status}`, 'info');
    }
    
    /**
     * Start editing a task
     */
    startEdit(taskId) {
        if (this.editingTaskId) {
            this.cancelEdit(this.editingTaskId);
        }
        
        this.editingTaskId = taskId;
        const $taskItem = $(`.task-item[data-task-id="${taskId}"]`);
        const $taskText = $taskItem.find('.task-text');
        const $editInput = $taskItem.find('.task-edit-input');
        const $actions = $taskItem.find('.task-actions');
        
        // Store original text for cancel functionality
        $editInput.data('original-text', $taskText.text());
        
        // Switch to edit mode
        $taskText.addClass('editing');
        $editInput.addClass('active').val($taskText.text()).focus().select();
        $actions.find('.edit-btn, .delete-btn').hide();
        $actions.find('.save-btn, .cancel-btn').show();
        
        // Add editing class to task item
        $taskItem.addClass('editing');
    }
    
    /**
     * Save task edit
     */
    saveEdit(taskId) {
        const $taskItem = $(`.task-item[data-task-id="${taskId}"]`);
        const $editInput = $taskItem.find('.task-edit-input');
        const newText = $editInput.val().trim();
        
        if (!newText) {
            this.showToast('Task description cannot be empty', 'error');
            $editInput.focus();
            return;
        }
        
        if (newText.length > 200) {
            this.showToast('Task description is too long (max 200 characters)', 'error');
            return;
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const oldText = task.text;
            task.text = newText;
            task.updatedAt = new Date().toISOString();
            
            this.saveTasks();
            this.cancelEdit(taskId);
            this.render();
            
            this.showToast(`Task updated: "${oldText}" → "${newText}"`, 'success');
        }
    }
    
    /**
     * Cancel task edit
     */
    cancelEdit(taskId) {
        const $taskItem = $(`.task-item[data-task-id="${taskId}"]`);
        const $taskText = $taskItem.find('.task-text');
        const $editInput = $taskItem.find('.task-edit-input');
        const $actions = $taskItem.find('.task-actions');
        
        // Restore original text
        const originalText = $editInput.data('original-text');
        if (originalText) {
            $editInput.val(originalText);
        }
        
        // Switch back to view mode
        $taskText.removeClass('editing');
        $editInput.removeClass('active');
        $actions.find('.edit-btn, .delete-btn').show();
        $actions.find('.save-btn, .cancel-btn').hide();
        
        // Remove editing class from task item
        $taskItem.removeClass('editing');
        
        this.editingTaskId = null;
    }
    
    /**
     * Delete a task
     */
    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const $taskItem = $(`.task-item[data-task-id="${taskId}"]`);
        
        // Add removing animation
        $taskItem.addClass('removing');
        
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
            this.updateCounts();
            
            this.showToast(`Task "${task.text}" deleted`, 'info');
        }, 300); // Match animation duration
    }
    
    /**
     * Render the task list based on current filter
     */
    render() {
        console.log('🎨 Starting render with', this.tasks.length, 'total tasks');
        let filteredTasks = this.getFilteredTasks();
        console.log('🔍 Filtered tasks:', filteredTasks.length);
        
        // Apply search filter
        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(this.searchQuery) ||
                (task.category && task.category.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // Apply category filter
        if (this.currentCategory !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentCategory);
        }
        
        // Apply sorting
        filteredTasks = this.sortTasks(filteredTasks);
        
        if (filteredTasks.length === 0) {
            console.log('📭 No tasks to display, showing empty state');
            this.elements.emptyState.removeClass('hidden');
            this.elements.taskList.empty();
            return;
        }
        
        console.log('✅ Hiding empty state, rendering', filteredTasks.length, 'tasks');
        this.elements.emptyState.addClass('hidden');
        
        const taskHtml = filteredTasks.map(task => this.createTaskHtml(task)).join('');
        console.log('🏗️ Generated HTML for tasks');
        this.elements.taskList.html(taskHtml);
        
        // Ensure tasks are visible immediately
        this.elements.taskList.find('.task-item').css({
            'opacity': '1',
            'transform': 'translateX(0)',
            'display': 'block'
        });
        
        console.log('👀 Made tasks visible:', this.elements.taskList.find('.task-item').length);
        
        // Add entrance animations after tasks are visible
        setTimeout(() => {
            this.elements.taskList.find('.task-item').addClass('adding');
        }, 100);
        
        // Update bulk selection state
        this.updateBulkSelection();
    }
    
    /**
     * Debug method to force render tasks with simple styling
     */
    debugRender() {
        console.log('🔧 Debug render - Tasks:', this.tasks.length);
        if (this.tasks.length > 0) {
            this.elements.emptyState.hide();
            const simpleTaskHtml = this.tasks.map(task => `
                <li class="task-item" style="background: white; border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; display: block !important; opacity: 1 !important;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} style="width: 18px; height: 18px;">
                        <span style="color: #333; font-size: 16px; flex: 1;">${task.text}</span>
                        <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${task.priority}</span>
                    </div>
                </li>
            `).join('');
            this.elements.taskList.html(simpleTaskHtml);
            console.log('🎨 Debug: Simple tasks rendered');
        } else {
            console.log('📭 Debug: No tasks to render');
            this.elements.emptyState.show();
        }
    }
    
    /**
     * Get filtered tasks based on current filter
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'overdue':
                return this.tasks.filter(task => this.isOverdue(task));
            default:
                return this.tasks;
        }
    }
    
    /**
     * Sort tasks based on current sort option
     */
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'due':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'priority':
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'alphabetical':
                    return a.text.localeCompare(b.text);
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }
    
    /**
     * Check if a task is overdue
     */
    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        return new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
    }
    
    /**
     * Check if a task is due today
     */
    isDueToday(task) {
        if (!task.dueDate) return false;
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate === today;
    }
    
    /**
     * Check if a task is due within the next 7 days
     */
    isDueUpcoming(task) {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return taskDate > today && taskDate <= nextWeek;
    }
    
    /**
     * Create HTML for a single task item
     */
    createTaskHtml(task) {
        console.log('🏗️ Creating HTML for task:', task.text);
        
        // Simple, guaranteed-to-work HTML
        const completedClass = task.completed ? 'completed' : '';
        const priorityColor = task.priority === 'high' ? '#dc3545' : 
                             task.priority === 'medium' ? '#ffc107' : '#28a745';
        
        return `
            <li class="task-item" style="
                background: var(--surface-color, white);
                border: 1px solid var(--border-color, #ddd);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                display: block !important;
                opacity: 1 !important;
                transform: none !important;
                list-style: none;
            " data-task-id="${task.id}">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        style="width: 18px; height: 18px; cursor: pointer;"
                    >
                    <span class="task-text ${completedClass}" style="
                        flex: 1;
                        font-size: 16px;
                        color: var(--text-primary, #333);
                        ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}
                    ">${this.escapeHtml(task.text)}</span>
                    <span style="
                        background: ${priorityColor};
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                    ">${task.priority.toUpperCase()}</span>
                    <div class="task-actions" style="display: flex; gap: 4px;">
                        <button class="btn btn-sm btn-outline-info edit-btn" style="padding: 4px 8px;" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" style="padding: 4px 8px;" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </li>
        `;
    }
    
    /**
     * Update task counts in filter buttons
     */
    updateCounts() {
        const allCount = this.tasks.length;
        const activeCount = this.tasks.filter(task => !task.completed).length;
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        this.elements.countAll.text(allCount);
        this.elements.countActive.text(activeCount);
        this.elements.countCompleted.text(completedCount);
        
        // Update document title with active task count
        const title = activeCount > 0 
            ? `(${activeCount}) My Tasks - To-Do List` 
            : 'My Tasks - To-Do List';
        document.title = title;
    }
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = new bootstrap.Toast(this.elements.toastContainer[0], {
            autohide: true,
            delay: 3000
        });
        
        // Set toast message and style
        this.elements.toastMessage.text(message);
        this.elements.toastContainer.removeClass('success error info warning').addClass(type);
        
        // Add icon based on type
        const icons = {
            success: 'bi-check-circle-fill text-success',
            error: 'bi-exclamation-triangle-fill text-danger',
            info: 'bi-info-circle-fill text-info',
            warning: 'bi-exclamation-circle-fill text-warning'
        };
        
        const iconHtml = `<i class="bi ${icons[type] || icons.info} me-2"></i>`;
        this.elements.toastMessage.html(iconHtml + this.escapeHtml(message));
        
        toast.show();
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme icon
        const icon = newTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill';
        this.elements.themeIcon.removeClass('bi-moon-fill bi-sun-fill').addClass(icon);
        
        this.showToast(`Switched to ${newTheme} mode`, 'info');
    }
    
    /**
     * Load theme from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = savedTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill';
        this.elements.themeIcon.removeClass('bi-moon-fill bi-sun-fill').addClass(icon);
    }
    
    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
            this.showToast('Failed to save tasks. Storage may be full.', 'error');
        }
    }
    
    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
                
                // Validate and clean up tasks
                this.tasks = this.tasks.filter(task => 
                    task && 
                    typeof task.id === 'string' && 
                    typeof task.text === 'string' && 
                    typeof task.completed === 'boolean'
                );
            } else {
                // Add sample tasks if no tasks exist
                this.addSampleTasks();
            }
        } catch (error) {
            console.error('Failed to load tasks from localStorage:', error);
            this.tasks = [];
            this.addSampleTasks();
            this.showToast('Failed to load saved tasks, added sample tasks', 'error');
        }
    }

    /**
     * Add sample tasks for first-time users
     */
    addSampleTasks() {
        console.log('🎯 Adding sample tasks...');
        const sampleTasks = [
            {
                id: this.generateId(),
                text: 'Complete project presentation',
                completed: false,
                priority: 'high',
                category: 'Work',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                text: 'Reply to important emails',
                completed: true,
                priority: 'medium',
                category: 'Work',
                dueDate: null,
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: this.generateId(),
                text: 'Go for a morning run',
                completed: false,
                priority: 'low',
                category: 'Health',
                dueDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        ];
        
        this.tasks = sampleTasks;
        console.log('✅ Sample tasks created:', this.tasks.length);
        this.saveTasks();
    }
    
    /**
     * Generate unique ID for tasks
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Get application statistics
     */
    getStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
        
        return {
            total: totalTasks,
            completed: completedTasks,
            active: activeTasks,
            completionRate: completionRate + '%'
        };
    }
    
    /**
     * Export tasks as JSON
     */
    exportTasks() {
        const stats = this.getStats();
        const data = {
            tasks: this.tasks,
            statistics: stats,
            exportDate: new Date().toISOString(),
            version: '2.0',
            appVersion: 'Enhanced To-Do List v2.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-tasks-enhanced-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('📊 Tasks and statistics exported successfully!', 'success');
    }
    
    /**
     * Import tasks from JSON file
     */
    importTasks(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.tasks || !Array.isArray(data.tasks)) {
                    throw new Error('Invalid file format');
                }
                
                // Validate and clean tasks
                const validTasks = data.tasks.filter(task => 
                    task && 
                    typeof task.text === 'string' && 
                    typeof task.completed === 'boolean'
                ).map(task => ({
                    ...task,
                    id: task.id || this.generateId(),
                    priority: task.priority || 'medium',
                    dueDate: task.dueDate || null,
                    category: task.category || null,
                    createdAt: task.createdAt || new Date().toISOString(),
                    updatedAt: task.updatedAt || new Date().toISOString(),
                    completedAt: task.completedAt || null
                }));
                
                if (validTasks.length === 0) {
                    throw new Error('No valid tasks found in file');
                }
                
                // Merge with existing tasks
                const existingIds = new Set(this.tasks.map(t => t.id));
                const newTasks = validTasks.filter(t => !existingIds.has(t.id));
                
                this.tasks = [...newTasks, ...this.tasks];
                this.saveTasks();
                this.render();
                this.updateCounts();
                this.updateCategoryFilter();
                
                this.showToast(`📥 Imported ${newTasks.length} tasks successfully!`, 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import tasks. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        this.elements.importFile.val('');
    }
    
    /**
     * Clear all completed tasks
     */
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showToast('No completed tasks to clear', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.selectedTasks.clear();
            this.saveTasks();
            this.render();
            this.updateCounts();
            this.updateCategoryFilter();
            
            this.showToast(`🗑️ ${completedCount} completed task(s) cleared`, 'success');
        }
    }
    
    /**
     * Toggle bulk selection mode
     */
    toggleBulkSelect() {
        this.bulkSelectMode = !this.bulkSelectMode;
        this.selectedTasks.clear();
        
        if (this.bulkSelectMode) {
            this.elements.bulkActions.show();
            this.elements.bulkSelectToggle.addClass('active');
        } else {
            this.elements.bulkActions.hide();
            this.elements.bulkSelectToggle.removeClass('active');
        }
        
        this.render();
        this.updateBulkSelection();
    }
    
    /**
     * Toggle task selection in bulk mode
     */
    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        
        this.updateBulkSelection();
        this.render();
    }
    
    /**
     * Select all visible tasks
     */
    selectAllTasks() {
        if (!this.bulkSelectMode) {
            this.toggleBulkSelect();
        }
        
        const visibleTasks = this.getFilteredTasks();
        visibleTasks.forEach(task => this.selectedTasks.add(task.id));
        
        this.updateBulkSelection();
        this.render();
        
        this.showToast(`Selected ${visibleTasks.length} tasks`, 'info');
    }
    
    /**
     * Update bulk selection UI
     */
    updateBulkSelection() {
        this.elements.selectedCount.text(this.selectedTasks.size);
        
        const hasSelection = this.selectedTasks.size > 0;
        this.elements.bulkComplete.prop('disabled', !hasSelection);
        this.elements.bulkIncomplete.prop('disabled', !hasSelection);
        this.elements.bulkDelete.prop('disabled', !hasSelection);
    }
    
    /**
     * Perform bulk actions
     */
    bulkAction(action) {
        if (this.selectedTasks.size === 0) return;
        
        const selectedTaskIds = Array.from(this.selectedTasks);
        let actionCount = 0;
        
        switch (action) {
            case 'complete':
                selectedTaskIds.forEach(taskId => {
                    const task = this.tasks.find(t => t.id === taskId);
                    if (task && !task.completed) {
                        task.completed = true;
                        task.completedAt = new Date().toISOString();
                        task.updatedAt = new Date().toISOString();
                        actionCount++;
                    }
                });
                this.showToast(`✅ ${actionCount} tasks completed`, 'success');
                break;
                
            case 'incomplete':
                selectedTaskIds.forEach(taskId => {
                    const task = this.tasks.find(t => t.id === taskId);
                    if (task && task.completed) {
                        task.completed = false;
                        task.completedAt = null;
                        task.updatedAt = new Date().toISOString();
                        actionCount++;
                    }
                });
                this.showToast(`↩️ ${actionCount} tasks marked incomplete`, 'info');
                break;
                
            case 'delete':
                if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)?`)) {
                    this.tasks = this.tasks.filter(task => !this.selectedTasks.has(task.id));
                    actionCount = selectedTaskIds.length;
                    this.showToast(`🗑️ ${actionCount} tasks deleted`, 'info');
                }
                break;
        }
        
        if (actionCount > 0) {
            this.selectedTasks.clear();
            this.saveTasks();
            this.render();
            this.updateCounts();
            this.updateBulkSelection();
        }
    }
    
    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        this.elements.taskList.on('dragstart', '.task-item', (e) => {
            this.draggedTask = e.currentTarget.dataset.taskId;
            $(e.currentTarget).addClass('dragging');
        });
        
        this.elements.taskList.on('dragend', '.task-item', (e) => {
            $(e.currentTarget).removeClass('dragging');
            this.draggedTask = null;
            $('.drop-zone').remove();
        });
        
        this.elements.taskList.on('dragover', '.task-item', (e) => {
            e.preventDefault();
            if (this.draggedTask && this.draggedTask !== e.currentTarget.dataset.taskId) {
                this.showDropZone(e.currentTarget);
            }
        });
        
        this.elements.taskList.on('drop', '.drop-zone', (e) => {
            e.preventDefault();
            const targetTaskId = $(e.currentTarget).data('target-task-id');
            this.reorderTask(this.draggedTask, targetTaskId);
        });
    }
    
    /**
     * Show drop zone for drag and drop
     */
    showDropZone(targetElement) {
        $('.drop-zone').remove();
        const $dropZone = $(`
            <div class="drop-zone active" data-target-task-id="${targetElement.dataset.taskId}">
                <i class="bi bi-arrow-down"></i> Drop here to reorder
            </div>
        `);
        $(targetElement).before($dropZone);
    }
    
    /**
     * Reorder tasks via drag and drop
     */
    reorderTask(draggedTaskId, targetTaskId) {
        const draggedIndex = this.tasks.findIndex(t => t.id === draggedTaskId);
        const targetIndex = this.tasks.findIndex(t => t.id === targetTaskId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedTask] = this.tasks.splice(draggedIndex, 1);
            this.tasks.splice(targetIndex, 0, draggedTask);
            
            this.saveTasks();
            this.render();
            
            this.showToast('📋 Task reordered', 'info');
        }
    }
    
    /**
     * Initialize task templates
     */
    initializeTemplates() {
        const templateHtml = this.templates.map(template => `
            <div class="col-6 col-md-4 mb-2">
                <div class="card template-card h-100" data-template="${template.name}">
                    <div class="card-body text-center p-2">
                        <div class="template-icon">${template.icon}</div>
                        <div class="small fw-bold">${template.name}</div>
                        <div class="text-muted" style="font-size: 0.7rem">${template.tasks.length} tasks</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        $('#template-list').html(templateHtml);
        
        // Bind template selection
        $('#template-list').on('click', '.template-card', (e) => {
            const templateName = $(e.currentTarget).data('template');
            this.addTasksFromTemplate(templateName);
        });
    }
    
    /**
     * Add tasks from template
     */
    addTasksFromTemplate(templateName) {
        const template = this.templates.find(t => t.name === templateName);
        if (!template) return;
        
        const newTasks = template.tasks.map(taskText => ({
            id: this.generateId(),
            text: taskText,
            priority: 'medium',
            dueDate: null,
            category: template.name,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
        
        this.tasks = [...newTasks, ...this.tasks];
        this.saveTasks();
        this.render();
        this.updateCounts();
        this.updateCategoryFilter();
        
        // Close modal
        bootstrap.Modal.getInstance($('#templatesModal')[0])?.hide();
        
        this.showToast(`📋 Added ${newTasks.length} tasks from ${template.name}`, 'success');
    }
    
    /**
     * Show templates modal
     */
    showTemplatesModal() {
        const modal = new bootstrap.Modal($('#templatesModal')[0]);
        modal.show();
    }
    
    /**
     * Show statistics modal
     */
    showStatsModal() {
        this.updateStatisticsModal();
        const modal = new bootstrap.Modal($('#statsModal')[0]);
        modal.show();
    }
    
    /**
     * Update statistics in modal
     */
    updateStatisticsModal() {
        const stats = this.getDetailedStats();
        
        // Update metrics
        $('#total-tasks-metric').text(stats.total);
        $('#completion-rate-metric').text(stats.completionRate);
        $('#overdue-tasks-metric').text(stats.overdue);
        $('#avg-completion-metric').text(stats.avgCompletionDays || '-');
        
        // Simple charts using CSS (placeholder for chart library)
        this.createSimpleCharts(stats);
    }
    
    /**
     * Create simple charts (placeholder for chart library)
     */
    createSimpleCharts(stats) {
        // This is a placeholder - in a real app you'd use Chart.js or similar
        const taskCanvas = $('#taskChart')[0];
        const priorityCanvas = $('#priorityChart')[0];
        
        if (taskCanvas && taskCanvas.getContext) {
            const ctx = taskCanvas.getContext('2d');
            ctx.clearRect(0, 0, taskCanvas.width, taskCanvas.height);
            ctx.fillStyle = '#4e73df';
            ctx.fillRect(10, 10, 100, 50);
            ctx.fillStyle = '#28a745';
            ctx.fillRect(10, 70, 80, 40);
            ctx.fillStyle = '#333';
            ctx.font = '12px Poppins';
            ctx.fillText('Active: ' + stats.active, 120, 35);
            ctx.fillText('Completed: ' + stats.completed, 120, 90);
        }
    }
    
    /**
     * Get detailed statistics
     */
    getDetailedStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const overdue = this.tasks.filter(t => this.isOverdue(t)).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) + '%' : '0%';
        
        // Calculate average completion time
        const completedTasks = this.tasks.filter(t => t.completed && t.completedAt);
        let avgCompletionDays = null;
        
        if (completedTasks.length > 0) {
            const totalDays = completedTasks.reduce((sum, task) => {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                const days = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            
            avgCompletionDays = Math.round(totalDays / completedTasks.length);
        }
        
        // Priority distribution
        const priorities = this.tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
        
        // Category distribution
        const categories = this.tasks.reduce((acc, task) => {
            const category = task.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total,
            completed,
            active,
            overdue,
            completionRate,
            avgCompletionDays,
            priorities,
            categories
        };
    }
    
    /**
     * Toggle FAB menu
     */
    toggleFABMenu() {
        const isActive = this.elements.fabMenu.hasClass('active');
        
        if (isActive) {
            this.closeFABMenu();
        } else {
            this.elements.fabMenu.addClass('active');
            this.elements.fabMain.addClass('active');
        }
    }
    
    /**
     * Close FAB menu
     */
    closeFABMenu() {
        this.elements.fabMenu.removeClass('active');
        this.elements.fabMain.removeClass('active');
    }
    
    /**
     * Update category filter dropdown
     */
    updateCategoryFilter() {
        const categories = [...new Set(this.tasks.map(task => task.category).filter(Boolean))];
        
        const categoryHtml = [
            '<li><a class="dropdown-item" href="#" data-category="all">All Categories</a></li>',
            ...categories.map(category => 
                `<li><a class="dropdown-item" href="#" data-category="${category}">${this.escapeHtml(category)}</a></li>`
            )
        ].join('');
        
        this.elements.categoryFilter.html(categoryHtml);
    }
    
    /**
     * Check for due dates and show notifications
     */
    checkDueDates() {
        const today = new Date().toISOString().split('T')[0];
        const dueTodayTasks = this.tasks.filter(task => 
            !task.completed && task.dueDate === today
        );
        
        const overdueTasks = this.tasks.filter(task => this.isOverdue(task));
        
        // Update overdue count
        this.elements.countOverdue.text(overdueTasks.length);
        
        // Show notifications for due today tasks (only once per session)
        if (dueTodayTasks.length > 0 && !sessionStorage.getItem('notified-today')) {
            setTimeout(() => {
                this.showToast(`⏰ ${dueTodayTasks.length} task(s) due today!`, 'warning');
                sessionStorage.setItem('notified-today', 'true');
            }, 2000);
        }
    }
    
    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize the application when DOM is ready
$(document).ready(() => {
    // Create global app instance
    window.todoApp = new TodoApp();
    
    // Add some developer-friendly console methods
    console.log('🚀 Todo App loaded! Try these commands in the console:');
    console.log('todoApp.getStats() - Get app statistics');
    console.log('todoApp.exportTasks() - Export tasks as JSON');
    console.log('todoApp.clearCompleted() - Clear completed tasks');
    
    // Service Worker registration for PWA capabilities (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Silently fail if no service worker available
        });
    }
    
    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
        if (window.todoApp) {
            window.todoApp.showToast('An unexpected error occurred', 'error');
        }
    });
    
    // Handle visibility change for better UX
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.todoApp) {
            // Refresh counts when user returns to tab
            window.todoApp.updateCounts();
        }
    });
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoApp;
}