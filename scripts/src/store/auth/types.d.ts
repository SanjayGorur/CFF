interface IFederatedCredentials {
  expires_at: number,
  provider: string,
  token: string,
  user: {
    email: string, name: string
  }
}
interface IUserAttributes {
  email: string,
  email_verified: boolean,
  name: string,
  "custom:center": string
}
interface IAuthState {
  loggedIn: boolean,
  user: IUserAttributes,
  userId: string,
  authMethod: string,
  authForm: {
    schema: Schema,
    uiSchema: UiSchema
  }
}