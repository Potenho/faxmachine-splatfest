import { NodeType } from "../types/byml-types";

export class BymlWriter {
  private _data: any;
  private _be: boolean;
  private _hashKeyTable: Map<string, number>;
  private _stringTable: Map<string, number>;
  private _buffer: DataView;
  private _offset: number;

  constructor(data: any, be = true) { // Big-endian defaults to "BY"
    if (!(Array.isArray(data) || (typeof data === 'object' && data !== null))) {
      throw new Error("Data must be an object or an array");
    }

    this._data = data;
    this._be = be;
    this._hashKeyTable = new Map();
    this._stringTable = new Map();
    this._buffer = new DataView(new ArrayBuffer(1024 * 1024));
    this._offset = 0;

    this._collectStrings(this._data);
    this._sortTables();
  }

  private _collectStrings(data: any) {
    if (typeof data === 'string') {
      if (!this._stringTable.has(data)) {
        this._stringTable.set(data, this._stringTable.size);
      }
    } else if (Array.isArray(data)) {
      data.forEach(item => this._collectStrings(item));
    } else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        if (!this._hashKeyTable.has(key)) {
          this._hashKeyTable.set(key, this._hashKeyTable.size);
        }
        this._collectStrings(value);
      });
    }
  }

  private _sortTables() {
    const sortedHashKeys = new Map<string, number>();
    Array.from(this._hashKeyTable.keys()).sort().forEach((key, index) => {
      sortedHashKeys.set(key, index);
    });
    this._hashKeyTable = sortedHashKeys;

    const sortedStrings = new Map<string, number>();
    Array.from(this._stringTable.keys()).sort().forEach((key, index) => {
      sortedStrings.set(key, index);
    });
    this._stringTable = sortedStrings;
  }

  private _writeUint8(value: number) {
    this._buffer.setUint8(this._offset, value);
    this._offset += 1;
  }

  private _writeUint16(value: number) {
    this._buffer.setUint16(this._offset, value, !this._be);
    this._offset += 2;
  }

  private _writeUint24(value: number) {
    if (this._be) {
      this._buffer.setUint8(this._offset, (value >> 16) & 0xFF);
      this._buffer.setUint8(this._offset + 1, (value >> 8) & 0xFF);
      this._buffer.setUint8(this._offset + 2, value & 0xFF);
    } else {
      this._buffer.setUint8(this._offset, value & 0xFF);
      this._buffer.setUint8(this._offset + 1, (value >> 8) & 0xFF);
      this._buffer.setUint8(this._offset + 2, (value >> 16) & 0xFF);
    }
    this._offset += 3;
  }

  private _writeUint32(value: number) {
    this._buffer.setUint32(this._offset, value, !this._be);
    this._offset += 4;
  }

  private _writeFloat(value: number) {
    this._buffer.setFloat32(this._offset, value, !this._be);
    this._offset += 4;
  }

  private _writeString(str: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    for (const byte of bytes) {
      this._writeUint8(byte);
    }

    this._writeUint8(0);
  }

  private _alignTo4() {
    while (this._offset % 4 !== 0) {
      this._writeUint8(0);
    }
  }

  private _writeStringTable(table: Map<string, number>): number {
    const startOffset = this._offset;

    this._writeUint8(NodeType.STRING_TABLE);
    this._writeUint24(table.size);

    const offsets: number[] = [];
    table.forEach(() => {
      offsets.push(this._offset);
      this._writeUint32(0);
    });

    table.forEach((_, key) => {
      const stringOffset = this._offset - startOffset;
      this._buffer.setUint32(offsets.shift()!, stringOffset, !this._be);
      this._writeString(key);
    });

    this._alignTo4();
    return startOffset;
  }

  private _writeNode(data: any): number {
    const startOffset = this._offset;

    if (Array.isArray(data)) {
      this._writeUint8(NodeType.ARRAY);
      this._writeUint24(data.length);

      // Writes list of types immediately after size

      data.forEach(item => {
        if (Array.isArray(item)) {
          this._writeUint8(NodeType.ARRAY);
        } else if (typeof item === 'object' && item !== null) {
          this._writeUint8(NodeType.HASH);
        } else if (typeof item === 'string') {
          this._writeUint8(NodeType.STRING);
        } else if (typeof item === 'number') {
          this._writeUint8(Number.isInteger(item) ? NodeType.INT : NodeType.FLOAT);
        } else if (typeof item === 'boolean') {
          this._writeUint8(NodeType.BOOL);
        } else if (item === null) {
          this._writeUint8(NodeType.NULL);
        }
      });

      // Padding to the next multiple of 4 bytes
      this._alignTo4();

      // Write values (inline for simple, offsets for complex)
      const valueOffset = this._offset;
      const complexNodes: { index: number; value: any }[] = [];
      data.forEach((item, index) => {
        if (Array.isArray(item) || (typeof item === 'object' && item !== null)) {
          this._writeUint32(0); // Placeholder for offset
          complexNodes.push({ index, value: item });
        } else {
          if (typeof item === 'string') {
            this._writeUint32(this._stringTable.get(item) ?? 0);
          } else if (typeof item === 'number') {
            if (Number.isInteger(item)) {
              this._writeUint32(item);
            } else {
              this._writeFloat(item);
            }
          } else if (typeof item === 'boolean') {
            this._writeUint32(item ? 1 : 0);
          } else if (item === null) {
            this._writeUint32(0);
          }
        }
      });

      // Write complex nodes and update offsets
      complexNodes.forEach(({ index, value }) => {
        const nodeOffset = this._offset;
        this._buffer.setUint32(valueOffset + index * 4, nodeOffset, !this._be);
        this._writeNode(value);
      });
    } else if (typeof data === 'object' && data !== null) {
      this._writeUint8(NodeType.HASH);
      this._writeUint24(Object.keys(data).length);

      const keys = Object.keys(data).sort();
      const complexNodes: { key: string; value: any; offsetPos: number }[] = [];

      // Write key-value pairs
      keys.forEach((key) => {
        this._writeUint24(this._hashKeyTable.get(key) ?? 0);
        const value = data[key];
        if (Array.isArray(value)) {
          this._writeUint8(NodeType.ARRAY);
          const offsetPos = this._offset;
          this._writeUint32(0); // Placeholder for offset
          complexNodes.push({ key, value, offsetPos });
        } else if (typeof value === 'object' && value !== null) {
          this._writeUint8(NodeType.HASH);
          const offsetPos = this._offset;
          this._writeUint32(0); // Placeholder for offset
          complexNodes.push({ key, value, offsetPos });
        } else if (typeof value === 'string') {
          this._writeUint8(NodeType.STRING);
          this._writeUint32(this._stringTable.get(value) ?? 0);
        } else if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            this._writeUint8(NodeType.INT);
            this._writeUint32(value);
          } else {
            this._writeUint8(NodeType.FLOAT);
            this._writeFloat(value);
          }
        } else if (typeof value === 'boolean') {
          this._writeUint8(NodeType.BOOL);
          this._writeUint32(value ? 1 : 0);
        } else if (value === null) {
          this._writeUint8(NodeType.NULL);
          this._writeUint32(0);
        }
      });

      // Padding to the next multiple of 4 bytes
      this._alignTo4();

      // Write complex nodes and update offsets
      complexNodes.forEach(({ value, offsetPos }) => {
        const nodeOffset = this._offset;
        this._buffer.setUint32(offsetPos, nodeOffset, !this._be);
        this._writeNode(value);
      });
    } else if (typeof data === 'string') {
      this._writeUint8(NodeType.STRING);
      this._writeUint32(this._stringTable.get(data) ?? 0);
    } else if (typeof data === 'number') {
      if (Number.isInteger(data)) {
        this._writeUint8(NodeType.INT);
        this._writeUint32(data);
      } else {
        this._writeUint8(NodeType.FLOAT);
        this._writeFloat(data);
      }
    } else if (typeof data === 'boolean') {
      this._writeUint8(NodeType.BOOL);
      this._writeUint8(data ? 1 : 0);
    } else if (data === null) {
      this._writeUint8(NodeType.NULL);
    }

    return startOffset;
  }

  parseToByaml(): Uint8Array {
    this._writeUint8(this._be ? 0x42 : 0x59); // "BY" or "YB"
    this._writeUint8(this._be ? 0x59 : 0x42);
    this._writeUint16(1); // Ver 1

    const nameTableOffsetPos = this._offset;
    this._writeUint32(0);
    const stringTableOffsetPos = this._offset;
    this._writeUint32(0);
    const rootNodeOffsetPos = this._offset;
    this._writeUint32(0);

    if (this._hashKeyTable.size > 0) {
      const nameTableOffset = this._offset;
      this._buffer.setUint32(nameTableOffsetPos, nameTableOffset, !this._be);
      this._writeStringTable(this._hashKeyTable);
    }

    if (this._stringTable.size > 0) {
      const stringTableOffset = this._offset;
      this._buffer.setUint32(stringTableOffsetPos, stringTableOffset, !this._be);
      this._writeStringTable(this._stringTable);
    }

    const rootNodeOffset = this._offset;
    this._buffer.setUint32(rootNodeOffsetPos, rootNodeOffset, !this._be);
    this._writeNode(this._data);

    return new Uint8Array(this._buffer.buffer.slice(0, this._offset));
  }
}