/// store

import {
  AllCellIdFromSchema,
  CellIdFromSchema,
  DefaultCellIdFromSchema,
  DefaultValueIdFromSchema,
  DefaultedCellFromSchema,
  DefaultedValueFromSchema,
  TableIdFromSchema,
  Truncate,
  ValueIdFromSchema,
} from './internal/store';
import {Id, IdOrNull, Ids, Json} from './common.d';

/// TablesSchema
export type TablesSchema = {[tableId: Id]: {[cellId: Id]: CellSchema}};

/// CellSchema
export type CellSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/// ValuesSchema
export type ValuesSchema = {[valueId: Id]: ValueSchema};

/// ValueSchema
export type ValueSchema =
  | {type: 'string'; default?: string}
  | {type: 'number'; default?: number}
  | {type: 'boolean'; default?: boolean};

/// NoTablesSchema
export type NoTablesSchema = {[tableId: Id]: {[cellId: Id]: {type: 'any'}}};

/// NoValuesSchema
export type NoValuesSchema = {[valueId: Id]: {type: 'any'}};

/// OptionalTablesSchema
export type OptionalTablesSchema = TablesSchema | NoTablesSchema;

/// OptionalValuesSchema
export type OptionalValuesSchema = ValuesSchema | NoValuesSchema;

/// OptionalSchemas
export type OptionalSchemas = [OptionalTablesSchema, OptionalValuesSchema];

/// NoSchemas
export type NoSchemas = [NoTablesSchema, NoValuesSchema];

/// Tables
export type Tables<
  Schema extends OptionalTablesSchema,
  WhenSet extends boolean = false,
> = {
  -readonly [TableId in TableIdFromSchema<Schema>]?: Table<
    Schema,
    TableId,
    WhenSet
  >;
};

/// Table
export type Table<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  WhenSet extends boolean = false,
> = {[rowId: Id]: Row<Schema, TableId, WhenSet>};

/// Row
export type Row<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  WhenSet extends boolean = false,
> = (WhenSet extends true
  ? {
      -readonly [CellId in DefaultCellIdFromSchema<Schema, TableId>]?: Cell<
        Schema,
        TableId,
        CellId
      >;
    }
  : {
      -readonly [CellId in DefaultCellIdFromSchema<Schema, TableId>]: Cell<
        Schema,
        TableId,
        CellId
      >;
    }) & {
  -readonly [CellId in DefaultCellIdFromSchema<Schema, TableId, false>]?: Cell<
    Schema,
    TableId,
    CellId
  >;
};

/// Cell
export type Cell<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  CellType = Schema[TableId][CellId]['type'],
> = CellType extends 'string'
  ? string
  : CellType extends 'number'
  ? number
  : CellType extends 'boolean'
  ? boolean
  : string | number | boolean;

/// CellOrUndefined
export type CellOrUndefined<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
> = Cell<Schema, TableId, CellId> | undefined;

/// Values
export type Values<
  Schema extends OptionalValuesSchema,
  WhenSet extends boolean = false,
> = (WhenSet extends true
  ? {
      -readonly [ValueId in DefaultValueIdFromSchema<Schema>]?: Value<
        Schema,
        ValueId
      >;
    }
  : {
      -readonly [ValueId in DefaultValueIdFromSchema<Schema>]: Value<
        Schema,
        ValueId
      >;
    }) & {
  -readonly [ValueId in DefaultValueIdFromSchema<Schema, false>]?: Value<
    Schema,
    ValueId
  >;
};

/// Value
export type Value<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  ValueType = Schema[ValueId]['type'],
> = ValueType extends 'string'
  ? string
  : ValueType extends 'number'
  ? number
  : ValueType extends 'boolean'
  ? boolean
  : string | number | boolean;

/// ValueOrUndefined
export type ValueOrUndefined<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
> = Value<Schema, ValueId> | undefined;

