/**
 * Forum TypeScript Interfaces
 */

export interface Board {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface Thread {
  id: string;
  boardId: string;
  subject: string | null;
  opText: string;
  opImageUrl: string | null;
  opThumbUrl: string | null;
  anonId: string;
  tripSig: string | null;
  isSticky: boolean;
  isLocked: boolean;
  createdAt: string;
  bumpAt: string;
  _count?: {
    posts: number;
  };
}

export interface Post {
  id: string;
  threadId: string;
  postNumber: number;
  text: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  anonId: string;
  tripSig: string | null;
  sage: boolean;
  createdAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

