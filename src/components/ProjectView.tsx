import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Search, Plus, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Project } from '@/types/Project';
import type { ItemInstance, ItemType } from '@/types/ItemType';

interface ProjectViewProps {
  project: Project;
  allItems: ItemInstance[];
  itemTypes: ItemType[];
  onBack: () => void;
  onUpdateProject: (updatedProject: Project) => void;
}

export default function ProjectView({ 
  project, 
  allItems, 
  itemTypes, 
  onBack, 
  onUpdateProject 
}: ProjectViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isAddingItems, setIsAddingItems] = useState(false);

  // Get items that belong to this project
  const projectItems = allItems.filter(item => project.itemIds.includes(item.id));
  
  // Get items that are NOT in this project (for adding)
  const availableItems = allItems.filter(item => !project.itemIds.includes(item.id));

  const filteredProjectItems = useMemo(() => {
    if (!searchTerm) return projectItems;
    
    return projectItems.filter(item => {
      const searchString = searchTerm.toLowerCase();
      
      // Search in type name
      if (item.typeName.toLowerCase().includes(searchString)) return true;
      
      // Search in item data
      return Object.values(item.data).some(value => 
        String(value).toLowerCase().includes(searchString)
      );
    });
  }, [projectItems, searchTerm]);

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredProjectItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredProjectItems.map(item => item.id)));
    }
  };

  const removeSelectedItems = () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Are you sure you want to remove ${selectedItems.size} item(s) from this project?`)) {
      const updatedProject = {
        ...project,
        itemIds: project.itemIds.filter(id => !selectedItems.has(id)),
        updatedAt: new Date().toISOString()
      };
      
      onUpdateProject(updatedProject);
      setSelectedItems(new Set());
    }
  };

  const addItemsToProject = (itemIds: string[]) => {
    const updatedProject = {
      ...project,
      itemIds: [...project.itemIds, ...itemIds],
      updatedAt: new Date().toISOString()
    };
    
    onUpdateProject(updatedProject);
    setIsAddingItems(false);
  };

  const exportProject = () => {
    if (projectItems.length === 0) return;

    // Group items by type
    const groupedByType = projectItems.reduce((acc, item) => {
      if (!acc[item.typeName]) {
        acc[item.typeName] = [];
      }
      acc[item.typeName].push(item);
      return acc;
    }, {} as Record<string, ItemInstance[]>);

    const workbook = XLSX.utils.book_new();

    // Add project info sheet
    const projectInfo = [
      ['Project Name', project.name],
      ['Description', project.description],
      ['Location', project.location],
      ['Created At', new Date(project.createdAt).toLocaleDateString()],
      ['Updated At', new Date(project.updatedAt).toLocaleDateString()],
      ['Total Items', projectItems.length]
    ];
    const projectSheet = XLSX.utils.aoa_to_sheet(projectInfo);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Info');

    // Add sheets for each item type
    Object.entries(groupedByType).forEach(([typeName, typeItems]) => {
      const itemType = itemTypes.find(type => type.name === typeName);
      if (!itemType) return;

      const headers = ['ID', 'Created At', ...itemType.fields.map(field => field.name)];
      const rows = typeItems.map(item => [
        item.id,
        new Date(item.createdAt).toLocaleDateString(),
        ...itemType.fields.map(field => item.data[field.id] || '')
      ]);

      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Auto-size columns
      const colWidths = headers.map((header, i) => {
        const maxLength = Math.max(
          header.length,
          ...rows.map(row => String(row[i] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, typeName.slice(0, 31));
    });

    XLSX.writeFile(workbook, `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getItemTypeById = (typeId: string) => {
    return itemTypes.find(type => type.id === typeId);
  };

  const formatFieldValue = (value: any, field: any) => {
    if (field.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }
    return String(value || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="transition-all duration-200 hover:shadow-card"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      {/* Project Header */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-subtle">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <p className="text-muted-foreground mt-2">{project.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span>📍 {project.location}</span>
                <span>📅 Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <Badge variant="secondary">{projectItems.length} items</Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isAddingItems} onOpenChange={setIsAddingItems}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Items
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Items to Project</DialogTitle>
                    <DialogDescription>
                      Select items to add to this project
                    </DialogDescription>
                  </DialogHeader>
                  <AddItemsDialog 
                    availableItems={availableItems}
                    itemTypes={itemTypes}
                    onAddItems={addItemsToProject}
                  />
                </DialogContent>
              </Dialog>
              <Button 
                onClick={exportProject}
                variant="outline"
                disabled={projectItems.length === 0}
                className="transition-all duration-200 hover:shadow-card"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Project
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items in project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:shadow-glow"
          />
        </div>
        
        {selectedItems.size > 0 && (
          <Button
            onClick={removeSelectedItems}
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove ({selectedItems.size})
          </Button>
        )}
      </div>

      {/* Items Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {filteredProjectItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'No items found matching your search.' : 'No items in this project yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.size === filteredProjectItems.length && filteredProjectItems.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjectItems.map(item => {
                    const itemType = getItemTypeById(item.typeId);
                    if (!itemType) return null;

                    return (
                      <TableRow 
                        key={item.id}
                        className={selectedItems.has(item.id) ? 'bg-primary/5' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.typeName}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-w-lg">
                            {itemType.fields.slice(0, 3).map(field => {
                              const value = item.data[field.id];
                              if (!value && value !== 0) return null;
                              
                              return (
                                <div key={field.id} className="text-sm">
                                  <span className="font-medium text-muted-foreground">{field.name}:</span>
                                  <span className="ml-1">{formatFieldValue(value, field)}</span>
                                </div>
                              );
                            })}
                            {itemType.fields.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{itemType.fields.length - 3} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-component for adding items dialog
function AddItemsDialog({ 
  availableItems, 
  itemTypes, 
  onAddItems 
}: {
  availableItems: ItemInstance[];
  itemTypes: ItemType[];
  onAddItems: (itemIds: string[]) => void;
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = availableItems.filter(item => {
    const searchString = searchTerm.toLowerCase();
    return (
      item.typeName.toLowerCase().includes(searchString) ||
      Object.values(item.data).some(value => 
        String(value).toLowerCase().includes(searchString)
      )
    );
  });

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleAddItems = () => {
    onAddItems(Array.from(selectedItems));
    setSelectedItems(new Set());
  };

  const getItemTypeById = (typeId: string) => {
    return itemTypes.find(type => type.id === typeId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search available items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? 'No items found matching your search.' : 'No available items to add.'}
          </p>
        ) : (
          filteredItems.map(item => {
            const itemType = getItemTypeById(item.typeId);
            if (!itemType) return null;

            return (
              <div 
                key={item.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedItems.has(item.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{item.typeName}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {itemType.fields.slice(0, 4).map(field => {
                        const value = item.data[field.id];
                        if (!value && value !== 0) return null;
                        
                        return (
                          <div key={field.id} className="text-sm">
                            <span className="font-medium text-muted-foreground">{field.name}:</span>
                            <span className="ml-1">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          onClick={handleAddItems}
          disabled={selectedItems.size === 0}
          className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          Add {selectedItems.size} Item(s)
        </Button>
      </div>
    </div>
  );
}