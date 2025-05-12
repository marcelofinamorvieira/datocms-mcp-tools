import { z } from "zod";

// Import schemas from MenuItem module
import { 
  menuItemSchemas as menuItem, 
  menuItemActionsList as menuItemActions
} from "./MenuItem/schemas.js";

// Import schemas from SchemaMenuItem module
import { 
  schemaMenuItemSchemas as schemaMenuItem,
  schemaMenuItemActionsList as schemaMenuItemActions 
} from "./SchemaMenuItem/schemas.js";

// Import schemas from UploadsFilter module
import { 
  uploadsFilterSchemas as uploadsFilter,
  uploadsFilterActionsList as uploadsFilterActions
} from "./UploadsFilter/schemas.js";

// Import schemas from ModelFilter module
import {
  modelFilterSchemas as modelFilter,
  modelFilterSchemaKeys
} from "./ModelFilter/schemas.js";

// Import schemas from Plugins module
import {
  pluginSchemas as plugins,
  pluginActionsList
} from "./Plugins/schemas.js";

// Combine all schema objects
export const uiSchemas = {
  // MenuItem schemas (prefixed with menu_item_)
  menu_item_list: menuItem.list,
  menu_item_retrieve: menuItem.retrieve,
  menu_item_create: menuItem.create,
  menu_item_update: menuItem.update,
  menu_item_delete: menuItem.delete,

  // SchemaMenuItem schemas (prefixed with schema_menu_item_)
  schema_menu_item_list: schemaMenuItem.list,
  schema_menu_item_retrieve: schemaMenuItem.retrieve,
  schema_menu_item_create: schemaMenuItem.create,
  schema_menu_item_update: schemaMenuItem.update,
  schema_menu_item_delete: schemaMenuItem.delete,

  // UploadsFilter schemas (prefixed with uploads_filter_)
  uploads_filter_list: uploadsFilter.list,
  uploads_filter_retrieve: uploadsFilter.retrieve,
  uploads_filter_create: uploadsFilter.create,
  uploads_filter_update: uploadsFilter.update,
  uploads_filter_delete: uploadsFilter.delete,

  // ModelFilter schemas (prefixed with model_filter_)
  model_filter_list: modelFilter.list,
  model_filter_retrieve: modelFilter.retrieve,
  model_filter_create: modelFilter.create,
  model_filter_update: modelFilter.update,
  model_filter_delete: modelFilter.delete,

  // Plugins schemas (prefixed with plugin_)
  plugin_list: plugins.list,
  plugin_retrieve: plugins.retrieve,
  plugin_create: plugins.create,
  plugin_update: plugins.update,
  plugin_delete: plugins.delete,
};

// Create a combined actions list with proper type annotation
export const uiActionsList: string[] = [
  // MenuItem actions (prefixed with menu_item_)
  ...menuItemActions.map((action: string) => `menu_item_${action}`),
  
  // SchemaMenuItem actions (prefixed with schema_menu_item_)
  ...schemaMenuItemActions.map((action: string) => `schema_menu_item_${action}`),
  
  // UploadsFilter actions (prefixed with uploads_filter_)
  ...uploadsFilterActions.map((action: string) => `uploads_filter_${action}`),
  
  // ModelFilter actions (prefixed with model_filter_)
  ...modelFilterSchemaKeys.map((action: string) => `model_filter_${action}`),
  
  // Plugins actions (prefixed with plugin_)
  ...pluginActionsList.map((action: string) => `plugin_${action}`)
];