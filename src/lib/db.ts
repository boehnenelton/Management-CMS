/**
 * Library:         db.ts
 * Module Purpose:  Manages the virtual BEJSON/MFDB persistence layer in React.
 *                  Provides full data compatibility with the Python-spec Category, Page, Post, PageSeo, Tag, NavLink, Media, Link, Note, and TodoItem schemas.
 */

import { parse, serialize } from "./Core/lib_bejson_Core_bejson_core";
import { BEJSONDocument, BEJSONField, BEJSONValue } from "./Core/lib_bejson_Core_bejson_types";

// Schema Definitions matching Python/on-disk layout
export const SCHEMAS = {
  Category: {
    name: "Category",
    format: "104",
    fields: [
      { name: "id", type: "string" },
      { name: "parent_id", type: "string" },
      { name: "category_type", type: "string" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "slug", type: "string" },
      { name: "created_at", type: "string" },
    ] as BEJSONField[],
  },
  Post: {
    name: "Post",
    format: "104",
    fields: [
      { name: "id", type: "string" },
      { name: "category_id_fk", type: "string" },
      { name: "title", type: "string" },
      { name: "slug", type: "string" },
      { name: "status", type: "string" },
      { name: "content_html", type: "string" },
      { name: "content_markdown", type: "string" },
      { name: "author", type: "string" },
      { name: "featured_image", type: "string" },
      { name: "published_at", type: "string" },
      { name: "scheduled_at", type: "string" },
      { name: "tag_ids", type: "array" },
      { name: "created_at", type: "string" },
      { name: "updated_at", type: "string" },
      { name: "excerpt", type: "string" },
      { name: "locked_at", type: "string" },
      { name: "locked_by", type: "string" },
    ] as BEJSONField[],
  },
  Page: {
    name: "Page",
    format: "104",
    fields: [
      { name: "id", type: "string" },
      { name: "category_id_fk", type: "string" },
      { name: "slug", type: "string" },
      { name: "status", type: "string" },
      { name: "page_type", type: "string" },
      { name: "meta_description", type: "string" },
      { name: "layout", type: "string" },
      { name: "content_html", type: "string" },
      { name: "content_markdown", type: "string" },
      { name: "author", type: "string" },
      { name: "featured_image", type: "string" },
      { name: "parent_page_id_fk", type: "string" },
      { name: "sort_order", type: "integer" },
      { name: "created_at", type: "string" },
      { name: "updated_at", type: "string" },
      { name: "title", type: "string" },
      { name: "excerpt", type: "string" },
      { name: "locked_at", type: "string" },
      { name: "locked_by", type: "string" },
    ] as BEJSONField[],
  },
  PageSeo: {
    name: "PageSeo",
    format: "104",
    fields: [
      { name: "seo_id", type: "string" },
      { name: "page_id_fk", type: "string" },
      { name: "meta_title", type: "string" },
      { name: "meta_keywords", type: "string" },
      { name: "og_title", type: "string" },
      { name: "og_description", type: "string" },
      { name: "og_image", type: "string" },
      { name: "canonical_url", type: "string" },
      { name: "robots_directive", type: "string" },
      { name: "created_at", type: "string" },
    ] as BEJSONField[],
  },
  Tag: {
    name: "Tag",
    format: "104",
    fields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "slug", type: "string" },
      { name: "created_at", type: "string" },
    ] as BEJSONField[],
  },
  Link: {
    name: "Link",
    format: "104",
    fields: [
      { name: "taxonomy", type: "string" },
      { name: "type", type: "string" },
      { name: "category", type: "string" },
      { name: "id", type: "string" },
      { name: "label", type: "string" },
      { name: "idx_position", type: "integer" },
      { name: "idx_sorting", type: "string" },
      { name: "active", type: "boolean" },
      { name: "hidden", type: "boolean" },
      { name: "created_at", type: "string" },
      { name: "url", type: "string" },
      { name: "icon", type: "string" },
      { name: "description", type: "string" },
    ] as BEJSONField[],
  },
  LinkCategory: {
    name: "LinkCategory",
    format: "104",
    fields: [
      { name: "cat_id", type: "string" },
      { name: "cat_name", type: "string" },
      { name: "cat_created_at", type: "string" },
    ] as BEJSONField[],
  },
  Note: {
    name: "Note",
    format: "104",
    fields: [
      { name: "taxonomy", type: "string" },
      { name: "type", type: "string" },
      { name: "category", type: "string" },
      { name: "id", type: "string" },
      { name: "label", type: "string" },
      { name: "idx_position", type: "integer" },
      { name: "idx_sorting", type: "string" },
      { name: "active", type: "boolean" },
      { name: "hidden", type: "boolean" },
      { name: "created_at", type: "string" },
      { name: "content", type: "string" },
      { name: "color", type: "string" },
    ] as BEJSONField[],
  },
  NoteCategory: {
    name: "NoteCategory",
    format: "104",
    fields: [
      { name: "cat_id", type: "string" },
      { name: "cat_name", type: "string" },
      { name: "cat_created_at", type: "string" },
    ] as BEJSONField[],
  },
  TodoItem: {
    name: "TodoItem",
    format: "104",
    fields: [
      { name: "taxonomy", type: "string" },
      { name: "type", type: "string" },
      { name: "category", type: "string" },
      { name: "id", type: "string" },
      { name: "label", type: "string" },
      { name: "idx_position", type: "integer" },
      { name: "idx_sorting", type: "string" },
      { name: "active", type: "boolean" },
      { name: "hidden", type: "boolean" },
      { name: "created_at", type: "string" },
      { name: "done", type: "boolean" },
      { name: "priority", type: "string" },
      { name: "detail", type: "string" },
    ] as BEJSONField[],
  },
  TaskCategory: {
    name: "TaskCategory",
    format: "104",
    fields: [
      { name: "cat_id", type: "string" },
      { name: "cat_name", type: "string" },
      { name: "cat_created_at", type: "string" },
    ] as BEJSONField[],
  },
  Media: {
    name: "Media",
    format: "104",
    fields: [
      { name: "id", type: "string" },
      { name: "filename", type: "string" },
      { name: "original_path", type: "string" },
      { name: "mime_type", type: "string" },
      { name: "file_hash", type: "string" },
      { name: "webp_path", type: "string" },
      { name: "alt_text", type: "string" },
      { name: "created_at", type: "string" },
      { name: "admin_media_id", type: "string" },
    ] as BEJSONField[],
  },
  NavLink: {
    name: "NavLink",
    format: "104",
    fields: [
      { name: "nav_id", type: "string" },
      { name: "parent_id", type: "string" },
      { name: "nav_label", type: "string" },
      { name: "nav_url", type: "string" },
      { name: "nav_target", type: "string" },
      { name: "nav_position", type: "integer" },
      { name: "nav_active", type: "boolean" },
      { name: "created_at", type: "string" },
    ] as BEJSONField[],
  },
};

