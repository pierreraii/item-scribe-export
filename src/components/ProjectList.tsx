import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Trash2, Plus } from 'lucide-react';
import type { Project } from '@/types/Project';
import type { ItemInstance } from '@/types/ItemType';

interface ProjectListProps {
  projects: Project[];
  items: ItemInstance[];
  onViewProject: (project: Project) => void;
  onCreateNew: () => void;
  onDeleteProject: (projectId: string) => void;
}

export default function ProjectList({ 
  projects, 
  items, 
  onViewProject, 
  onCreateNew, 
  onDeleteProject 
}: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project => {
    const searchString = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchString) ||
      project.description.toLowerCase().includes(searchString) ||
      project.location.toLowerCase().includes(searchString)
    );
  });

  const getProjectItemCount = (project: Project) => {
    return project.itemIds.length;
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This will not delete the items.')) {
      onDeleteProject(projectId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button
          onClick={onCreateNew}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 transition-all duration-200 focus:shadow-glow"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4">
        {filteredProjects.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'No projects found matching your search.' : 'No projects created yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map(project => (
            <Card 
              key={project.id} 
              className="shadow-card transition-all duration-300 hover:shadow-elegant"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>📍 {project.location}</span>
                      <span>📅 Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="secondary">
                      {getProjectItemCount(project)} items
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => onViewProject(project)}
                        className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}