/// TableCallback
export type TableCallback<
  Schema extends OptionalTablesSchema,
  Params extends any[] = TableIdFromSchema<Schema> extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? [
          tableId: TableId,
          forEachRow: (rowCallback: RowCallback<Schema, TableId>) => void,
        ]
      : never
    : never,
  Params2 extends any[] = Params | [tableId: never, forEachRow: never],
  Params1 extends any[] = Truncate<Params2>,
> = ((...params: Params2) => void) | ((...params: Params1) => void);

/// TableCellCallback
export type TableCellCallback<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = (cellId: CellIdFromSchema<Schema, TableId>, count: number) => void;

/// RowCallback
export type RowCallback<
  Schema extends OptionalTablesSchema,
  TableIdOrNull extends TableIdFromSchema<Schema> | null = null,
  Params extends any[] = [
    rowId: Id,
    forEachCell: (cellCallback: CellCallback<Schema, TableIdOrNull>) => void,
  ],
  Params2 extends any[] = Params | [rowId: never, forEachCell: never],
  // Params1 extends any[] = Truncate<Params2>,
> = Params extends any[] ? (...params: Params2) => void : never;
// | ((...params: Params1) => void)

/// CellCallback
export type CellCallback<
  Schema extends OptionalTablesSchema,
  TableIdOrNull extends TableIdFromSchema<Schema> | null = null,
  Params extends any[] = (
    TableIdOrNull extends null ? TableIdFromSchema<Schema> : TableIdOrNull
  ) extends infer TableId
    ? TableId extends TableIdFromSchema<Schema>
      ? CellIdFromSchema<Schema, TableId> extends infer CellId
        ? CellId extends CellIdFromSchema<Schema, TableId>
          ? [cellId: CellId, cell: Cell<Schema, TableId, CellId>]
          : never
        : never
      : never
    : never,
  Params2 extends any[] = Params | [cellId: never, cell: never],
  Params1 extends any[] = Truncate<Params2>,
> = Params extends any[]
  ? ((...params: Params2) => void) | ((...params: Params1) => void)
  : never;

/// ValueCallback
export type ValueCallback<
  Schema extends OptionalValuesSchema,
  Params extends any[] = ValueIdFromSchema<Schema> extends infer ValueId
    ? ValueId extends ValueIdFromSchema<Schema>
      ?
          | [valueId: ValueId, value: Value<Schema, ValueId>]
          | [valueId: never, value: never]
      : never
    : never,
  Params2 extends any[] = Params | [valueId: never, value: never],
  Params1 extends any[] = Truncate<Params2>,
> = Params extends any[]
  ? ((...params: Params2) => void) | ((...params: Params1) => void)
  : never;

/// MapCell
export type MapCell<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
> = (
  cell: CellOrUndefined<Schema, TableId, CellId>,
) => Cell<Schema, TableId, CellId>;

/// MapValue
export type MapValue<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema> = ValueIdFromSchema<Schema>,
> = (value: ValueOrUndefined<Schema, ValueId>) => Value<Schema, ValueId>;

/// GetCell
export type GetCell<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
> = <CellId extends CellIdFromSchema<Schema, TableId>>(
  cellId: CellId,
) => DefaultedCellFromSchema<Schema, TableId, CellId>;

/// IdAddedOrRemoved
export type IdAddedOrRemoved = 1 | -1;

/// ChangedTableIds
export type ChangedTableIds<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]: IdAddedOrRemoved;
};

/// ChangedRowIds
export type ChangedRowIds<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]: {[rowId: Id]: IdAddedOrRemoved};
};

/// ChangedCellIds
export type ChangedCellIds<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]: {
    [rowId: Id]: {
      [CellId in CellIdFromSchema<Schema, TableId>]: IdAddedOrRemoved;
    };
  };
};

/// ChangedValueIds
export type ChangedValueIds<Schema extends OptionalValuesSchema> = {
  [ValueId in ValueIdFromSchema<Schema>]: IdAddedOrRemoved;
};

/// DoRollback
export type DoRollback<Schemas extends OptionalSchemas> = (
  getTransactionChanges: GetTransactionChanges<Schemas>,
  getTransactionLog: GetTransactionLog<Schemas>,
) => boolean;

