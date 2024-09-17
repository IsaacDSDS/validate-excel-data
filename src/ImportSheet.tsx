import { useState } from "react";

import { ReactSpreadsheetImport, StepType } from "react-spreadsheet-import";
import { Columns } from "react-spreadsheet-import/types/steps/MatchColumnsStep/MatchColumnsStep";
import { StepState } from "react-spreadsheet-import/types/steps/UploadFlow";
import {
  Data,
  RawData,
  Validation,
} from "react-spreadsheet-import/types/types";
import { z } from "zod";

const schema = z.object({
  stone_type: z.string(),
  material: z.string(),
  no_block: z.string(),
  bundle: z.string().optional(),
  no_lot: z.string(),
  thickness: z.string(),
  finishing: z.string(),
  no_slab: z.string(),
  accounting_sku: z.string(),
  buy_width: z.string(),
  buy_height: z.string(),
  sell_width: z.string().optional(),
  sell_height: z.string().optional(),
  arrival_date: z.string(),
  price_type: z.string(),
  cost: z.string(),
  transport: z.string(),
});
type CustomSchema = z.infer<typeof schema>;

interface SelectOption {
  label: string;
  value: string;
}

interface Config {
  label: string;
  key: string;
  fileType: "input" | "checkbox" | "select";
  options?: SelectOption[];
  example?: string;
  validations: Validation[];
}

const validFields: Config[] = [
  {
    label: "STONE TYPE",
    key: "stone_type",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "MATERIAL",
    key: "material",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "BLOCK #",
    key: "no_block",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "BUNDLE (OPTIONAL)",
    key: "bundle",
    fileType: "input",
    validations: [],
  },
  {
    label: "LOT #",
    key: "no_lot",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "THICKNESS",
    key: "thickness",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "FINISHING",
    key: "finishing",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "SLAB #",
    key: "no_slab",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "ACCOUNTING SKU",
    key: "accounting_sku",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "BUY WIDTH",
    key: "buy_width",
    fileType: "input",
    validations: [
      {
        rule: "regex",
        value: "^\\d+$",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "BUY HEIGHT",
    key: "buy_height",
    fileType: "input",
    validations: [
      {
        rule: "regex",
        value: "^\\d+$",
        errorMessage: "",
      },
    ],
  },
  {
    label: "SELL WIDTH (OPTIONAL)",
    key: "sell_width",
    fileType: "input",
    validations: [],
  },
  {
    label: "SELL HEIGHT (OPTIONAL)",
    key: "sell_height",
    fileType: "input",
    validations: [
      {
        rule: "regex",
        value: "^\\d+$",
        errorMessage: "This field cannot be empty",
        level: "warning",
      },
    ],
  },
  {
    label: "ARRIVAL DATE",
    key: "arrival_date",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "PRICE TYPE",
    key: "price_type",
    fileType: "select",
    options: [
      { label: "FIXED", value: "fixed" },
      { label: "SIZE", value: "size" },
    ],
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "COST",
    key: "cost",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
  {
    label: "TRANSPORT",
    key: "transport",
    fileType: "input",
    validations: [
      {
        rule: "required",
        errorMessage: "This field cannot be empty",
        level: "error",
      },
    ],
  },
];

function App() {
  const fields = validFields.map((e) => ({
    label: e.label,
    key: e.key,
    fieldType: {
      type: e.fileType,
      options: e.options,
    },
    example: e.example,
    validations: e.validations,
  }));

  const [showImport, setShowImport] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepState>({
    type: StepType.upload,
  });
  return (
    <main className="main">
      <button
        onClick={() => {
          setShowImport(true);
        }}
        className="button"
      >
        Show
      </button>
      <ReactSpreadsheetImport
        isOpen={showImport}
        allowInvalidSubmit={false}
        autoMapSelectValues
        onClose={() => {
          setShowImport(false);
        }}
        onSubmit={(data, file) => {
          console.log(data);
          console.log(file);
        }}
        autoMapDistance={2}
        fields={fields}
        uploadStepHook={async (data: RawData[]) => {
          return data;
        }}
        selectHeaderStepHook={async (
          headerValues: RawData,
          data: RawData[]
        ) => {
          return {
            headerValues,
            data,
          };
        }}
        matchColumnsStepHook={async (
          table: Data<string>[],
          rawData: RawData[],
          columns: Columns<string>
        ) => {
          return table;
        }}
        rowHook={(data: any, addError) => {
          try {
            const parsedData: CustomSchema = schema.parse(data);
            return parsedData;
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach(({ path, message }) => {
                addError(`${path.join(".")}`, { message, level: "error" });
              });
            }
            return data;
          }
        }}
      />
    </main>
  );
}

export default App;
