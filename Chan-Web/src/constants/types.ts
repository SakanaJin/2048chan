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
}
