export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type MeResponse = {
  userId: number;
  name?: string;
  email?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await response.text());

  return response.json();
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(await response.text());

  return response.json();
}

export async function fetchMe(): Promise<MeResponse | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error(await response.text());

  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) throw new Error(await response.text());
}
