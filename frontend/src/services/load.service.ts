import * as XLSX from "xlsx";

export const createUserColumnExcelMapper = {
    "Họ và tên": "full_name",
    "Email": "email",
    "Chức vụ": "position",
    "Link ảnh": "avatar_image_raw_url",
};

/**
 * Reads an Excel file and maps it to any typed object based on a column mapping.
 *
 * @param file The uploaded Excel file
 * @param columnMap An object mapping Excel column names to target object keys
 * @returns Promise<T[]>
 */
export const readAndMapExcel = async <T>(
    file: File,
    columnMap: Record<string, keyof T>
): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                const mappedData: T[] = jsonData.map((row) => {
                    const mappedRow: Partial<T> = {};

                    Object.entries(columnMap).forEach(([excelKey, targetKey]) => {
                        mappedRow[targetKey] = row[excelKey] ?? "";
                    });

                    return mappedRow as T;
                });

                resolve(mappedData);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};