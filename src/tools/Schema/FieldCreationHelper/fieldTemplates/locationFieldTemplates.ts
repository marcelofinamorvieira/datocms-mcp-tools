/**
 * Templates for location (lat_lon) field types
 * These are validated examples that work with the DatoCMS API
 */

/**
 * Location field with map appearance
 * NOTE: For the API, the correct editor is "map", not "lat_lon_editor" 
 */
export const locationTemplate = {
  label: "Event Location",
  api_key: "event_location",
  field_type: "lat_lon",
  hint: "Select the geographical location",
  appearance: {
    editor: "map",
    parameters: {},
    addons: []
  },
  validators: {
    required: {}
  }
};

export default {
  locationTemplate
};