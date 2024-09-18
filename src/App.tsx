/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useEffect, useRef, useState } from "react";
import { z } from "zod";
import * as XLSX from "xlsx";

const schema = z.object({
  stone_type: z.string(),
  material: z.string(),
  block_no: z.string(),
  bundle: z.number().optional(),
  lot_no: z.string(),
  thickness: z.string(),
  finishing: z.string(),
  slab_no: z.number(),
  accounting_sku: z.string(),
  buy_width: z.number(),
  buy_height: z.number(),
  sell_width: z.string().optional(),
  sell_height: z.string().optional(),
  arrival_date: z.string(),
  price_type: z.string(),
  cost: z.string(),
  transport: z.string(),
});

type SchemaType = z.infer<typeof schema>;

interface RowData extends SchemaType {
  errors?: z.ZodIssue[];
}

function App() {
  const [showImport, setShowImport] = useState(false);
  const [rowsWithErrors, setRowsWithErrors] = useState<RowData[]>();
  const [validRows, setValidRows] = useState<RowData[]>();

  /**
   * Esta función lo que hace es quitarle los espacios al principio y al final
   *  que puedan tener las keys de la data
   */
  function trimObjectKeys(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
      const trimmedKey = key.trim().trim();
      acc[trimmedKey] = obj[key];
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Esta función es la encargada de convertir las keys.
   * Por ejemplo: "SLAB #" a "slab_no"
   */
  const formatKey = (key: string): string => {
    return key
      .replace(/\(OPTIONAL\)/gi, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/#/g, "no")
      .toLowerCase();
  };

  /**
   * Esta función es la encargada de obtener los datos del excel y validarlos
   * para luego agregarlos a los estados de los rows validos y con error
   */
  const handleFileImport = (file: File): void => {
    const reader = new FileReader();
    const fileType = file.name.split(".").pop()?.toLowerCase();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      let workbook: XLSX.WorkBook;
      if (fileType === "csv") {
        const csvData = event.target?.result as string;
        workbook = XLSX.read(csvData, { type: "string" });
      } else {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        workbook = XLSX.read(data, { type: "array" });
      }

      //TODO: hacer que se abra un modal cuando esté en este paso para seleccionar la sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      let jsonData: Record<any, any>[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      const headers: string[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      })[0] as string[];

      jsonData = jsonData.map((row: any) => {
        const trimmedRow = trimObjectKeys(row);
        const formattedRow: Record<any, any> = {};
        headers.forEach((header) => {
          const timmedHeader = header.trim();
          const formattedKey = formatKey(timmedHeader);
          formattedRow[formattedKey] =
            trimmedRow[timmedHeader] !== undefined
              ? trimmedRow[timmedHeader]
              : "";
        });
        return formattedRow;
      });
      jsonData.forEach((e) => {
        const value = e as SchemaType;
        const result = schema.safeParse(value);
        if (!result.success) {
          setRowsWithErrors((prev) => [
            ...(prev ?? []),
            { ...value, errors: result.error.errors },
          ]);
        } else {
          setValidRows((prev) => [...(prev ?? []), value]);
          console.log("Validación exitosa:", result.data);
        }
      });
      console.log("This is all the data: ", jsonData);
    };
    if (fileType === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <main className="bg-green-100 w-screen h-screen flex justify-center items-center">
      <button
        onClick={() => setShowImport((prev) => !prev)}
        className="w-28 h-12 bg-red-500 rounded-md font-semibold"
      >
        Open Modal
      </button>

      {showImport && (
        <ImportExcelModal
          showImport={showImport}
          setShowImport={setShowImport}
          onFile={(file: File): void => {
            if (file) {
              handleFileImport(file);
              setShowImport(false);
            }
          }}
        />
      )}
      {/* {showSelectSheet && (
        <SelectSheetModal
          sheetNames={sheetNames}
          handleSheetSelection={handleSheetSelection}
          setShowSelectSheet={setShowSelectSheet}
          isOpen={showSelectSheet}
        />
      )} */}
    </main>
  );
}

function ImportExcelModal({
  showImport,
  setShowImport,
  onFile,
}: {
  showImport: boolean;
  setShowImport: any;
  onFile: (file: File) => void;
}) {
  const drop = useRef<HTMLDivElement>(null);
  const [onDropOver, setOnDropOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    drop?.current?.addEventListener("dragover", handleDragOver);
    drop?.current?.addEventListener("drop", handleDrop);

    return () => {
      drop?.current?.removeEventListener("dragover", handleDragOver);
      drop?.current?.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleDragOver = (e: any) => {
    setOnDropOver(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: any) => {
    setOnDropOver(false);
    e.preventDefault();
    e.stopPropagation();
    const files = [...e.dataTransfer.files];
    if (files.length > 1) {
      return;
    }
    onFile(files[0]);
  };

  const handleInput = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.target.files;
    if (files && files.length === 1) {
      onFile(files[0]);
    }
  };

  return (
    <Modal showModal={showImport}>
      <article className="w-2/3  bg-white rounded-md p-7">
        <section className="w-full flex flex-col gap-2 items-center relative">
          <span
            className="absolute -top-5 -right-5 text-red-500 cursor-pointer z-40"
            onClick={() => setShowImport((prev: boolean) => !prev)}
          >
            X
          </span>

          <div
            onClick={() => {}}
            ref={drop}
            className={`relative flex h-full w-full flex-col flex-nowrap items-center justify-center rounded-md border ${
              onDropOver ? "bg-[#e3e9fb]" : "bg-transparent"
            } p-12`}
            style={{
              borderColor: "#eeeef0",
            }}
          >
            <input
              multiple={false}
              onChange={handleInput}
              type="file"
              accept=".xlsx,.xls,.csv"
              ref={inputRef}
              className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 h-full w-full opacity-0"
            />
            <span className="mt-1 text-sm font-semibold text-slate-700">
              Drag your image to start uploading
            </span>
            <div className="my-3 flex items-center gap-2">
              <div className="h-px w-20 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px w-20 bg-slate-200" />
            </div>
            <div className="peer">
              <button
                className="h-9 hover:cursor-pointer bg-blue-400 rounded-md px-3"
                onClick={() => {
                  if (inputRef.current) inputRef.current.value = "";
                  inputRef.current?.click();
                }}
              >
                <span className="text-sm text-white font-semibold">
                  Browse image
                </span>
              </button>
            </div>
          </div>
        </section>
      </article>
    </Modal>
  );
}

function Modal({
  showModal,
  children,
}: {
  showModal: boolean;
  children: ReactNode;
}) {
  if (!showModal) return <></>;
  return (
    <article className="absolute inset-0 w-screen h-screen bg-black/50 flex items-center justify-center">
      {children}
    </article>
  );
}

export default App;
