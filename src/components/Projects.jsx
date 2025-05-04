import React, { useEffect, useState } from "react";
import { Link, Link2, Plus, Users, Trash2, Search, Calendar, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SpotlightCard from "./ReactBeats/SpotLightCard";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function Project() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "collaborators") return b.users.length - a.users.length;
      return 0;
    });

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/projects/create`,
        { name: projectName },
        { withCredentials: true }
      );
      // console.log("Project created");
      // console.log(res.data);
      setProjects([...projects , res.data]);
      toast.success("Project Created");
      
      setProjectName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  //fetch all the projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/projects/all`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setProjects(response.data.projects);
          // console.log(response.data.projects[0])
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Failed to fetch projects");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const deleteProject = async (id) => {
    if (!id) return toast.error("Invalid project ID");
  
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/projects/delete/${id}`,
        { withCredentials: true }
      );
  
      if (data?.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project deleted successfully!");
      } else {
        toast.error(data?.message || "Failed to delete project");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Server error");
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and collaborate on your projects
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl">
                <Plus size={20} />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Create New Project
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={createProject} className="mt-4">
                <div className="mb-6">
                  <label
                    htmlFor="project-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Project Name
                  </label>
                  <input
                    id="project-name"
                    onChange={(e) => setProjectName(e.target.value)}
                    value={projectName}
                    type="text"
                    placeholder="Enter project name"
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    Create Project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={20} />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Project Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("collaborators")}>
                Most Collaborators
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Projects Grid with Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProjects.map((project, index) => (
          <div
            key={project._id}
            className="group relative animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SpotlightCard 
              className="h-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200"
              spotlightColor="rgba(59, 130, 246, 0.1)"
            >
              <div 
                onClick={() => navigate(`/project/${project._id}`, { state: { project } })}
                className="p-6 cursor-pointer h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      {project.name}
                    </h2>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span className="text-sm">
                          {project.users.length} {project.users.length === 1 ? 'Collaborator' : 'Collaborators'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span className="text-sm">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this project?')) {
                          deleteProject(project._id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      Delete Project
                    </Button>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {projects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start collaborating with your team
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Project
            </Button>
          </div>
        </div>
      )}

      {/* No Results State */}
      {filteredProjects.length === 0 && projects.length > 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matching projects
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSortBy("newest");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Project;
