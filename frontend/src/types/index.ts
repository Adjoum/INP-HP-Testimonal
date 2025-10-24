export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  promotion: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface Testimonial {
  _id: string;
  author: User;
  content: string;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  likedByUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  testimonial: string;
  parentComment?: string;
  content: string;
  likes: string[];
  likesCount: number;
  repliesCount: number;
  depth: number;
  likedByUser: boolean;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  promotion: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateTestimonialDto {
  content: string;
}

export interface CreateCommentDto {
  testimonialId: string;
  parentCommentId?: string;
  content: string;
}

export type SortOption = 'recent' | 'popular' | 'commented';
