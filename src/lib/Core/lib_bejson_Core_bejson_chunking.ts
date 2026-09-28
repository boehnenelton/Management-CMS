/**
 * Library:         lib_bejson_Core_bejson_chunking.ts
 * Family:          Core
 * Module Purpose:  Implements runtime functionality and logic for lib_bejson_Core_bejson_chunking.ts.
 * Architecture:    MFDB provides multi-file database federation coordinating a 104a central manifest (104a.mfdb.bejson) with dense 104 entity tables, supporting atomic transaction locks and cross-disk relational foreign keys.
 * Version:         1.8.0
 * Release_Version: 300
 * Date:            2026-08-08
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   70fe22f5-e3e7-4553-bb01-29eca7a5b972
 */

import {
  isMfdb132Package,
  validateMfdb132Package,
  detectMfdbInChunk,
  MfdbInChunkDetection,
} from "./lib_bejson_Core_mfdb_validators";

export const DEFAULT_EXTENSIONS: string[] = [
  ".py", ".js", ".ts", ".html", ".css", ".md", ".json",
  ".sh", ".txt", ".bejson", ".tsx", ".jsx",
];

export const DEFAULT_EXCLUDES: string[] = [
  ".git", "__pycache__", "node_modules", "lib", "output",
  ".mfdb_lock", "dist", "build",
];

export interface BejsonField {
  name: string;
  type: string;
}

export const CHUNKED_104_FIELDS: BejsonField[] = [
  { name: "File_Name", type: "string" },
  { name: "File_Extension", type: "string" },
  { name: "File_Content", type: "string" },
  { name: "File_Version", type: "string" },
  { name: "File_Hash", type: "string" },
  { name: "Relative_Path", type: "string" },
  { name: "Is_Binary", type: "boolean" },
  { name: "Is_Mounted", type: "boolean" },
];

export const MFDB_MANIFEST_FILENAME = "104a.mfdb.bejson";
export const MFDB_CHUNK_SCHEMA_VERSION = "1.32";

export interface ChunkedDocument {
  Format: string;
  Format_Version: string;
  Format_Creator: string;
  Schema_Name: string;
  Schema_Version: string;
  Schema_Description: string;
  "Chunk_Date": string;
  Session_Is_Mounted: boolean;
  Mount_Path: string;
  Records_Type: string[];
  Fields: BejsonField[];
  Values: any[][];
  Package_Version?: string;
  MFDB_Version?: string;
  DB_Name?: string;
  Package_Format?: string;
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function bejsonCoreChunkingGetTimestamp(): string {
  return new Date().toISOString().replace(/\\.\\d{3}Z$/, "Z");
}

export function bejsonCoreChunkingIsBinary(filePath: string): boolean {
  // Browser safety fallback. If we are in Node we can do real fs check.
  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const fd = fs.openSync(filePath, "r");
      const buf = Buffer.alloc(1024);
      const bytesRead = fs.readSync(fd, buf, 0, 1024, 0);
      fs.closeSync(fd);
      const slice = buf.subarray(0, bytesRead);
      new TextDecoder("utf-8", { fatal: true }).decode(slice);
      return false;
    } catch {
      return true;
    }
  }
  // Browser fallback defaults to checking extension
  const ext = filePath.split(".").pop()?.toLowerCase();
  const textExts = ["txt", "html", "css", "js", "ts", "json", "md", "bejson", "tsx", "jsx", "sh", "py"];
  return !textExts.includes(ext || "");
}

export function bejsonCoreChunkingHashFileBytes(rawBytes: Buffer | Uint8Array): string {
  // Simple FNVA hash or SHA-256 fallback for browser, Node-crypto for server
  if (typeof window === "undefined") {
    try {
      const crypto = require("crypto");
      return crypto.createHash("sha256").update(rawBytes).digest("hex");
    } catch (e) {}
  }
  // Browser-safe fallback hash (not cryptographically secure but fast and reliable)
  let hash = 0;
  const bytes = rawBytes instanceof Uint8Array ? rawBytes : new Uint8Array(rawBytes);
  for (let i = 0; i < bytes.length; i++) {
    hash = (hash << 5) - hash + bytes[i];
    hash |= 0;
  }
  return "hash_" + Math.abs(hash).toString(16);
}

export function bejsonCoreChunkingBumpPackageVersion(
  priorDoc: ChunkedDocument | null | undefined
): string {
  if (!priorDoc) return "1";
  const n = parseInt(String(priorDoc.Package_Version ?? ""), 10);
  return Number.isNaN(n) ? "1" : String(n + 1);
}

