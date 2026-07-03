// ============================================
// 类型定义
// ============================================

export interface PostData {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  published: boolean;
  views: number;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  tags: { id: number; name: string }[];
}

export interface UserData {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}
