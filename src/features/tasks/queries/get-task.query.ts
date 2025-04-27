export interface GetTasksQueryPayload {
  status?: number;
  userId?: string;
}

export class GetTaskQuery {
  constructor(public payload: GetTasksQueryPayload) {}
}
