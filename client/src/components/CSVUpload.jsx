import { useState } from "react";

const CSVUpload = ({ onData }) => {
  const [fileName, setFileName] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const rows = text.split("\n").slice(1);

      const parsed = rows.map((row) => {
        const [month, revenue, expenses] = row.split(",");

        return {
          month,
          revenue: Number(revenue),
          expenses: Number(expenses),
        };
      });

      onData(parsed);
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Import Financial CSV</h3>

      <input type="file" accept=".csv" onChange={handleFile} />

      {fileName && (
        <p className="text-sm text-gray-500 mt-2">
          Uploaded: {fileName}
        </p>
      )}
    </div>
  );
};

export default CSVUpload;