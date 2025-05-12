import { registerUIRouter, destroy as destroyUIRouter } from "./UIRouterTool.js";

// Export the individual routers for backward compatibility
import { registerMenuItemRouter } from "./MenuItem/index.js";
import { registerSchemaMenuItemRouter } from "./SchemaMenuItem/index.js";
import { registerUploadsFilterRouter } from "./UploadsFilter/index.js";
import { registerModelFilterRouter, destroyModelFilterRouter } from "./ModelFilter/index.js";
import { registerPluginsRouter, destroyPluginsRouter } from "./Plugins/index.js";

// Import specific destroy function from MenuItem
import { destroy as destroyMenuItemRouter } from "./MenuItem/MenuItemRouterTool.js";

// Export both the unified and individual router registration functions
export {
  // Main unified UI router
  registerUIRouter,
  destroyUIRouter,
  
  // Individual routers (for backward compatibility)
  registerMenuItemRouter,
  destroyMenuItemRouter,
  registerSchemaMenuItemRouter,
  registerUploadsFilterRouter,
  registerModelFilterRouter,
  destroyModelFilterRouter,
  registerPluginsRouter,
  destroyPluginsRouter
};