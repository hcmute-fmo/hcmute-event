import React, { useState } from "react";
import { createUserColumnExcelMapper, readAndMapExcel } from "@/services/load.service";
import type { User } from "@/types/user";

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await readAndMapExcel<User>(file, createUserColumnExcelMapper as Record<string, keyof User>);
            setUsers(result);
        } catch (error) {
            console.error("Failed to read Excel:", error);
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Upload Excel File</h1>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

            {users.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Mapped Users:</h2>
                    <ul className="space-y-2">
                        {users.map((user, index) => (
                            <li key={index} className="border p-3 rounded bg-white shadow">
                                <p><strong>Full Name:</strong> {user.full_name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Position:</strong> {user.position}</p>
                                <p><strong>Avatar:</strong> {user.avatar_image_url}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default App;
