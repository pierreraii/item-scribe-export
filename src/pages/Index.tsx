import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Database, FileSpreadsheet, Search } from 'lucide-react';
import ItemTypeCreator from '@/components/ItemTypeCreator';
import ItemCreator from '@/components/ItemCreator';
import ItemList from '@/components/ItemList';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ItemType, ItemInstance } from '@/types/ItemType';
import { useToast } from '@/hooks/use-toast';

type View = 'home' | 'create-type' | 'create-item' | 'view-items';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [itemTypes, setItemTypes] = useLocalStorage<ItemType[]>('itemTypes', []);
  const [items, setItems] = useLocalStorage<ItemInstance[]>('items', []);
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
    toast({
      title: "Items deleted",
      description: `${itemIds.length} item(s) have been deleted.`,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card transition-all duration-300 hover:shadow-elegant group cursor-pointer"
                    onClick={() => setCurrentView('create-type')}>
                <CardHeader className="text-center bg-gradient-subtle">
                  <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Create Item Type</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Define a new type of item with custom fields and properties.
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

              <Card className="shadow-card transition-all duration-300 hover:shadow-elegant group">
                <CardHeader className="text-center bg-gradient-subtle">
                  <div className="w-16 h-16 mx-auto bg-success rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <FileSpreadsheet className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Export Data</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Select items and export them to Excel format for external use.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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