/// TransactionListener
export type TransactionListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  getTransactionChanges: GetTransactionChanges<Schemas>,
  getTransactionLog: GetTransactionLog<Schemas>,
) => void;

/// TablesListener
export type TablesListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  getCellChange: GetCellChange<Schemas[0]> | undefined,
) => void;

/// TableIdsListener
export type TableIdsListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  getIdChanges: GetIdChanges<TableIdFromSchema<Schemas[0]>> | undefined,
) => void;

/// TableListener
export type TableListener<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
> = (
  store: Store<Schemas>,
  tableId: TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  getCellChange: GetCellChange<Schemas[0]> | undefined,
) => void;

/// TableCellIdsListener
export type TableCellIdsListener<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  Params extends any[] = (
    TableIdOrNull extends null ? TableIdFromSchema<Schemas[0]> : TableIdOrNull
  ) extends infer TableId
    ? TableId extends TableIdFromSchema<Schemas[0]>
      ? [
          store: Store<Schemas>,
          tableId: TableId,
          getIdChanges: GetIdChanges<CellIdFromSchema<Schemas[0], TableId>>,
        ]
      : never
    : never,
  Params3 extends any[] =
    | Params
    | [store: never, tableId: never, getIdChanges: never],
  Params2 extends any[] = Truncate<Params3>,
  // Params1 extends any[] = Truncate<Params2>,
> = Params extends any
  ? ((...params: Params3) => void) | ((...params: Params2) => void)
  : // | ((...params: Params1) => void)
    never;

/// RowIdsListener
export type RowIdsListener<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
> = (
  store: Store<Schemas>,
  tableId: TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  getIdChanges: GetIdChanges<Id> | undefined,
) => void;

/// SortedRowIdsListener
export type SortedRowIdsListener<
  Schemas extends OptionalSchemas,
  TableId extends TableIdFromSchema<Schemas[0]>,
  CellId extends CellIdFromSchema<Schemas[0], TableId> | undefined,
  Descending extends boolean,
  Offset extends number,
  Limit extends number | undefined,
> = (
  store: Store<Schemas>,
  tableId: TableId,
  cellId: CellId,
  descending: Descending,
  offset: Offset,
  limit: Limit,
  sortedRowIds: Ids,
) => void;

/// RowListener
export type RowListener<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull,
> = (
  store: Store<Schemas>,
  tableId: TableIdOrNull extends null
    ? TableIdFromSchema<Schemas[0]>
    : TableIdOrNull,
  rowId: RowIdOrNull extends null ? Id : RowIdOrNull,
  getCellChange: GetCellChange<Schemas[0]> | undefined,
) => void;

/// CellIdsListener
export type CellIdsListener<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull,
  Params extends any[] = (
    TableIdOrNull extends null ? TableIdFromSchema<Schemas[0]> : TableIdOrNull
  ) extends infer TableId
    ? TableId extends TableIdFromSchema<Schemas[0]>
      ? [
          store: Store<Schemas>,
          tableId: TableId,
          rowId: RowIdOrNull extends null ? Id : RowIdOrNull,
          getIdChanges: GetIdChanges<CellIdFromSchema<Schemas[0], TableId>>,
        ]
      : never
    : never,
  Params4 extends any[] =
    | Params
    | [store: never, tableId: never, rowId: never, getIdChanges: never],
  Params3 extends any[] = Truncate<Params4>,
  // Params2 extends any[] = Truncate<Params3>,
  // Params1 extends any[] = Truncate<Params2>,
> = Params extends any
  ? ((...params: Params4) => void) | ((...params: Params3) => void)
  : //  | ((...params: Params2) => void)
    // | ((...params: Params1) => void)
    never;

