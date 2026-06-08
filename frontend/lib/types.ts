export type User = {
  id: number;
  email: string;
  name: string | null;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type DashboardStat = {
  label: string;
  value: string;
  description: string;
};
