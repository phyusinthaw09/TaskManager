'use client';
// .env.local ထဲက URL ကို ယူသုံးမည်၊ မရှိပါက localhost ကို Default ထားမည်
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7283';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taskmanager-1-cpvu.onrender.com';
import { useState, useEffect } from 'react';

interface TaskItem {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // 📌 1. Frontend Validation & Error Handling State များ
  const [titleError, setTitleError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // 💡 Toast Message ပြသပေးမည့် Helper Function
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000); // 3 စက္ကန့်အကြာတွင် အလိုအလျောက် ပျောက်သွားမည်
  };

  // 1. Task List ဆွဲယူခြင်း (GET) + Error Handling
  const fetchTasks = async () => {
    setApiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/TaskItems`);
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('API Error:', error);
      setApiError('Backend API ချိတ်ဆက်၍ မရပါ။ Server Run ထားခြင်း ရှိမရှိ စစ်ဆေးပါ။');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStartEdit = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setTitleError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setTitleError('');
  };

  // 📌 2. Client-side Form Validation & Submit Logic
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔍 Input Validation စစ်ဆေးခြင်း
    if (!title.trim()) {
      setTitleError('Task ခေါင်းစဉ် မဖြစ်မနေ ထည့်သွင်းရပါမည်။');
      return;
    }
    if (title.trim().length < 3) {
      setTitleError('ခေါင်းစဉ်သည် အနည်းဆုံး စာလုံး ၃ လုံး ရှိရပါမည်။');
      return;
    }
    setTitleError('');

    setSubmitting(true);
    try {
      if (editingTaskId !== null) {
        // PUT Request
        const currentTask = tasks.find((t) => t.id === editingTaskId);
        const response = await fetch(`${API_BASE_URL}/api/TaskItems/${editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTaskId,
            title: title,
            description: description,
            isCompleted: currentTask ? currentTask.isCompleted : false,
          }),
        });

        if (response.ok) {
          showToast('Task ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ!', 'success');
          handleCancelEdit();
          fetchTasks();
        } else {
          showToast('ပြင်ဆင်မှု မအောင်မြင်ပါ။ မမှန်ကန်သော Data ဖြစ်နိုင်ပါသည်။', 'error');
        }
      } else {
        // POST Request (Fixed with backticks)
        const response = await fetch(`${API_BASE_URL}/api/TaskItems`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title,
            description: description,
            isCompleted: false,
          }),
        });

        if (response.ok) {
          showToast('Task အသစ် ထည့်သွင်းပြီးပါပြီ!', 'success');
          setTitle('');
          setDescription('');
          fetchTasks();
        } else {
          showToast('Task ထည့်သွင်းမှု မအောင်မြင်ပါ။', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Network Error: Server နှင့် ချိတ်ဆက်၍ မရပါ။', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Toggle Status (PUT)
  const handleToggleComplete = async (task: TaskItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/TaskItems/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          title: task.title,
          description: task.description,
          isCompleted: !task.isCompleted,
        }),
      });

      if (response.ok) {
        showToast(task.isCompleted ? 'Pending သို့ ပြောင်းလိုက်ပါပြီ' : 'Completed သို့ ပြောင်းလိုက်ပါပြီ');
        fetchTasks();
      } else {
        showToast('Status ပြောင်းလဲ၍ မရပါ', 'error');
      }
    } catch (error) {
      showToast('Network Error ဖြစ်ပွားခဲ့သည်', 'error');
    }
  };

  // 4. Delete Task (DELETE)
  const handleDeleteTask = async (id: number) => {
    if (!confirm('ဒီ Task ကို တကယ် ဖျက်မှာ သေချာပါသလား?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/TaskItems/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Task ကို ဖျက်ထုတ်ပြီးပါပြီ', 'success');
        if (editingTaskId === id) handleCancelEdit();
        fetchTasks();
      } else {
        showToast('Task ဖျက်ထုတ်၍ မရပါ', 'error');
      }
    } catch (error) {
      showToast('Network Error ဖြစ်ပွားခဲ့သည်', 'error');
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? task.isCompleted
        : !task.isCompleted;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 relative">
      {/* 📌 Floating Toast Notification (ညာဘက်အပေါ်ထောင့်) */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm transition-all z-50 flex items-center gap-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
          {toastMessage.text}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Task Manager</h1>
            <p className="text-slate-500 text-sm mt-1">.NET Core API + Next.js Frontend</p>
          </div>
        </div>

        {/* 📌 API Network Error ဖြစ်ပါက ပြသပေးမည့် Banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🚫</span>
              <span>{apiError}</span>
            </div>
            <button
              onClick={fetchTasks}
              className="bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmitForm} className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingTaskId !== null ? '✏️ Edit Task' : '➕ Add New Task'}
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                placeholder="Task ခေါင်းစဉ် ရိုက်ထည့်ပါ"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-slate-800 ${
                  titleError
                    ? 'border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
              />
              {titleError && <p className="text-rose-500 text-xs mt-1 font-medium">{titleError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="အသေးစိတ် အကြောင်းအရာ ရိုက်ထည့်ပါ"
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="flex gap-2 justify-end">
              {editingTaskId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-white ${
                  editingTaskId !== null ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {submitting ? 'သိမ်းဆည်းနေသည်...' : editingTaskId !== null ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </div>
        </form>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Task ရှာဖွေပါ..."
              className="w-full pl-3 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto justify-center">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({tasks.filter((t) => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({tasks.filter((t) => t.isCompleted).length})
            </button>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center py-10 text-slate-500">Data များကို ရယူနေပါသည်...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500">
            {searchTerm || statusFilter !== 'all' ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော Task မရှိပါ။' : 'မည်သည့် Task မှ မရှိသေးပါ။'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 bg-white rounded-xl border shadow-sm transition-all flex items-center justify-between ${
                  editingTaskId === task.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleComplete(task)}
                    className="mt-1.5 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <h3
                      className={`font-semibold text-lg cursor-pointer ${
                        task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                      onClick={() => handleToggleComplete(task)}
                    >
                      {task.title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      task.isCompleted
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {task.isCompleted ? 'Completed' : 'Pending'}
                  </span>

                  <button
                    onClick={() => handleStartEdit(task)}
                    className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}