/// CellListener
export type CellListener<
  Schemas extends OptionalSchemas,
  TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  RowIdOrNull extends IdOrNull,
  CellIdOrNull extends
    | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
        ? CellIdFromSchema<Schemas[0], TableIdOrNull>
        : AllCellIdFromSchema<Schemas[0]>)
    | null,
  Params extends any[] = (
    TableIdOrNull extends null ? TableIdFromSchema<Schemas[0]> : TableIdOrNull
  ) extends infer TableId
    ? TableId extends TableIdFromSchema<Schemas[0]>
      ? (
          CellIdOrNull extends null
            ? CellIdFromSchema<Schemas[0], TableId>
            : CellIdOrNull
        ) extends infer CellId
        ? CellId extends CellIdFromSchema<Schemas[0], TableId>
          ? [
              store: Store<Schemas>,
              tableId: TableId,
              rowId: RowIdOrNull extends null ? Id : RowIdOrNull,
              cellId: CellId,
              newCell: Cell<Schemas[0], TableId, CellId>,
              oldCell: Cell<Schemas[0], TableId, CellId>,
              getCellChange: GetCellChange<Schemas[0]> | undefined,
            ]
          : never
        : never
      : never
    : never,
  Params7 extends any[] =
    | Params
    | [
        store: never,
        tableId: never,
        rowId: never,
        cellId: never,
        newCell: never,
        oldCell: never,
        getCellChange: never,
      ],
  Params6 extends any[] = Truncate<Params7>,
  Params5 extends any[] = Truncate<Params6>,
  Params4 extends any[] = Truncate<Params5>,
  // Params3 extends any[] = Truncate<Params4>,
  // Params2 extends any[] = Truncate<Params3>,
  // Params1 extends any[] = Truncate<Params2>,
> = Params extends any
  ?
      | ((...params: Params7) => void)
      | ((...params: Params6) => void)
      | ((...params: Params5) => void)
      | ((...params: Params4) => void)
  : // The unions may no longer be discriminatory with fewer parameters, and
    // TypeScript fails to resolve callback signatures in some cases.
    // | ((...params: Params3) => void)
    // | ((...params: Params2) => void)
    // | ((...params: Params1) => void)
    never;

/// ValuesListener
export type ValuesListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  getValueChange: GetValueChange<Schemas[1]> | undefined,
) => void;

/// ValueIdsListener
export type ValueIdsListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  getIdChanges: GetIdChanges<ValueIdFromSchema<Schemas[1]>> | undefined,
) => void;

/// ValueListener
export type ValueListener<
  Schemas extends OptionalSchemas,
  ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null,
  Params extends any[] = (
    ValueIdOrNull extends null ? ValueIdFromSchema<Schemas[1]> : ValueIdOrNull
  ) extends infer ValueId
    ? ValueId extends ValueIdFromSchema<Schemas[1]>
      ? [
          store: Store<Schemas>,
          valueId: ValueId,
          newValue: Value<Schemas[1], ValueId>,
          oldValue: Value<Schemas[1], ValueId>,
          getValueChange: GetValueChange<Schemas[1]> | undefined,
        ]
      : never
    : never,
  Params5 extends any[] =
    | Params
    | [
        store: never,
        valueId: never,
        newValue: never,
        oldValue: never,
        getValueChange: never,
      ],
  Params4 extends any[] = Truncate<Params5>,
  Params3 extends any[] = Truncate<Params4>,
  Params2 extends any[] = Truncate<Params3>,
  //  Params1 extends any[] = Truncate<Params2>,
> = Params extends any
  ?
      | ((...params: Params5) => void)
      | ((...params: Params4) => void)
      | ((...params: Params3) => void)
      | ((...params: Params2) => void)
  : // | ((...params: Params1) => void)
    never;

/// InvalidCellListener
export type InvalidCellListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  invalidCells: any[],
) => void;

/// InvalidValueListener
export type InvalidValueListener<Schemas extends OptionalSchemas> = (
  store: Store<Schemas>,
  valueId: Id,
  invalidValues: any[],
) => void;

/// GetIdChanges
export type GetIdChanges<ValidId extends Id> = () => {
  [Id in ValidId]?: 1 | -1;
};

/// GetCellChange
export type GetCellChange<Schema extends OptionalTablesSchema> = <
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
>(
  tableId: TableId,
  rowId: Id,
  cellId: CellId,
) => CellChange<Schema, TableId, CellId>;

