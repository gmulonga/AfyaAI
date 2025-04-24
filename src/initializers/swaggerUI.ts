// initializers/swaggerUI.ts
import { Initializer, api } from "actionhero";
import swaggerUi from "swagger-ui-express";

export class SwaggerUIInitializer extends Initializer {
  constructor() {
    super();
    this.name = "swaggerUI";
  }

  async initialize() {
    api.expressServer = api.expressServer || {};
    api.expressServer.customMiddleware = api.expressServer.customMiddleware || [];

    api.expressServer.customMiddleware.push((app) => {
      app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
          swaggerUrl: "/swagger.json",
          explorer: true,
        }),
      );
    });
  }
}
