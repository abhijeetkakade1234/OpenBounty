export type Bounty = {
  id: number;
  creator: string;
  repoUrl: string;
  description: string;
  reward: bigint;
  deadline: number;
  isOpen: boolean;
  isCompleted: boolean;
  winner: string;
};

export type Submission = {
  submitter: string;
  prLink: string;
  timestamp: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  nextCursor: number;
  hasMore: boolean;
  total: number;
  totalPages: number;
};