/// CellChange
export type CellChange<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
  CellOrUndefined = Cell<Schema, TableId, CellId> | undefined,
> = [changed: boolean, oldCell: CellOrUndefined, newCell: CellOrUndefined];

/// GetValueChange
export type GetValueChange<Schema extends OptionalValuesSchema> = <
  ValueId extends ValueIdFromSchema<Schema>,
>(
  valueId: ValueId,
) => ValueChange<Schema, ValueId>;

/// ValueChange
export type ValueChange<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
  ValueOrUndefined = Value<Schema, ValueId> | undefined,
> = [changed: boolean, oldValue: ValueOrUndefined, newValue: ValueOrUndefined];

/// ChangedCells
export type ChangedCells<Schema extends OptionalTablesSchema> = {
  [TableId in TableIdFromSchema<Schema>]?: {
    [rowId: Id]: {
      [CellId in CellIdFromSchema<Schema, TableId>]?: ChangedCell<
        Schema,
        TableId,
        CellId
      >;
    };
  };
};

/// ChangedCell
export type ChangedCell<
  Schema extends OptionalTablesSchema,
  TableId extends TableIdFromSchema<Schema>,
  CellId extends CellIdFromSchema<Schema, TableId>,
> = [
  CellOrUndefined<Schema, TableId, CellId>,
  CellOrUndefined<Schema, TableId, CellId>,
];

/// InvalidCells
export type InvalidCells = {
  [tableId: Id]: {[rowId: Id]: {[cellId: Id]: any[]}};
};

/// ChangedValues
export type ChangedValues<Schema extends OptionalValuesSchema> = {
  [ValueId in ValueIdFromSchema<Schema>]?: ChangedValue<Schema, ValueId>;
};

/// ChangedValue
export type ChangedValue<
  Schema extends OptionalValuesSchema,
  ValueId extends ValueIdFromSchema<Schema>,
> = [
  DefaultedValueFromSchema<Schema, ValueId>,
  DefaultedValueFromSchema<Schema, ValueId>,
];

/// InvalidValues
export type InvalidValues = {[valueId: Id]: any[]};

// TransactionChanges
export type TransactionChanges<Schemas extends OptionalSchemas> = [
  {
    [TableId in TableIdFromSchema<Schemas[0]>]?: {
      [rowId: Id]:
        | {
            [CellId in CellIdFromSchema<Schemas[0], TableId>]?: Cell<
              Schemas[0],
              TableId,
              CellId
            > | null;
          }
        | null;
    } | null;
  },
  {
    [ValueId in ValueIdFromSchema<Schemas[1]>]?: Value<
      Schemas[1],
      ValueId
    > | null;
  },
];

/// GetTransactionChanges
export type GetTransactionChanges<Schemas extends OptionalSchemas> =
  () => TransactionChanges<Schemas>;

/// TransactionLog
export type TransactionLog<Schemas extends OptionalSchemas> = {
  cellsTouched: boolean;
  valuesTouched: boolean;
  changedCells: ChangedCells<Schemas[0]>;
  invalidCells: InvalidCells;
  changedValues: ChangedValues<Schemas[1]>;
  invalidValues: InvalidValues;
  changedTableIds: ChangedTableIds<Schemas[0]>;
  changedRowIds: ChangedRowIds<Schemas[0]>;
  changedCellIds: ChangedCellIds<Schemas[0]>;
  changedValueIds: ChangedValueIds<Schemas[1]>;
};

/// GetTransactionLog
export type GetTransactionLog<Schemas extends OptionalSchemas> =
  () => TransactionLog<Schemas>;

