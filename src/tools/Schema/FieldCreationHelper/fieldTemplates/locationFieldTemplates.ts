/**
 * Templates for location (lat_lon) field types
 * These are validated examples that work with the DatoCMS API
 */

/**
 * Location field with map appearance
 * NOTE: The correct editor is "lat_lon_editor", not "map" as in some documentation
 */
export const locationTemplate = {
  label: "Event Location",
  api_key: "event_location",
  field_type: "lat_lon",
  hint: "Select the geographical location",
  appearance: {
    editor: "lat_lon_editor",
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