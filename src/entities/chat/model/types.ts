export interface Chat {
  id: string;
  title: string;
  avatarPath: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