/// StoreListenerStats
export type StoreListenerStats = {
  /// StoreListenerStats.tables
  tables?: number;
  /// StoreListenerStats.tableIds
  tableIds?: number;
  /// StoreListenerStats.table
  table?: number;
  /// StoreListenerStats.tableCellIds
  tableCellIds?: number;
  /// StoreListenerStats.rowIds
  rowIds?: number;
  /// StoreListenerStats.sortedRowIds
  sortedRowIds?: number;
  /// StoreListenerStats.row
  row?: number;
  /// StoreListenerStats.cellIds
  cellIds?: number;
  /// StoreListenerStats.cell
  cell?: number;
  /// StoreListenerStats.invalidCell
  invalidCell?: number;
  /// StoreListenerStats.values
  values?: number;
  /// StoreListenerStats.valueIds
  valueIds?: number;
  /// StoreListenerStats.value
  value?: number;
  /// StoreListenerStats.invalidValue
  invalidValue?: number;
  /// StoreListenerStats.transaction
  transaction?: number;
};

/// Store
export interface Store<in out Schemas extends OptionalSchemas> {
  /// Store.getContent
  getContent(): [Tables<Schemas[0]>, Values<Schemas[1]>];

  /// Store.getTables
  getTables(): Tables<Schemas[0]>;

  /// Store.getTableIds
  getTableIds(): TableIdFromSchema<Schemas[0]>[];

