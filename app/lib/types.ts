// ============================================
// 类型定义
// ============================================

export interface PostData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published: boolean;
  views: number;
  createdAt: Date;
  author: {
    username: string;
    avatar: string | null;
  };
}

export interface UserData {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}
