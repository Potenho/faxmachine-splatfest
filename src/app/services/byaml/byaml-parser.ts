import { Injectable } from "@angular/core";
import BymlParser from "./byaml/byaml-parser";
import { BymlWriter } from "./byaml/byaml-writer";

@Injectable({
  providedIn: 'root',
})
export class Byaml {
  read<T = any>(buffer: ArrayBuffer): T {
    const bymlParser = new BymlParser(buffer);
    const parsed = bymlParser.parse<T>();

    if (!parsed) {
      throw new Error('Failed to parse BYAML');
    }

    return parsed;
  }

  async readFromBlob<T = any>(blob: File): Promise<T> {
    const arrayBuffer = await blob.arrayBuffer();
    return this.read<T>(arrayBuffer);
  }

  write<T = any>(data: T): Uint8Array {
    const byamlWriter = new BymlWriter(data);

    return byamlWriter.parseToByaml();
  }
}