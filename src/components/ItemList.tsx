import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Plus, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { ItemInstance, ItemType } from '@/types/ItemType';

interface ItemListProps {
  items: ItemInstance[];
  itemTypes: ItemType[];
  onCreateNew: (typeId: string) => void;
  onDeleteItems: (itemIds: string[]) => void;
}

export default function ItemList({ items, itemTypes, onCreateNew, onDeleteItems }: ItemListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item => {
      const searchString = searchTerm.toLowerCase();
      
      // Search in type name
      if (item.typeName.toLowerCase().includes(searchString)) return true;
      
      // Search in item data
      return Object.values(item.data).some(value => 
        String(value).toLowerCase().includes(searchString)
      );
    });
  }, [items, searchTerm]);

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
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const exportToExcel = () => {
    if (selectedItems.size === 0) return;

    const selectedItemsData = items.filter(item => selectedItems.has(item.id));
    
    // Group by type for better organization
    const groupedByType = selectedItemsData.reduce((acc, item) => {
      if (!acc[item.typeName]) {
        acc[item.typeName] = [];
      }
      acc[item.typeName].push(item);
      return acc;
    }, {} as Record<string, ItemInstance[]>);

    const workbook = XLSX.utils.book_new();

    Object.entries(groupedByType).forEach(([typeName, typeItems]) => {
      const itemType = itemTypes.find(type => type.name === typeName);
      if (!itemType) return;

      // Create headers
      const headers = ['ID', 'Created At', ...itemType.fields.map(field => field.name)];
      
      // Create data rows
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

      XLSX.utils.book_append_sheet(workbook, worksheet, typeName.slice(0, 31)); // Excel sheet name limit
    });

    XLSX.writeFile(workbook, `items_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      onDeleteItems(Array.from(selectedItems));
      setSelectedItems(new Set());
    }
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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
        <div className="flex gap-2">
          {itemTypes.map(type => (
            <Button
              key={type.id}
              onClick={() => onCreateNew(type.id)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              New {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 transition-all duration-200 focus:shadow-glow"
          />
        </div>
        
        <div className="flex gap-2">
          {selectedItems.size > 0 && (
            <>
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="transition-all duration-200 hover:shadow-card"
              >
                <Download className="w-4 h-4 mr-2" />
                Export ({selectedItems.size})
              </Button>
              <Button
                onClick={handleDeleteSelected}
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedItems.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {filteredItems.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Checkbox
            checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span>Select all ({filteredItems.length} items)</span>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? 'No items found matching your search.' : 'No items created yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map(item => {
            const itemType = getItemTypeById(item.typeId);
            if (!itemType) return null;

            return (
              <Card 
                key={item.id} 
                className={`shadow-card transition-all duration-300 hover:shadow-elegant cursor-pointer ${
                  selectedItems.has(item.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleItemSelection(item.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <CardTitle className="text-lg">{item.typeName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{item.typeName}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {itemType.fields.slice(0, 6).map(field => {
                      const value = item.data[field.id];
                      if (!value && value !== 0) return null;
                      
                      return (
                        <div key={field.id} className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">{field.name}</p>
                          <p className="text-sm truncate">
                            {formatFieldValue(value, field)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {itemType.fields.length > 6 && (
                    <p className="text-xs text-muted-foreground mt-3">
                      +{itemType.fields.length - 6} more fields
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}