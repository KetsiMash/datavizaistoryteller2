interface DataPreviewTableProps {
  data: Record<string, any>[];
  columns: string[];
}

export function DataPreviewTable({ data, columns }: DataPreviewTableProps) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col}>
                  {row[col] !== null && row[col] !== undefined 
                    ? String(row[col]).slice(0, 50) 
                    : <span className="text-muted-foreground/50">null</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
