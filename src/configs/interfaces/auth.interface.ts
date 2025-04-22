export interface OtpInterface {
  email: string;
  otp: string;
  expiresAt: Date;
}

export interface TokenPayloadInterface {
  sub: string;
  email: string;
}

export interface TokenModelInterface {
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveTokenInterface {
  userId: string;
  token: string;
}

export interface LoginInterface {
  email: string;
  password: string;
}
