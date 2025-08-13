export interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[]; // for select type
}

export interface ItemType {
  id: string;
  name: string;
  fields: FieldDefinition[];
  createdAt: string;
}

export interface ItemInstance {
  id: string;
  typeId: string;
  typeName: string;
  data: Record<string, any>;
  createdAt: string;
}