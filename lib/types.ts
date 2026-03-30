export interface Design {
  id: string;
  title: string;
  image: string;
  createdAt: string;
  assignedTo: string[];
  expiryDate?: string;
}

export interface Selection {
  id: string;
  designId: string;
  shopkeeperId: string;
  shopkeeperName: string;
  shopkeeperEmail: string;
  designTitle: string;
  selectedAt: string;
}

export interface User {
  id: string;
  role: "admin" | "shopkeeper";
  name: string;
  email: string;
  password: string;
}
