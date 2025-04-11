import { RoutesConfig } from "actionhero";

const namespace = "routes";

declare module "actionhero" {
  export interface ActionheroConfigInterface {
    [namespace]: ReturnType<(typeof DEFAULT)[typeof namespace]>;
  }
}

export const DEFAULT: { [namespace]: () => RoutesConfig } = {
  [namespace]: () => {
    return {
      get: [
        { path: "/swagger", action: "swagger" },

      ],
      post: [
        { path: "/register", action: "registerUser" },
        { path: "/login", action: "login" },
        { path: "/diagnose", action: "geminiAI" }
      ]
    };
  },
};
