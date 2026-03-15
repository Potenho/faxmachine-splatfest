import { NodeType, _NUL_CHAR, Endians } from "../types/byml-types";
import { InvalidBymlError } from "../types/errors";



export class BymlParser {
  private _dataView: DataView;

  private _isLittleEndian: boolean;
  private _version: number;
  private _nodeNameTableOffset: number;
  private _stringValueTableOffset: number;
  private _rootNodeOffset: number;

  private _nodeNameTable?: string[];
  private _stringValueTable?: string[];

  constructor(buffer: ArrayBuffer) {
    this._dataView = new DataView(buffer);
    const magic = this._readString(0, 2);

    switch (magic) {
      case Endians.BigEndian: this._isLittleEndian = false; break;
      case Endians.LittleEndian: this._isLittleEndian = true; break;
      default: throw new InvalidBymlError('Invalid Header'); // PlaceHolder Error;
    }

    this._version = this._readUint16(2);
    this._nodeNameTableOffset = this._readUint32(4);
    this._stringValueTableOffset = this._readUint32(8);

    this._rootNodeOffset = this._readUint32(12); // This offset of 12 can change

    if (this._nodeNameTableOffset) {
      this._nodeNameTable = this._parseStringTable(this._nodeNameTableOffset);
    }

    if (this._stringValueTableOffset) {
      this._stringValueTable = this._parseStringTable(this._stringValueTableOffset);
    }

  }

  parse<T = any>(): T | null {
    if ((this._rootNodeOffset) === 0) {
      return null;
    }

    const nodeType = this._readUint8(this._rootNodeOffset);


    if (!this._isContainerType(nodeType)) {
      throw new InvalidBymlError('Not a container type') // PlaceHolder error;
    }

    return this._parseNode(nodeType as NodeType, 12)
  }

  private _parseNode(nodeType: NodeType, offset: number) {
    switch (nodeType) {
      case NodeType.HASH: return this._parseHashNode(this._readUint32(offset))
      case NodeType.ARRAY: return this._parseArrayNode(this._readUint32(offset));
      case NodeType.STRING: return this._parseStringNode(this._readUint32(offset))
      case NodeType.INT: return this._parseIntNode(offset);
      case NodeType.BOOL: return this._parseBoolNode(offset);
      case NodeType.FLOAT: return this._parseFloatNode(offset);
      case NodeType.NULL: return null;
      default: throw new InvalidBymlError('Either not a NodeType or unsupported node type: ' + nodeType + ' ' + offset)
    }
  }

  private _parseFloatNode(offset: number) {
    return this._dataView.getFloat32(offset);
  }

  private _parseHashNode(offset: number) {
    const size = this._readUint24(offset + 1);
    const result: any = {};
    for (let i = 0; i < size; i++) {
      const entryOffset: number = offset + 4 + 8 * i;
      const stringIndex: number = this._readUint24(entryOffset)


      const name = this._nodeNameTable![stringIndex]

      const nodeType = this._readUint8(entryOffset + 3) as NodeType;
      result[name] = this._parseNode(nodeType, entryOffset + 4)
    }

    return result;
  }

  private _parseArrayNode(offset: number) {
    const size = this._readUint24(offset + 1);
    const array: any[] = [];
    const valueArrayOffset = offset + this._alignUp(size, 4) + 4;

    for (let i = 0; i < size; i++) {
      const nodeType = this._readUint8(offset + 4 + i)
      array.push(this._parseNode(nodeType, valueArrayOffset + (4 * i)));
    }

    return array;
  }
  private _parseBoolNode(offset: number) {
    return this._parseUintNode(offset) != 0;
  }

  private _parseUintNode(offset: number) {
    return this._readUint32(offset);
  }

  private _parseStringNode(index: number) {
    return this._stringValueTable![index]
  }

  private _parseIntNode(offset: number) {
    return this._readUint32(offset);
  }

  private _parseStringTable(tableOffset: number): string[] {
    const nodeType = this._readUint8(tableOffset);

    if (nodeType !== NodeType.STRING_TABLE) {
      throw new InvalidBymlError('Invalid node type') // PlaceHolder Error;
    }

    const array: string[] = [];
    const size = this._readUint24(tableOffset + 1);

    for (let i = 0; i < size; i++) {
      const stringOffset = tableOffset + this._readUint32(tableOffset + 4 + (4 * i));
      array.push(this._readStringTillNull(stringOffset))
    }

    return array;
  }

  private _readUint32(offset: number): number {
    const value = this._dataView.getUint32(offset, this._isLittleEndian);
    return value;
  }

  private _readUint24(offset: number): number {
    const byte1 = this._dataView.getUint8(offset);
    const byte2 = this._dataView.getUint8(offset + 1);
    const byte3 = this._dataView.getUint8(offset + 2);

    if (this._isLittleEndian) {
      return (byte3 << 16) | (byte2 << 8) | byte1;
    }

    return (byte1 << 16) | (byte2 << 8) | byte3;

  }


  private _readUint16(offset: number): number {
    const value = this._dataView.getUint16(offset, this._isLittleEndian);
    return value;
  }

  private _readUint8(offset: number): number {
    const value = this._dataView.getUint8(offset);
    return value;
  }

  private _readString(offset: number, length: number): string {
    const bytes = new Uint8Array(this._dataView.buffer, offset, length);
    return new TextDecoder().decode(bytes);
  }

  private _readStringTillNull(offset: number): string {
    const bytes: number[] = [];
    let i = offset;

    while (this._readUint8(i) !== _NUL_CHAR) {
      bytes.push(this._readUint8(i));
      i++;
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  private _alignUp(value: number, size: number): number {
    return value + (size - value % size) % size
  }

  private _isContainerType(nodeType: number): boolean {
    return nodeType === NodeType.ARRAY || nodeType === NodeType.HASH
  }
}


export default BymlParser;
