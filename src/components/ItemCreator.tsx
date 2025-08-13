import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
import type { ItemType, ItemInstance } from '@/types/ItemType';

interface ItemCreatorProps {
  itemType: ItemType;
  onSave: (item: ItemInstance) => void;
  onBack: () => void;
}

export default function ItemCreator({ itemType, onSave, onBack }: ItemCreatorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    itemType.fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newItem: ItemInstance = {
      id: `item_${Date.now()}`,
      typeId: itemType.id,
      typeName: itemType.name,
      data: formData,
      createdAt: new Date().toISOString()
    };

    onSave(newItem);
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={`transition-all duration-200 ${error ? 'border-destructive' : 'focus:shadow-glow'}`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            className={`transition-all duration-200 ${error ? 'border-destructive' : 'focus:shadow-glow'}`}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`transition-all duration-200 ${error ? 'border-destructive' : 'focus:shadow-glow'}`}
          />
        );
      
      case 'select':
        return (
          <Select value={value} onValueChange={(value) => handleInputChange(field.id, value)}>
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-elegant">
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return null;
    }
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
        <h1 className="text-2xl font-bold">Create New {itemType.name}</h1>
      </div>

      <Card className="shadow-card transition-all duration-300 hover:shadow-elegant">
        <CardHeader className="bg-gradient-subtle">
          <CardTitle>New {itemType.name} Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6">
            {itemType.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="flex items-center space-x-2">
                  <span>{field.name}</span>
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Item
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