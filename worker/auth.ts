import {betterAuth} from 'better-auth';
import {anonymous} from 'better-auth/plugins';

export interface AuthEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

export function createAuth(env:AuthEnv){
  return betterAuth({
    database:env.DB,
    secret:env.BETTER_AUTH_SECRET,
    baseURL:env.BETTER_AUTH_URL,
    plugins:[anonymous()],
    account:{accountLinking:{enabled:true,disableImplicitLinking:true}},
    session:{cookieCache:{enabled:true,maxAge:300,strategy:'compact'}}
  });
}
