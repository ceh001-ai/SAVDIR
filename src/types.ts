export interface Note {
  id: string;
  title: string;
  details: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  name: string;
  count: number;
}
