export enum Endians {
	BigEndian = 'BY',
	LittleEndian = 'YB'
}



export enum NodeType {
	STRING = 0xa0, // 
	BINARY = 0xa1,
	ARRAY = 0xc0,
	HASH = 0xc1,
	STRING_TABLE = 0xc2,
	BOOL = 0xd0,
	INT = 0xd1,
	FLOAT = 0xd2,
	UINT = 0xd3,
	INT64 = 0xd4,
	UINT64 = 0xd5,
	DOUBLE = 0xd6,
	NULL = 0xff,
}

export const _NUL_CHAR = 0x00