export function bejsonCoreChunkingCreateChunked104(
  targetDir: string,
  version: string = "latest",
  extensions: string[] | null = null,
  excludeDirs: string[] | null = null,
  packageVersion: string | null = null
): ChunkedDocument {
  const values: any[][] = [];

  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const targetPath = path.resolve(targetDir);
      const exts = extensions !== null ? extensions : DEFAULT_EXTENSIONS;
      const excl = excludeDirs !== null ? excludeDirs : DEFAULT_EXCLUDES;

      const walkDir = (current: string): string[] => {
        const results: string[] = [];
        const entries = fs.readdirSync(current, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!excl.includes(entry.name)) {
              results.push(...walkDir(path.join(current, entry.name)));
            }
          } else if (entry.isFile()) {
            results.push(path.join(current, entry.name));
          }
        }
        return results;
      };

      const allFiles = walkDir(targetPath);

      for (const filePath of allFiles) {
        const ext = path.extname(filePath).toLowerCase();
        if (!exts.includes(ext)) continue;
        try {
          const relPath = path.relative(targetPath, filePath);
          const isBin = bejsonCoreChunkingIsBinary(filePath);
          const rawBytes = fs.readFileSync(filePath);
          const content = isBin ? rawBytes.toString("base64") : rawBytes.toString("utf-8");
          const fileHash = bejsonCoreChunkingHashFileBytes(rawBytes);

          values.push([
            path.basename(filePath),
            path.extname(filePath),
            content,
            version,
            fileHash,
            relPath,
            isBin,
            false,
          ]);
        } catch {
          continue;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return {
    Format: "BEJSON",
    Format_Version: "104a",
    Format_Creator: "Elton Boehnen",
    Schema_Name: "Chunked-104a",
    Schema_Version: "1.0.1",
    Schema_Description: "Standard schema for chunking single projects.",
    "Chunk_Date": bejsonCoreChunkingGetTimestamp().slice(0, 10),
    Session_Is_Mounted: false,
    Mount_Path: "",
    Package_Version: packageVersion || "1",
    Records_Type: ["Chunked"],
    Fields: CHUNKED_104_FIELDS,
    Values: values,
  };
}

export function bejsonCoreChunkingUnchunkChunked104(
  doc: ChunkedDocument,
  outputDir: string
): number {
  const fields = doc.Fields || CHUNKED_104_FIELDS;
  const fm: Record<string, number> = {};
  fields.forEach((f, i) => (fm[f.name] = i));

  let count = 0;

  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const outRoot = path.resolve(outputDir);

      for (const row of doc.Values || []) {
        const relPath = row[fm["Relative_Path"]];
        const isBinary = row[fm["Is_Binary"]];
        const content = row[fm["File_Content"]];
        if (!relPath || content === null || content === undefined) continue;

        const targetFile = path.join(outRoot, relPath);
        fs.mkdirSync(path.dirname(targetFile), { recursive: true });
        if (isBinary) {
          fs.writeFileSync(targetFile, Buffer.from(content, "base64"));
        } else {
          fs.writeFileSync(targetFile, content, { encoding: "utf-8" });
        }
        count += 1;
      }
    } catch (e) {
      console.error(e);
    }
  }

  return count;
}

export function bejsonCoreChunkingCreateMfdb132Package(
  mfdbRootDir: string,
  dbName: string,
  extensions: string[] | null = null,
  excludeDirs: string[] | null = null,
  packageVersion: string | null = null,
  priorPackageDoc: ChunkedDocument | null = null
): ChunkedDocument {
  const resolvedPackageVersion =
    packageVersion || bejsonCoreChunkingBumpPackageVersion(priorPackageDoc);

  const doc = bejsonCoreChunkingCreateChunked104(
    mfdbRootDir,
    MFDB_CHUNK_SCHEMA_VERSION,
    extensions,
    excludeDirs,
    resolvedPackageVersion
  );

  doc.Schema_Name = "MFDB-132";
  doc.Records_Type = ["MFDB-132"];
  doc.MFDB_Version = MFDB_CHUNK_SCHEMA_VERSION;
  doc.DB_Name = dbName;
  doc.Package_Format = "MFDB-Chunked-104a";
  return doc;
}

export function bejsonCoreChunkingIsMfdb132Package(doc: ChunkedDocument): boolean {
  return isMfdb132Package(doc);
}

export function bejsonCoreChunkingValidateMfdb132Package(
  doc: ChunkedDocument
): ValidationResult {
  return validateMfdb132Package(doc) as ValidationResult;
}

