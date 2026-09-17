import {betterAuth} from 'better-auth';
import {anonymous} from 'better-auth/plugins';
import {passkey} from '@better-auth/passkey';

export interface AuthEnv {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

export function createAuth(env:AuthEnv){
  const publicUrl=new URL(env.BETTER_AUTH_URL);
  return betterAuth({
    database:env.DB,
    secret:env.BETTER_AUTH_SECRET,
    baseURL:env.BETTER_AUTH_URL,
    plugins:[
      anonymous(),
      passkey({rpID:publicUrl.hostname,rpName:'Canonical Shelf',origin:publicUrl.origin})
    ],
    account:{accountLinking:{enabled:true,disableImplicitLinking:true}},
    session:{cookieCache:{enabled:true,maxAge:300,strategy:'compact'}}
  });
}
