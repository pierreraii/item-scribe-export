import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, FileSpreadsheet, FolderOpen } from 'lucide-react';
import ItemTypeCreator from '@/components/ItemTypeCreator';
import ItemCreator from '@/components/ItemCreator';
import ItemList from '@/components/ItemList';
import ProjectCreator from '@/components/ProjectCreator';
import ProjectList from '@/components/ProjectList';
import ProjectView from '@/components/ProjectView';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ItemType, ItemInstance } from '@/types/ItemType';
import type { Project } from '@/types/Project';
import { useToast } from '@/hooks/use-toast';

type View = 'home' | 'create-type' | 'create-item' | 'view-items' | 'create-project' | 'view-projects' | 'view-project';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [itemTypes, setItemTypes] = useLocalStorage<ItemType[]>('itemTypes', []);
  const [items, setItems] = useLocalStorage<ItemInstance[]>('items', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const { toast } = useToast();

  const selectedItemType = itemTypes.find(type => type.id === selectedTypeId);

  const handleSaveItemType = (newType: ItemType) => {
    setItemTypes([...itemTypes, newType]);
    setCurrentView('home');
    toast({
      title: "Item type created",
      description: `${newType.name} has been created successfully.`,
    });
  };

  const handleSaveItem = (newItem: ItemInstance) => {
    setItems([...items, newItem]);
    setCurrentView('view-items');
    toast({
      title: "Item created",
      description: `New ${newItem.typeName} has been created successfully.`,
    });
  };

  const handleCreateItem = (typeId: string) => {
    setSelectedTypeId(typeId);
    setCurrentView('create-item');
  };

  const handleDeleteItems = (itemIds: string[]) => {
    setItems(items.filter(item => !itemIds.includes(item.id)));
    // Also remove these items from all projects
    setProjects(projects.map(project => ({
      ...project,
      itemIds: project.itemIds.filter(id => !itemIds.includes(id)),
      updatedAt: new Date().toISOString()
    })));
    toast({
      title: "Items deleted",
      description: `${itemIds.length} item(s) have been deleted.`,
    });
  };

  const handleSaveProject = (newProject: Project) => {
    setProjects([...projects, newProject]);
    setCurrentView('view-projects');
    toast({
      title: "Project created",
      description: `${newProject.name} has been created successfully.`,
    });
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('view-project');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    toast({
      title: "Project updated",
      description: `${updatedProject.name} has been updated.`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast({
      title: "Project deleted",
      description: "Project has been deleted successfully.",
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'create-type':
        return (
          <ItemTypeCreator
            onSave={handleSaveItemType}
            onCancel={() => setCurrentView('home')}
          />
        );
      
      case 'create-item':
        if (!selectedItemType) {
          setCurrentView('home');
          return null;
        }
        return (
          <ItemCreator
            itemType={selectedItemType}
            onSave={handleSaveItem}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'view-items':
        return (
          <ItemList
            items={items}
            itemTypes={itemTypes}
            onCreateNew={handleCreateItem}
            onDeleteItems={handleDeleteItems}
          />
        );
      
      case 'create-project':
        return (
          <ProjectCreator
            onSave={handleSaveProject}
            onBack={() => setCurrentView('home')}
          />
        );
      
      case 'view-projects':
        return (
          <ProjectList
            projects={projects}
            items={items}
            onViewProject={handleViewProject}
            onCreateNew={() => setCurrentView('create-project')}
            onDeleteProject={handleDeleteProject}
          />
        );
      
      case 'view-project':
        if (!selectedProject) {
          setCurrentView('view-projects');
          return null;
        }
        return (
          <ProjectView
            project={selectedProject}
            allItems={items}
            itemTypes={itemTypes}
            onBack={() => setCurrentView('view-projects')}
            onUpdateProject={handleUpdateProject}
          />
        );
      
      default:
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Dynamic Item Manager
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create custom item types, manage your data, and export to Excel with ease.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card transition-all duration-300 hover:shadow-elegant group cursor-pointer"
                    onClick={() => setCurrentView('create-project')}>
                <CardHeader className="text-center bg-gradient-subtle">
                  <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Create Project</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Create a new project to organize and manage related items.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card transition-all duration-300 hover:shadow-elegant group cursor-pointer"
                    onClick={() => setCurrentView('view-projects')}>
                <CardHeader className="text-center bg-gradient-subtle">
                  <div className="w-16 h-16 mx-auto bg-gradient-accent rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <FolderOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Manage Projects</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    View and manage all your projects and their items.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card transition-all duration-300 hover:shadow-elegant group cursor-pointer"
                    onClick={() => setCurrentView('view-items')}>
                <CardHeader className="text-center bg-gradient-subtle">
                  <div className="w-16 h-16 mx-auto bg-gradient-accent rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Manage Items</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    View, search, and manage all your created items in one place.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card transition-all duration-300 hover:shadow-elegant group cursor-pointer"
                    onClick={() => setCurrentView('create-type')}>
                <CardHeader className="text-center bg-gradient-subtle">
                  <div className="w-16 h-16 mx-auto bg-success rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <FileSpreadsheet className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Item Types</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Define new types of items with custom fields and properties.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Projects
                    <Badge variant="secondary">{projects.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <p className="text-muted-foreground">No projects created yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {projects.slice(0, 3).map(project => (
                        <div key={project.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="font-medium">{project.name}</span>
                          <Badge variant="outline">{project.itemIds.length} items</Badge>
                        </div>
                      ))}
                      {projects.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{projects.length - 3} more projects
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Item Types
                    <Badge variant="secondary">{itemTypes.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {itemTypes.length === 0 ? (
                    <p className="text-muted-foreground">No item types created yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {itemTypes.slice(0, 3).map(type => (
                        <div key={type.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="font-medium">{type.name}</span>
                          <Badge variant="outline">{type.fields.length} fields</Badge>
                        </div>
                      ))}
                      {itemTypes.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{itemTypes.length - 3} more types
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Total Items
                    <Badge variant="secondary">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-muted-foreground">No items created yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {itemTypes.map(type => {
                        const typeItems = items.filter(item => item.typeId === type.id);
                        if (typeItems.length === 0) return null;
                        
                        return (
                          <div key={type.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="font-medium">{type.name}</span>
                            <Badge variant="outline">{typeItems.length} items</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Create Actions */}
            {itemTypes.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Quick Create</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {itemTypes.map(type => (
                      <Button
                        key={type.id}
                        onClick={() => handleCreateItem(type.id)}
                        variant="outline"
                        className="transition-all duration-200 hover:shadow-card"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New {type.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {currentView !== 'home' && (
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('home')}
              className="transition-all duration-200 hover:shadow-card"
            >
              ← Back to Home
            </Button>
          </div>
        )}
        
        {renderView()}
      </div>
    </div>
  );
};

export default Index;