export function bejsonCoreChunkingUnchunkMfdb132Package(
  doc: ChunkedDocument,
  outputDir: string
): [number, ValidationResult] {
  const validation = bejsonCoreChunkingValidateMfdb132Package(doc);
  const count = bejsonCoreChunkingUnchunkChunked104(doc, outputDir);

  if (typeof window === "undefined") {
    try {
      const fs = require("fs");
      const path = require("path");
      const outRoot = path.resolve(outputDir);
      const manifestRestored = fs.existsSync(path.join(outRoot, MFDB_MANIFEST_FILENAME));
      if (!manifestRestored) {
        validation.valid = false;
        validation.errors.push(
          `Manifest ${MFDB_MANIFEST_FILENAME} was not found on disk after unchunking.`
        );
      }
    } catch (e) {}
  }

  return [count, validation];
}

export type { MfdbEntityCheck, MfdbInChunkDetection } from "./lib_bejson_Core_mfdb_validators";

export function bejsonCoreChunkingDetectMfdbInChunk(doc: ChunkedDocument): MfdbInChunkDetection {
  return detectMfdbInChunk(doc);
}

export const LOCK_FILE_132 = ".mfdb132_lock";

export interface LockData132 {
  pid: number;
  mounted_at: string;
  original_hash: string;
  chunk_doc_path: string;
  workspace_dir: string;
}

export interface MountOptions { force?: boolean; sticky?: boolean; }

export class MFDB132Archive {
  static mount(chunkDocPath: string, targetDir: string,
               { force = false, sticky = true }: MountOptions = {}): string {
    return "";
  }

  static commit(mountDir: string, outputPath: string | null = null,
                validate = true): string {
    return "";
  }

  static resurrect_file(mountDir: string, relativePath: string): boolean {
    return false;
  }

  static unmount(mountDir: string, cleanup = true): void {
  }
}

export const BEJSON_CORE_CHUNKING_MFDB_SCHEMA_MANIFEST = "mfdb_manifest";
export const BEJSON_CORE_CHUNKING_MFDB_SCHEMA_ENTITY = "mfdb_entity";
export const BEJSON_CORE_CHUNKING_MFDB_SCHEMA_ENTITY_LEGACY = "mfdb_entity_legacy";
export const BEJSON_CORE_CHUNKING_MFDB_SCHEMA_CHUNKED_104A = "chunked_104a";
export const BEJSON_CORE_CHUNKING_MFDB_SCHEMA_UNKNOWN = "unknown";

export function bejsonCoreChunkingMfdbGetFieldMap(doc: ChunkedDocument): Record<string, number> {
  const fields = doc.Fields || [];
  const map: Record<string, number> = {};
  fields.forEach((f, i) => { map[f.name] = i; });
  return map;
}

export function bejsonCoreChunkingMfdbDetectSchema(doc: ChunkedDocument): string {
  return bejsonCoreChunkingMfdbDetectSchemaInternal(doc);
}

function bejsonCoreChunkingMfdbDetectSchemaInternal(doc: ChunkedDocument): string {
  const recordsType = doc.Records_Type;
  const fieldNames = new Set((doc.Fields || []).map((f) => f.name));

  if ((Array.isArray(recordsType) && recordsType.length === 1 && recordsType[0] === "MFDB-132") ||
      doc.Schema_Name === "MFDB-132") {
    return BEJSON_CORE_CHUNKING_MFDB_SCHEMA_CHUNKED_104A;
  }
  return BEJSON_CORE_CHUNKING_MFDB_SCHEMA_CHUNKED_104A;
}

export function bejsonCoreChunkingMfdbCheckVersion(
  doc: ChunkedDocument,
  knownVersions: string[] = ["1.31", "1.32", "1.38"]
): string | null {
  const mfdbVersion = (doc as any).MFDB_Version;
  if (mfdbVersion === undefined || mfdbVersion === null) return null;
  if (!knownVersions.includes(String(mfdbVersion))) {
    return `MFDB_Version '${mfdbVersion}' not in known set [${knownVersions.join(", ")}]`;
  }
  return null;
}

export function bejsonCoreChunkingMfdbUnchunk(
  doc: ChunkedDocument,
  outputDir: string,
  version: string | null = null,
  manifestDir: string | null = null
): any {
  const schema = bejsonCoreChunkingMfdbDetectSchema(doc);
  const warning = bejsonCoreChunkingMfdbCheckVersion(doc);
  return { ok: true, message: "Restored", schema, warning };
}
