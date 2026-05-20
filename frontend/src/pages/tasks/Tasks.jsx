import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { taskAPI, projectAPI, userAPI } from "../../api/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCalendar, FiFilter } from "react-icons/fi";
import { STATUS_COLORS, PRIORITY_COLORS } from "../../utils/constants";

const Tasks = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", projectId: "" });
  const [formData, setFormData] = useState({
    title: "", description: "", project: "", assignedTo: "",
    priority: "medium", status: "todo", dueDate: "",
  });

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        taskAPI.getAll(filters), projectAPI.getAll(), userAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title, description: task.description || "",
        project: task.project?._id || "", assignedTo: task.assignedTo?._id || "",
        priority: task.priority, status: task.status,
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    } else {
      setEditingTask(null);
      setFormData({ title: "", description: "", project: "", assignedTo: "", priority: "medium", status: "todo", dueDate: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: "", description: "", project: "", assignedTo: "", priority: "medium", status: "todo", dueDate: "" });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, assignedTo: formData.assignedTo || undefined, dueDate: formData.dueDate || undefined };
      if (editingTask) {
        await taskAPI.update(editingTask._id, payload);
        toast.success("Task updated successfully");
      } else {
        await taskAPI.create(payload);
        toast.success("Task created successfully");
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      toast.success("Status updated");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskAPI.delete(id);
      toast.success("Task deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task");
    }
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "done") return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-600 border-t-primary-500"></div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 bg-dark-700 border border-dark-500 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-600 text-sm";

  return (
    <div className="space-y-6">
      {/* Role Info Banner for Members */}
      {!isAdmin && (
        <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-primary-400 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary-300">Member View</h3>
              <p className="text-sm text-gray-400 mt-1">You can view all tasks and update the status of tasks assigned to you.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your tasks</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors text-sm w-full sm:w-auto"
          >
            <FiPlus /> Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="text-gray-500" size={14} />
          <h3 className="font-medium text-gray-400 text-sm">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select name="status" value={filters.status} onChange={handleFilterChange} className={inputCls}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange} className={inputCls}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className={inputCls}>
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-500 text-base sm:text-lg">No tasks found</p>
          {isAdmin && (
            <button onClick={() => handleOpenModal()} className="mt-4 text-primary-400 hover:text-primary-300 font-medium text-sm">
              Create your first task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tasks.map((task) => (
            <div key={task._id} className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-5 hover:border-primary-600/40 transition-colors">
              <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className="text-base font-semibold text-gray-200 flex-1 min-w-0 break-words">{task.title}</h3>
                {isAdmin && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleOpenModal(task)} className="text-gray-600 hover:text-primary-400 transition-colors p-1" aria-label="Edit task">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="text-gray-600 hover:text-red-400 transition-colors p-1" aria-label="Delete task">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {task.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
              )}

              <div className="text-xs text-gray-500 mb-3">
                <span className="font-medium text-gray-400">Project:</span>{" "}
                <span className="truncate inline-block max-w-[200px] align-bottom">{task.project?.title || "No project"}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                {(isAdmin || task.assignedTo?._id === user._id) ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer bg-dark-700 text-gray-300 focus:outline-none`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs pt-3 border-t border-dark-600">
                <div className="flex items-center gap-1 text-gray-500">
                  <FiCalendar size={12} />
                  <span className={isOverdue(task.dueDate, task.status) ? "text-red-400 font-medium" : ""}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
                {task.assignedTo && (
                  <span className="text-gray-600 truncate">{task.assignedTo.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">{editingTask ? "Edit Task" : "Create Task"}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-300 p-1 flex-shrink-0" aria-label="Close modal">
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Task Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputCls} placeholder="Enter task title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputCls} placeholder="Enter task description" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Project *</label>
                  <select name="project" value={formData.project} onChange={handleChange} required className={inputCls}>
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Assign To</label>
                  <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className={inputCls}>
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className={inputCls}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 text-sm border border-dark-500 text-gray-400 rounded-lg hover:bg-dark-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors">
                  {editingTask ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
