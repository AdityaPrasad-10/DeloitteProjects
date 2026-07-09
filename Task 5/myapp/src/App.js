import { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
 PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const org = {
  group1: {
    type1: ["A", "B"],
    type2: ["C", "D"],
  },
  group2: {
    type3: ["E", "F"],
  },
};

const COLORS = ["#0088FE", "#FF8042"];
const rec = [
  { name: "A", group: "group1", type: "type1", status: "active" },
  { name: "B", group: "group1", type: "type1", status: "inactive" },
  { name: "C", group: "group1", type: "type2", status: "active" },
  { name: "D", group: "group1", type: "type2", status: "active" },
  { name: "E", group: "group2", type: "type3", status: "active" },
  { name: "F", group: "group2", type: "type3", status: "inactive" },
];

export default function App() {
  const [columnFilters, setColumnFilters] = useState([]);

  const selectedGroup =
    columnFilters.find((f) => f.id === "group")?.value || "";

  const selectedType =
    columnFilters.find((f) => f.id === "type")?.value || "";

  const typeOptions = selectedGroup
    ? Object.keys(org[selectedGroup] || {})
    : [];

  const nameOptions =
    selectedGroup && selectedType
      ? org[selectedGroup]?.[selectedType] || []
      : [];

  const columns = useMemo(
    () => [
      {
        accessorKey: "group",
        header: "Group",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: Object.keys(org),
          clearable: true,
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: typeOptions,
          clearable: true,
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: nameOptions,
          clearable: true,
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["active", "inactive"],
          clearable: true,
        },
      },
    ],
    [typeOptions, nameOptions]
  );

  const table = useMantineReactTable({
    columns,
    data: rec,

    enableColumnFilters: true,

    state: {
      columnFilters,
    },

    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function"
          ? updater(columnFilters)
          : updater;

      const groupChanged =
        newFilters.find((f) => f.id === "group")?.value !==
        columnFilters.find((f) => f.id === "group")?.value;

      const typeChanged =
        newFilters.find((f) => f.id === "type")?.value !==
        columnFilters.find((f) => f.id === "type")?.value;

      let cleanedFilters = [...newFilters];

      if (groupChanged) {
        cleanedFilters = cleanedFilters.filter(
          (f) => f.id !== "type" && f.id !== "name"
        );
      } else if (typeChanged) {
        cleanedFilters = cleanedFilters.filter(
          (f) => f.id !== "name"
        );
      }

      setColumnFilters(cleanedFilters);
    },
  });

  const filteredrows=table.getFilteredRowModel().rows;

  const statuschartdata=useMemo(()=>{
    const counts={};
    filteredrows.forEach((row)=>{
      const status=row.original.status;
      counts[status]=(counts[status]||0)+1;
    });
    return Object.entries(counts).map(([status,count])=>({
      status,count,
    }));
  },[filteredrows]);

  return( 
    <>
   

<ResponsiveContainer width="50%" height={200}>
      <BarChart data={statuschartdata}>
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>
    </ResponsiveContainer>
    <PieChart width={400} height={300}>
  <Pie
    data={statuschartdata}
    dataKey="count"
    nameKey="status"
    outerRadius={100}
    label
    >
    {statuschartdata.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={COLORS[index % COLORS.length]}
      />
    ))}
  </Pie>

  <Tooltip />
  <Legend />
</PieChart>


    <MantineReactTable table={table} />
    </>
  );
}