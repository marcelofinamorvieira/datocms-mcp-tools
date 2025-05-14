/**
 * Schema Module Typed Client
 * 
 * This file provides a type-safe client for interacting with DatoCMS Schema-related
 * entities (ItemTypes, Fields, and Fieldsets).
 */

import { getClient } from "../../utils/clientManager.js";
import {
  ItemType,
  Field,
  Fieldset,
  ItemTypeCreateParams,
  ItemTypeUpdateParams,
  FieldCreateParams,
  FieldUpdateParams,
  FieldsetCreateParams,
  FieldsetUpdateParams,
  adaptApiItemType,
  adaptApiField,
  adaptApiFieldset
} from "./schemaTypes.js";

/**
 * Interface for the Schema Client
 */
export interface SchemaClient {
  // ItemType operations
  createItemType(data: ItemTypeCreateParams): Promise<ItemType>;
  updateItemType(id: string, data: ItemTypeUpdateParams): Promise<ItemType>;
  findItemType(id: string): Promise<ItemType>;
  listItemTypes(params?: { offset?: number; limit?: number }): Promise<ItemType[]>;
  deleteItemType(id: string): Promise<void>;
  duplicateItemType(id: string, data: { name: string; api_key: string }): Promise<ItemType>;
  
  // Field operations
  createField(itemTypeId: string, data: FieldCreateParams): Promise<Field>;
  updateField(id: string, data: FieldUpdateParams): Promise<Field>;
  findField(id: string): Promise<Field>;
  listFields(itemTypeId: string, params?: { offset?: number; limit?: number }): Promise<Field[]>;
  deleteField(id: string): Promise<void>;
  
  // Fieldset operations
  createFieldset(itemTypeId: string, data: FieldsetCreateParams): Promise<Fieldset>;
  updateFieldset(id: string, data: FieldsetUpdateParams): Promise<Fieldset>;
  findFieldset(id: string): Promise<Fieldset>;
  listFieldsets(itemTypeId: string, params?: { offset?: number; limit?: number }): Promise<Fieldset[]>;
  deleteFieldset(id: string): Promise<void>;
}

/**
 * Implementation of the Schema Client interface
 */
export class TypedSchemaClient implements SchemaClient {
  private client: any;
  
  constructor(apiToken: string, environment?: string) {
    this.client = getClient(apiToken, environment);
  }
  
  // ItemType operations
  async createItemType(data: ItemTypeCreateParams): Promise<ItemType> {
    const apiItemType = await this.client.itemTypes.create(data);
    return adaptApiItemType(apiItemType);
  }
  
  async updateItemType(id: string, data: ItemTypeUpdateParams): Promise<ItemType> {
    const apiItemType = await this.client.itemTypes.update(id, data);
    return adaptApiItemType(apiItemType);
  }
  
  async findItemType(id: string): Promise<ItemType> {
    const apiItemType = await this.client.itemTypes.find(id);
    return adaptApiItemType(apiItemType);
  }
  
  async listItemTypes(params?: { offset?: number; limit?: number }): Promise<ItemType[]> {
    const apiItemTypes = await this.client.itemTypes.list(params);
    return apiItemTypes.map(adaptApiItemType);
  }
  
  async deleteItemType(id: string): Promise<void> {
    await this.client.itemTypes.destroy(id);
  }
  
  async duplicateItemType(id: string, data: { name: string; api_key: string }): Promise<ItemType> {
    const apiItemType = await this.client.itemTypes.duplicate(id, data);
    return adaptApiItemType(apiItemType);
  }
  
  // Field operations
  async createField(itemTypeId: string, data: FieldCreateParams): Promise<Field> {
    const apiField = await this.client.fields.create(itemTypeId, data);
    return adaptApiField(apiField);
  }
  
  async updateField(id: string, data: FieldUpdateParams): Promise<Field> {
    const apiField = await this.client.fields.update(id, data);
    return adaptApiField(apiField);
  }
  
  async findField(id: string): Promise<Field> {
    const apiField = await this.client.fields.find(id);
    return adaptApiField(apiField);
  }
  
  async listFields(itemTypeId: string, params?: { offset?: number; limit?: number }): Promise<Field[]> {
    const apiFields = await this.client.fields.list(params || {}, { "filter[item_type_id]": itemTypeId });
    return apiFields.map(adaptApiField);
  }
  
  async deleteField(id: string): Promise<void> {
    await this.client.fields.destroy(id);
  }
  
  // Fieldset operations
  async createFieldset(itemTypeId: string, data: FieldsetCreateParams): Promise<Fieldset> {
    const apiFieldset = await this.client.fieldsets.create(itemTypeId, data);
    return adaptApiFieldset(apiFieldset);
  }
  
  async updateFieldset(id: string, data: FieldsetUpdateParams): Promise<Fieldset> {
    const apiFieldset = await this.client.fieldsets.update(id, data);
    return adaptApiFieldset(apiFieldset);
  }
  
  async findFieldset(id: string): Promise<Fieldset> {
    const apiFieldset = await this.client.fieldsets.find(id);
    return adaptApiFieldset(apiFieldset);
  }
  
  async listFieldsets(itemTypeId: string, params?: { offset?: number; limit?: number }): Promise<Fieldset[]> {
    const apiFieldsets = await this.client.fieldsets.list(params || {}, { "filter[item_type_id]": itemTypeId });
    return apiFieldsets.map(adaptApiFieldset);
  }
  
  async deleteFieldset(id: string): Promise<void> {
    await this.client.fieldsets.destroy(id);
  }
}

/**
 * Factory function to create a typed schema client
 */
export function createSchemaClient(apiToken: string, environment?: string): SchemaClient {
  return new TypedSchemaClient(apiToken, environment);
}