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
}

export interface Response {
  form: string;
  createdAt: Date;
  data: Record<string, unknown>;
}

export interface User {
  email: string;
  emailVerified: Date;
  admin: boolean;
}
