export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
    token_type: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}