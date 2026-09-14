export interface NetworkContactData {
  id: string;
  userId: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  profileUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export class NetworkContact {
  readonly id!: string; readonly userId!: string; readonly name!: string; readonly company!: string | null; readonly role!: string | null;
  readonly email!: string | null; readonly profileUrl!: string | null; readonly notes!: string | null; readonly createdAt!: string; readonly updatedAt!: string;
  constructor(data: NetworkContactData) { Object.assign(this, data); }
}
