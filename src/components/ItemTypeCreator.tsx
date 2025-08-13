import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save } from 'lucide-react';
import type { ItemType, FieldDefinition } from '@/types/ItemType';

interface ItemTypeCreatorProps {
  onSave: (itemType: ItemType) => void;
  onCancel: () => void;
}

export default function ItemTypeCreator({ onSave, onCancel }: ItemTypeCreatorProps) {
  const [typeName, setTypeName] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [currentField, setCurrentField] = useState<Partial<FieldDefinition>>({
    name: '',
    type: 'text',
    required: false,
    options: []
  });
  const [selectOptions, setSelectOptions] = useState('');

  const addField = () => {
    if (!currentField.name) return;

    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      name: currentField.name,
      type: currentField.type || 'text',
      required: currentField.required || false,
      options: currentField.type === 'select' && selectOptions 
        ? selectOptions.split(',').map(opt => opt.trim()).filter(Boolean)
        : undefined
    };

    setFields([...fields, newField]);
    setCurrentField({ name: '', type: 'text', required: false, options: [] });
    setSelectOptions('');
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleSave = () => {
    if (!typeName || fields.length === 0) return;

    const newItemType: ItemType = {
      id: `type_${Date.now()}`,
      name: typeName,
      fields,
      createdAt: new Date().toISOString()
    };

    onSave(newItemType);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card transition-all duration-300 hover:shadow-elegant">
        <CardHeader className="bg-gradient-subtle">
          <CardTitle className="text-xl font-semibold">Create New Item Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="typeName">Item Type Name</Label>
            <Input
              id="typeName"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="e.g., Products, Contacts, Tasks"
              className="transition-all duration-200 focus:shadow-glow"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add Fields</h3>
            
            <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Field Name</Label>
                  <Input
                    id="fieldName"
                    value={currentField.name}
                    onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
                    placeholder="e.g., Name, Price, Date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select 
                    value={currentField.type} 
                    onValueChange={(value: any) => setCurrentField({ ...currentField, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-elegant">
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Select (Dropdown)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentField.type === 'select' && (
                <div className="space-y-2">
                  <Label htmlFor="selectOptions">Options (comma-separated)</Label>
                  <Input
                    id="selectOptions"
                    value={selectOptions}
                    onChange={(e) => setSelectOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={currentField.required}
                  onCheckedChange={(checked) => 
                    setCurrentField({ ...currentField, required: !!checked })
                  }
                />
                <Label htmlFor="required">Required field</Label>
              </div>

              <Button 
                onClick={addField} 
                disabled={!currentField.name}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>

          {fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fields Added</h3>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{field.name}</span>
                      <Badge variant="secondary">{field.type}</Badge>
                      {field.required && <Badge variant="outline">Required</Badge>}
                      {field.options && (
                        <Badge variant="outline">
                          {field.options.length} options
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!typeName || fields.length === 0}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Item Type
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}