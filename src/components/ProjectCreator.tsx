import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
import type { Project } from '@/types/Project';

interface ProjectCreatorProps {
  onSave: (project: Project) => void;
  onBack: () => void;
}

export default function ProjectCreator({ onSave, onBack }: ProjectCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      itemIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newProject);
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
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Project</h1>
      </div>

      <Card className="shadow-card transition-all duration-300 hover:shadow-elegant">
        <CardHeader className="bg-gradient-subtle">
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2">
              <span>Project Name</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter project name"
              className={`transition-all duration-200 ${errors.name ? 'border-destructive' : 'focus:shadow-glow'}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter project description"
              className="transition-all duration-200 focus:shadow-glow min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <span>Location</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter project location"
              className={`transition-all duration-200 ${errors.location ? 'border-destructive' : 'focus:shadow-glow'}`}
            />
            {errors.location && (
              <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
                {errors.location}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Project
            </Button>
            <Button variant="outline" onClick={onBack} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}