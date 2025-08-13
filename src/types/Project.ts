export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  itemIds: string[]; // References to ItemInstance IDs
  createdAt: string;
  updatedAt: string;
}