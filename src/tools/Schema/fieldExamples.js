/**
 * Field examples for different field types with proper settings and validations
 * to guide LLMs in correct field creation.
 */
// Basic String field
export const stringFieldExample = {
    id: 'string_field_example',
    label: 'Title',
    field_type: 'string',
    api_key: 'title',
    hint: 'The title of the content',
    localized: false,
    validators: {
        required: {}
    },
    appearance: {
        editor: 'single_line',
        parameters: {
            heading: true
        },
        addons: []
    },
    position: 1
};
// Text field (multiline)
export const textFieldExample = {
    id: 'text_field_example',
    label: 'Description',
    field_type: 'text',
    api_key: 'description',
    hint: 'A brief description',
    localized: true,
    validators: {
        required: {},
        length: {
            max: 500
        }
    },
    appearance: {
        editor: 'textarea',
        parameters: {
            placeholder: 'Enter detailed description here...'
        },
        addons: []
    },
    position: 2
};
// Rich Text field
export const richTextFieldExample = {
    id: 'rich_text_field_example',
    label: 'Content',
    field_type: 'rich_text',
    api_key: 'content',
    hint: 'The main content of the page',
    localized: true,
    validators: {
        rich_text_blocks: {
            item_types: []
        }
    },
    appearance: {
        editor: 'rich_text',
        parameters: {
            start_collapsed: false
        },
        addons: []
    },
    position: 3
};
// Boolean field
export const booleanFieldExample = {
    id: 'boolean_field_example',
    label: 'Featured',
    field_type: 'boolean',
    api_key: 'featured',
    hint: 'Is this item featured on the homepage?',
    localized: false,
    validators: {
        required: {}
    },
    appearance: {
        editor: 'boolean',
        parameters: {
            appearance: 'switch',
            boolean_label: 'Featured on homepage'
        },
        addons: []
    },
    position: 4
};
// Integer field
export const integerFieldExample = {
    id: 'integer_field_example',
    label: 'Order',
    field_type: 'integer',
    api_key: 'order',
    hint: 'Display order (lower numbers appear first)',
    localized: false,
    validators: {
        required: {},
        range: {
            min: 1,
            max: 100
        }
    },
    appearance: {
        editor: 'integer',
        parameters: {},
        addons: []
    },
    position: 5
};
// Float field
export const floatFieldExample = {
    id: 'float_field_example',
    label: 'Price',
    field_type: 'float',
    api_key: 'price',
    hint: 'Product price in USD',
    localized: false,
    validators: {
        required: {},
        range: {
            min: 0.01
        }
    },
    appearance: {
        editor: 'float',
        parameters: {
            prefix: '$'
        },
        addons: []
    },
    position: 6
};
// Date field
export const dateFieldExample = {
    id: 'date_field_example',
    label: 'Publication Date',
    field_type: 'date',
    api_key: 'publication_date',
    hint: 'When this content will be published',
    localized: false,
    validators: {
        required: {}
    },
    appearance: {
        editor: 'date_picker',
        parameters: {
            format: 'YYYY-MM-DD'
        },
        addons: []
    },
    position: 7
};
// DateTime field
export const dateTimeFieldExample = {
    id: 'date_time_field_example',
    label: 'Publication Date and Time',
    field_type: 'date_time',
    api_key: 'publication_date_time',
    hint: 'When this content will be published',
    localized: false,
    validators: {
        required: {}
    },
    appearance: {
        editor: 'date_time_picker',
        parameters: {
            format: 'YYYY-MM-DD HH:mm'
        },
        addons: []
    },
    position: 8
};
// Single-link field
export const singleLinkFieldExample = {
    id: 'single_link_field_example',
    label: 'Category',
    field_type: 'link',
    api_key: 'category',
    hint: 'The category this item belongs to',
    localized: false,
    validators: {
        required: {},
        item_item_type: {
            item_types: ['category']
        }
    },
    appearance: {
        editor: 'link_select',
        parameters: {},
        addons: []
    },
    position: 9
};
// Multi-link field
export const multiLinkFieldExample = {
    id: 'multi_link_field_example',
    label: 'Related Articles',
    field_type: 'links',
    api_key: 'related_articles',
    hint: 'Select related articles to display',
    localized: false,
    validators: {
        items_item_type: {
            item_types: ['article']
        }
    },
    appearance: {
        editor: 'links_select',
        parameters: {
            max_results: 10
        },
        addons: []
    },
    position: 10
};
// Single-asset field
export const singleAssetFieldExample = {
    id: 'single_asset_field_example',
    label: 'Featured Image',
    field_type: 'file',
    api_key: 'featured_image',
    hint: 'Main image for this content',
    localized: false,
    validators: {
        required: {},
        file_size: {
            max_size: 10000000
        }
    },
    appearance: {
        editor: 'file',
        parameters: {
            show_dimensions: true
        },
        addons: []
    },
    position: 11
};
// Multiple-asset field
export const multipleAssetFieldExample = {
    id: 'multiple_asset_field_example',
    label: 'Gallery',
    field_type: 'gallery',
    api_key: 'gallery',
    hint: 'Image gallery',
    localized: false,
    validators: {
        file_size: {
            max_size: 5000000
        }
    },
    appearance: {
        editor: 'gallery',
        parameters: {
            max_width: 300
        },
        addons: []
    },
    position: 12
};
// SEO field
export const seoFieldExample = {
    id: 'seo_field_example',
    label: 'SEO Settings',
    field_type: 'seo',
    api_key: 'seo',
    hint: 'Search Engine Optimization settings',
    localized: true,
    validators: {},
    appearance: {
        editor: 'seo',
        parameters: {},
        addons: []
    },
    position: 13
};
// Slug field
export const slugFieldExample = {
    id: 'slug_field_example',
    label: 'Slug',
    field_type: 'slug',
    api_key: 'slug',
    hint: 'URL-friendly identifier',
    localized: true,
    validators: {
        required: {},
        unique: {}
    },
    appearance: {
        editor: 'slug',
        parameters: {
            title_field_hint: 'automatically generated from your title',
            url_prefix: 'https://example.com/blog/'
        },
        addons: []
    },
    position: 14
};
// Color field
export const colorFieldExample = {
    id: 'color_field_example',
    label: 'Brand Color',
    field_type: 'color',
    api_key: 'brand_color',
    hint: 'Select the primary brand color',
    localized: false,
    validators: {
        required: {}
    },
    appearance: {
        editor: 'color_picker',
        parameters: {
            preset_colors: ['#FF5733', '#33FF57', '#3357FF']
        },
        addons: []
    },
    position: 15
};
// JSON field
export const jsonFieldExample = {
    id: 'json_field_example',
    label: 'Custom Configuration',
    field_type: 'json',
    api_key: 'custom_configuration',
    hint: 'Advanced configuration in JSON format',
    localized: false,
    validators: {},
    appearance: {
        editor: 'string_checkbox_group',
        parameters: {
            options: [
                { label: 'Feature A', value: 'feature_a' },
                { label: 'Feature B', value: 'feature_b' }
            ]
        },
        addons: []
    },
    position: 16
};
// Structured text field
export const structuredTextFieldExample = {
    id: 'structured_text_field_example',
    label: 'Structured Content',
    field_type: 'structured_text',
    api_key: 'structured_content',
    hint: 'The main structured content of the page',
    localized: true,
    validators: {
        structured_text_blocks: {
            item_types: []
        },
        structured_text_links: {
            item_types: []
        }
    },
    appearance: {
        editor: 'structured_text',
        parameters: { blocks_start_collapsed: false },
        addons: []
    },
    position: 17
};
// Single block field
export const singleBlockFieldExample = {
    id: 'single_block_field_example',
    label: 'Hero Block',
    field_type: 'single_block',
    api_key: 'hero_block',
    hint: 'Select a single content block to use as hero',
    localized: false,
    validators: {
        single_block_blocks: {
            item_types: []
        }
    },
    appearance: {
        editor: 'framed_single_block',
        parameters: { start_collapsed: false },
        addons: []
    },
    position: 18
};
