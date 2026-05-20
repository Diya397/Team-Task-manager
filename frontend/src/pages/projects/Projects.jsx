import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { projectAPI, userAPI } from "../../api/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers, FiUserPlus } from "react-icons/fi";

const Projects = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", status: "active" });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const [projectsRes, usersRes] = await Promise.all([projectAPI.getAll(), userAPI.getAll()]);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ title: project.title, description: project.description || "", status: project.status });
    } else {
      setEditingProject(null);
      setFormData({ title: "", description: "", status: "active" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ title: "", description: "", status: "active" });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectAPI.update(editingProject._id, formData);
        toast.success("Project updated successfully");
      } else {
        await projectAPI.create(formData);
        toast.success("Project created successfully");
      }
      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectAPI.delete(id);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project");
    }
  };

  const handleOpenMembersModal = (project) => { setSelectedProject(project); setShowMembersModal(true); };
  const handleCloseMembersModal = () => { setShowMembersModal(false); setSelectedProject(null); };

  const handleAddMember = async (userId) => {
    try {
      await projectAPI.addMember(selectedProject._id, userId);
      toast.success("Member added successfully");
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectAPI.removeMember(selectedProject._id, userId);
      toast.success("Member removed successfully");
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove member");
    }
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
              <p className="text-sm text-gray-400 mt-1">You can view projects that you're a member of. Contact an admin to create or modify projects.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team projects</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors text-sm w-full sm:w-auto"
          >
            <FiPlus /> Create Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-500 text-base sm:text-lg">No projects yet</p>
          {isAdmin && (
            <button onClick={() => handleOpenModal()} className="mt-4 text-primary-400 hover:text-primary-300 font-medium text-sm">
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-6 hover:border-primary-600/40 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">{project.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                    project.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-700 text-gray-400"
                  }`}>
                    {project.status}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => handleOpenModal(project)} className="text-gray-500 hover:text-primary-400 transition-colors p-1" aria-label="Edit project">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="text-gray-500 hover:text-red-400 transition-colors p-1" aria-label="Delete project">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description || "No description"}</p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <FiUsers size={14} />
                  <span>{project.members?.length || 0} members</span>
                </div>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleOpenMembersModal(project)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-700 border border-dark-500 text-gray-300 rounded-lg hover:border-primary-500/50 hover:text-primary-400 transition-colors text-xs font-medium"
                >
                  <FiUserPlus size={14} /> Manage Members
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">{editingProject ? "Edit Project" : "Create Project"}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-300 p-1" aria-label="Close modal">
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Project Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputCls} placeholder="Enter project title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputCls} placeholder="Enter project description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 text-sm border border-dark-500 text-gray-400 rounded-lg hover:bg-dark-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors">
                  {editingProject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white truncate pr-2">Manage Members — {selectedProject.title}</h2>
              <button onClick={handleCloseMembersModal} className="text-gray-500 hover:text-gray-300 p-1 flex-shrink-0" aria-label="Close modal">
                <FiX size={22} />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Current Members ({selectedProject.members?.length || 0})
              </h3>
              {selectedProject.members?.length === 0 ? (
                <p className="text-gray-600 text-sm">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {selectedProject.members?.map((member) => (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-dark-700 border border-dark-500 rounded-lg gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-200 text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                      <button onClick={() => handleRemoveMember(member._id)} className="text-red-400 hover:text-red-300 text-xs font-medium whitespace-nowrap">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Members</h3>
              <div className="space-y-2">
                {users
                  .filter((u) => !selectedProject.members?.some((m) => m._id === u._id))
                  .map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-dark-700 border border-dark-500 rounded-lg gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-200 text-sm truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email} · {u.role}</p>
                      </div>
                      <button onClick={() => handleAddMember(u._id)} className="text-primary-400 hover:text-primary-300 text-xs font-medium whitespace-nowrap">
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-6">
              <button onClick={handleCloseMembersModal} className="w-full px-4 py-2 text-sm bg-dark-700 border border-dark-500 text-gray-400 rounded-lg hover:bg-dark-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
