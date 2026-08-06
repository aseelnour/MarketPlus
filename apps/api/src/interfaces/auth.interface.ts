export interface IRegisterAdmin {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: "super_admin" | "admin";
}

export interface ILoginAdmin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      avatar?: string;
      phone?: string;
      status?: string;
      lastLogin?: Date;
      createdAt?: Date;
    };
  };
}
