export interface Form {
  name: string;
  createdBy: string;
  createdAt: Date;
  updateToken: string | null;
  permissions: {
    owners: string[];
    editors: string[];
    viewers: string[];
  };
  submissionsPaused: boolean;
  notifications: {
    email: string[];
    discord: string[];
  };
}

export interface Response {
  form: string;
  createdAt: Date;
  data: Record<string, unknown>;
  notified: boolean;
}

export interface User {
  name: string;
  email: string;
  image: string;
  emailVerified: Date;
  admin: boolean;
}

export type WithStringId<T> = T & { _id: string };
