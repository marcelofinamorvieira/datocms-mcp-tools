import { registerMenuItemRouter, destroyMenuItemRouter } from "./MenuItem/index.js";
import { registerSchemaMenuItemRouter } from "./SchemaMenuItem/index.js";
import { registerUploadsFilterRouter } from "./UploadsFilter/index.js";
import { registerModelFilterRouter, destroyModelFilterRouter } from "./ModelFilter/index.js";
import { registerPluginsRouter, destroyPluginsRouter } from "./Plugins/index.js";

export {
  registerMenuItemRouter,
  destroyMenuItemRouter,
  registerSchemaMenuItemRouter,
  registerUploadsFilterRouter,
  registerModelFilterRouter,
  destroyModelFilterRouter,
  registerPluginsRouter,
  destroyPluginsRouter
};