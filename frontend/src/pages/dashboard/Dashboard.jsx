import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiClock, FiAlertCircle, FiList } from "react-icons/fi";
import { taskAPI, projectAPI } from "../../api/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        taskAPI.getAll(),
        projectAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  ).length;

  const recentTasks = tasks.slice(0, 6);

  const projectsWithProgress = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.project?._id === project._id);
    const completedCount = projectTasks.filter((t) => t.status === "done").length;
    const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
    return { ...project, taskCount: projectTasks.length, progress };
  });

  const stats = [
    { title: "Total Tasks", value: totalTasks, icon: FiList, textColor: "text-violet-400", bgColor: "bg-violet-500/10" },
    { title: "Completed", value: completedTasks, icon: FiCheckCircle, textColor: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    { title: "In Progress", value: inProgressTasks, icon: FiClock, textColor: "text-amber-400", bgColor: "bg-amber-500/10" },
    { title: "Overdue", value: overdueTasks, icon: FiAlertCircle, textColor: "text-red-400", bgColor: "bg-red-500/10" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "done": return "bg-emerald-500/15 text-emerald-400";
      case "in-progress": return "bg-violet-500/15 text-violet-400";
      case "todo": return "bg-gray-700 text-gray-400";
      default: return "bg-gray-700 text-gray-400";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-500/15 text-red-400";
      case "medium": return "bg-amber-500/15 text-amber-400";
      case "low": return "bg-emerald-500/15 text-emerald-400";
      default: return "bg-gray-700 text-gray-400";
    }
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-600 border-t-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl p-5 sm:p-6 bg-dark-800 border border-dark-600 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">Good to see you,</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.name} 👋</h1>
        </div>
        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-500/30 items-center justify-center">
          <span className="text-primary-400 text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-5 hover:border-dark-500 transition-colors">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`${stat.textColor} text-xl`} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recent Tasks</h2>
            <button onClick={() => navigate('/tasks')} className="text-sm text-primary-400 hover:text-primary-300 font-medium">
              View All
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-sm">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task._id} className="border border-dark-600 rounded-lg p-3 sm:p-4 hover:border-primary-600/40 hover:bg-dark-700 transition-all cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-gray-200 text-sm sm:text-base">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full self-start ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                    <span className="text-gray-500 truncate">{task.project?.title || "No project"}</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                      <span className="text-gray-600 text-xs">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Overview */}
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-bold text-white mb-4">Project Overview</h2>
          {projectsWithProgress.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-sm">No projects yet</p>
          ) : (
            <div className="space-y-5">
              {projectsWithProgress.slice(0, 5).map((project) => (
                <div key={project._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-300 text-sm truncate pr-2">{project.title}</h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{project.taskCount} tasks</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">{project.progress}% complete</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