  /// Store.getTable
  getTable<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
  ): Table<Schemas[0], TableId>;

  /// Store.getTableCellIds
  getTableCellIds<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
  ): CellIdFromSchema<Schemas[0], TableId>[];

  /// Store.getRowIds
  getRowIds(tableId: TableIdFromSchema<Schemas[0]>): Ids;

  /// Store.getSortedRowIds
  getSortedRowIds<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    cellId?: CellIdFromSchema<Schemas[0], TableId>,
    descending?: boolean,
    offset?: number,
    limit?: number,
  ): Ids;

  /// Store.getRow
  getRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
  ): Row<Schemas[0], TableId>;

  /// Store.getCellIds
  getCellIds<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
  ): CellIdFromSchema<Schemas[0], TableId>[];

  /// Store.getCell
  getCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
  ): CellOrUndefined<Schemas[0], TableId, CellId>;

  /// Store.getValues
  getValues(): Values<Schemas[1]>;

  /// Store.getValueIds
  getValueIds(): ValueIdFromSchema<Schemas[1]>[];

  /// Store.getValue
  getValue<ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
  ): DefaultedValueFromSchema<Schemas[1], ValueId>;

  /// Store.hasTables
  hasTables(): boolean;

  /// Store.hasTable
  hasTable(tableId: TableIdFromSchema<Schemas[0]>): boolean;

  /// Store.hasTableCell
  hasTableCell<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    cellId: CellIdFromSchema<Schemas[0], TableId>,
  ): boolean;

  /// Store.hasRow
  hasRow(tableId: TableIdFromSchema<Schemas[0]>, rowId: Id): boolean;

  /// Store.hasCell
  hasCell<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    cellId: CellIdFromSchema<Schemas[0], TableId>,
  ): boolean;

  /// Store.hasValues
  hasValues(): boolean;

  /// Store.hasValue
  hasValue(valueId: ValueIdFromSchema<Schemas[1]>): boolean;

  /// Store.getTablesJson
  getTablesJson(): Json;

  /// Store.getValuesJson
  getValuesJson(): Json;

  /// Store.getJson
  getJson(): Json;

  /// Store.getTablesSchemaJson
  getTablesSchemaJson(): Json;

  /// Store.getValuesSchemaJson
  getValuesSchemaJson(): Json;

  /// Store.getSchemaJson
  getSchemaJson(): Json;

  /// Store.setContent
  setContent([tables, values]: [
    Tables<Schemas[0], true>,
    Values<Schemas[1], true>,
  ]): Store<Schemas>;

  /// Store.setTables
  setTables(tables: Tables<Schemas[0], true>): Store<Schemas>;

  /// Store.setTable
  setTable<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    table: Table<Schemas[0], TableId, true>,
  ): Store<Schemas>;

  /// Store.setRow
  setRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    row: Row<Schemas[0], TableId, true>,
  ): Store<Schemas>;

  /// Store.addRow
  addRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    row: Row<Schemas[0], TableId, true>,
    reuseRowIds?: boolean,
  ): Id | undefined;

  /// Store.setPartialRow
  setPartialRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    partialRow: Row<Schemas[0], TableId, true>,
  ): Store<Schemas>;

  /// Store.setCell
  setCell<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellId extends CellIdFromSchema<Schemas[0], TableId>,
  >(
    tableId: TableId,
    rowId: Id,
    cellId: CellId,
    cell:
      | Cell<Schemas[0], TableId, CellId>
      | MapCell<Schemas[0], TableId, CellId>,
  ): Store<Schemas>;

  /// Store.setValues
  setValues(values: Values<Schemas[1], true>): Store<Schemas>;

  /// Store.setPartialValues
  setPartialValues(partialValues: Values<Schemas[1], true>): Store<Schemas>;

  /// Store.setValue
  setValue<ValueId extends ValueIdFromSchema<Schemas[1]>>(
    valueId: ValueId,
    value: Value<Schemas[1], ValueId> | MapValue<Schemas[1], ValueId>,
  ): Store<Schemas>;

  /// Store.setTransactionChanges
  setTransactionChanges(
    transactionChanges: TransactionChanges<Schemas>,
  ): Store<Schemas>;

  /// Store.setTablesJson
  setTablesJson(tablesJson: Json): Store<Schemas>;

  /// Store.setValuesJson
  setValuesJson(valuesJson: Json): Store<Schemas>;

  /// Store.setJson
  setJson(tablesAndValuesJson: Json): Store<Schemas>;

  /// Store.setTablesSchema
  setTablesSchema<TS extends TablesSchema>(
    tablesSchema: TS,
  ): Store<[typeof tablesSchema, Schemas[1]]>;

  /// Store.setValuesSchema
  setValuesSchema<VS extends ValuesSchema>(
    valuesSchema: VS,
  ): Store<[Schemas[0], typeof valuesSchema]>;

  /// Store.setSchema
  setSchema<TS extends TablesSchema, VS extends ValuesSchema>(
    tablesSchema: TS,
    valuesSchema?: VS,
  ): Store<
    [
      typeof tablesSchema,
      Exclude<ValuesSchema, typeof valuesSchema> extends never
        ? NoValuesSchema
        : NonNullable<typeof valuesSchema>,
    ]
  >;

  /// Store.delTables
  delTables(): Store<Schemas>;

  /// Store.delTable
  delTable(tableId: TableIdFromSchema<Schemas[0]>): Store<Schemas>;

  /// Store.delRow
  delRow(tableId: TableIdFromSchema<Schemas[0]>, rowId: Id): Store<Schemas>;

  /// Store.delCell
  delCell<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    cellId: CellIdFromSchema<Schemas[0], TableId>,
    forceDel?: boolean,
  ): Store<Schemas>;

  /// Store.delValues
  delValues(): Store<Schemas>;

  /// Store.delValue
  delValue(valueId: ValueIdFromSchema<Schemas[1]>): Store<Schemas>;

  /// Store.delTablesSchema
  delTablesSchema<
    ValuesSchema extends OptionalValuesSchema = Schemas[1],
  >(): Store<[NoTablesSchema, ValuesSchema]>;

  /// Store.delValuesSchema
  delValuesSchema<
    TablesSchema extends OptionalTablesSchema = Schemas[0],
  >(): Store<[TablesSchema, NoValuesSchema]>;

  /// Store.delSchema
  delSchema(): Store<NoSchemas>;

  /// Store.transaction
  transaction<Return>(
    actions: () => Return,
    doRollback?: DoRollback<Schemas>,
  ): Return;

  /// Store.startTransaction
  startTransaction(): Store<Schemas>;

  /// Store.finishTransaction
  finishTransaction(doRollback?: DoRollback<Schemas>): Store<Schemas>;

  /// Store.forEachTable
  forEachTable(tableCallback: TableCallback<Schemas[0]>): void;

  /// Store.forEachTableCell
  forEachTableCell<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    tableCellCallback: TableCellCallback<Schemas[0], TableId>,
  ): void;

  /// Store.forEachRow
  forEachRow<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowCallback: RowCallback<Schemas[0], TableId>,
  ): void;

  /// Store.forEachCell
  forEachCell<TableId extends TableIdFromSchema<Schemas[0]>>(
    tableId: TableId,
    rowId: Id,
    cellCallback: CellCallback<Schemas[0], TableId>,
  ): void;

  /// Store.forEachValue
  forEachValue(valueCallback: ValueCallback<Schemas[1]>): void;

  /// Store.addTablesListener
  addTablesListener(listener: TablesListener<Schemas>, mutator?: boolean): Id;

  /// Store.addTableIdsListener
  addTableIdsListener(
    listener: TableIdsListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addTableListener
  addTableListener<TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: TableIdOrNull,
    listener: TableListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addTableCellIdsListener
  addTableCellIdsListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
  >(
    tableId: TableIdOrNull,
    listener: TableCellIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addRowIdsListener
  addRowIdsListener<TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null>(
    tableId: TableIdOrNull,
    listener: RowIdsListener<Schemas, TableIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addSortedRowIdsListener
  addSortedRowIdsListener<
    TableId extends TableIdFromSchema<Schemas[0]>,
    CellIdOrUndefined extends CellIdFromSchema<Schemas[0], TableId> | undefined,
    Descending extends boolean,
    Offset extends number,
    Limit extends number | undefined,
  >(
    tableId: TableId,
    cellId: CellIdOrUndefined,
    descending: Descending,
    offset: Offset,
    limit: Limit,
    listener: SortedRowIdsListener<
      Schemas,
      TableId,
      CellIdOrUndefined,
      Descending,
      Offset,
      Limit
    >,
    mutator?: boolean,
  ): Id;

  /// Store.addRowListener
  addRowListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: RowListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addCellIdsListener
  addCellIdsListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    listener: CellIdsListener<Schemas, TableIdOrNull, RowIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addCellListener
  addCellListener<
    TableIdOrNull extends TableIdFromSchema<Schemas[0]> | null,
    RowIdOrNull extends IdOrNull,
    CellIdOrNull extends
      | (TableIdOrNull extends TableIdFromSchema<Schemas[0]>
          ? CellIdFromSchema<Schemas[0], TableIdOrNull>
          : AllCellIdFromSchema<Schemas[0]>)
      | null,
  >(
    tableId: TableIdOrNull,
    rowId: RowIdOrNull,
    cellId: CellIdOrNull,
    listener: CellListener<Schemas, TableIdOrNull, RowIdOrNull, CellIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addValuesListener
  addValuesListener(listener: ValuesListener<Schemas>, mutator?: boolean): Id;

  /// Store.addValueIdsListener
  addValueIdsListener(
    listener: ValueIdsListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addValueListener
  addValueListener<ValueIdOrNull extends ValueIdFromSchema<Schemas[1]> | null>(
    valueId: ValueIdOrNull,
    listener: ValueListener<Schemas, ValueIdOrNull>,
    mutator?: boolean,
  ): Id;

  /// Store.addInvalidCellListener
  addInvalidCellListener(
    tableId: IdOrNull,
    rowId: IdOrNull,
    cellId: IdOrNull,
    listener: InvalidCellListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addInvalidValueListener
  addInvalidValueListener(
    valueId: IdOrNull,
    listener: InvalidValueListener<Schemas>,
    mutator?: boolean,
  ): Id;

  /// Store.addStartTransactionListener
  addStartTransactionListener(listener: TransactionListener<Schemas>): Id;

  /// Store.addWillFinishTransactionListener
  addWillFinishTransactionListener(listener: TransactionListener<Schemas>): Id;

  /// Store.addDidFinishTransactionListener
  addDidFinishTransactionListener(listener: TransactionListener<Schemas>): Id;

  /// Store.callListener
  callListener(listenerId: Id): Store<Schemas>;

  /// Store.delListener
  delListener(listenerId: Id): Store<Schemas>;

  /// Store.getListenerStats
  getListenerStats(): StoreListenerStats;
}

/// createStore
export function createStore(): Store<NoSchemas>;
