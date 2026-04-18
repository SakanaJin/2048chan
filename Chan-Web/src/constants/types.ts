// api types-----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  errors: ApiError[];
  has_errors: boolean;
}

export interface ApiError {
  property: string;
  message: string;
}

// ws types-------------------------------------------------------------------------------

export enum WSType {
  READY = "ready",
  MESSAGE = "message",
  PAGE = "page",
}

export interface WSMessage {
  Mtype: WSType;
  data: any;
}

export enum WSCodes {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,
  INTERNAL_SERVER_ERROR = 1011,
  UNEXPECTED_ERROR = 1006,
  POLICY_VIOLATION = 1008,
  FORCE_DC = 4001,
}

// user types ----------------------------------------------------------------------------

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export interface UserGetDto {
  id: number;
  username: string;
  role: UserRole;
  pfp_path: string;
  subbedthreads: ThreadShallowDto[];
  ownedthreads: ThreadShallowDto[];
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface UserCreateDto {
  username: string;
  password: string;
  confirm_password: string;
}

export interface UserShallowDto {
  id: number;
  username: string;
  pfp_path: string;
}

// topic types ---------------------------------------------------------------------------

export interface TopicGetDto {
  id: number;
  name: string;
  views: number;
  threads: ThreadShallowDto[];
}

export interface TopicShallowDto {
  id: number;
  name: string;
  views: number;
}

// thread types --------------------------------------------------------------------------

export interface ThreadCreateDto {
  name: string;
}

export interface ThreadGetDto {
  id: number;
  name: string;
  views: number;
  subscibers: number;
  expiresat: string;
  creator: UserShallowDto;
}

export interface ThreadShallowDto {
  id: number;
  name: string;
  views: number;
  subscibers: number;
  expiresat: string;
}

// message types ------------------------------------------------------------------------

export interface MessageCreateDto {
  name: string;
}

export interface MessageGetDto {
  id: number;
  content: string;
  createdat: string;
  author: UserShallowDto;
  thread: ThreadShallowDto;
}

export interface MessageShallowDto {
  id: number;
  content: string;
  createdat: string;
  author: UserShallowDto;
}

// page types ---------------------------------------------------------------------------

export interface PaginationDto {
  current_page: number;
  total_pages: number;
  total_messages: number;
  page_size: number;
  has_more: boolean;
}

export interface PageDto {
  messages: MessageShallowDto;
  pagination: PaginationDto;
}