/**
 * Maps state records to a complete BEJSON Format_Version "104" or "104a" document.
 */
export function stateToBejsonDoc(
  schemaKey: keyof typeof SCHEMAS,
  records: Array<Record<string, any>>
): BEJSONDocument {
  const schema = SCHEMAS[schemaKey];
  const values = records.map((rec) => {
    return schema.fields.map((f) => {
      const v = rec[f.name];
      if (v === undefined) return null;
      return v;
    });
  });

  return {
    Format: "BEJSON",
    Format_Version: schema.format as any,
    Format_Creator: "Elton Boehnen",
    Records_Type: [schema.name],
    Fields: schema.fields,
    Values: values,
  };
}

/**
 * Parses a BEJSON document and maps it back to native JS objects.
 */
export function bejsonDocToState(doc: BEJSONDocument): Array<Record<string, any>> {
  const fields = doc.Fields || [];
  const values = doc.Values || [];
  return values.map((row) => {
    const obj: Record<string, any> = {};
    fields.forEach((f, i) => {
      obj[f.name] = row[i];
    });
    return obj;
  });
}

/**
 * Parses a raw BEJSON string back into JS state.
 */
export function parseBejsonToState(rawText: string): Array<Record<string, any>> {
  const doc = parse(rawText);
  return bejsonDocToState(doc);
}

/**
 * Serializes JS state to raw BEJSON string.
 */
export function serializeStateToBejson(
  schemaKey: keyof typeof SCHEMAS,
  records: Array<Record<string, any>>
): string {
  const doc = stateToBejsonDoc(schemaKey, records);
  return serialize(doc);
}
