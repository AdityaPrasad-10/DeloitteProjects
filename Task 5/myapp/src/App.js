import { useMemo, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { Paper, Select, Title } from "@mantine/core";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

const rec = [
  {
    name: "A",
    group: "group1",
    type: "type1",
    status: "active",
  },
  {
    name: "B",
    group: "group1",
    type: "type1",
    status: "inactive",
  },
  {
    name: "C",
    group: "group1",
    type: "type2",
    status: "active",
  },
  {
    name: "D",
    group: "group1",
    type: "type2",
    status: "active",
  },
  {
    name: "E",
    group: "group2",
    type: "type3",
    status: "active",
  },
  {
    name: "F",
    group: "group2",
    type: "type3",
    status: "inactive",
  },
];

const STATUS_COLORS = {
  active: "#228be6",
  inactive: "#ff7f50",
};

const PIE_COLORS = ["#228be6", "#ff7f50"];

const pageStyle = {
  padding: "24px",
  backgroundColor: "#f8f9fa",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  marginBottom: "20px",
};

const chartGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "20px",
  width: "100%",
  marginBottom: "24px",
};

const chartCardStyle = {
  height: "350px",
  minWidth: 0,
  boxSizing: "border-box",
};

/**
 * Converts the final filtered MRT rows into chart-ready data.
 *
 * Example:
 * [
 *   { name: "active", count: 4 },
 *   { name: "inactive", count: 2 }
 * ]
 */
function aggregateData(rows, property) {
  const counts = {};

  rows.forEach((row) => {
    const value = row.original[property];

    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
  }));
}

export default function App() {
  /*
   * The only dashboard-level filter.
   * It affects both the table and every chart.
   */
  const [dashboardStatus, setDashboardStatus] = useState(null);

  /*
   * Mantine React Table column filters.
   * These include the cascading Group, Type, and Name filters.
   */
  const [columnFilters, setColumnFilters] = useState([]);

  /*
   * Apply the dashboard Status filter before passing data to MRT.
   */
  const dashboardFilteredData = useMemo(() => {
    return rec.filter((row) => {
      return (
        !dashboardStatus ||
        row.status === dashboardStatus
      );
    });
  }, [dashboardStatus]);

  /*
   * Get the selected Group and Type from the MRT column filters.
   * These are used for the cascading column filter options.
   */
  const selectedColumnGroup =
    columnFilters.find(
      (filter) => filter.id === "group"
    )?.value || "";

  const selectedColumnType =
    columnFilters.find(
      (filter) => filter.id === "type"
    )?.value || "";

  /*
   * Column-level cascading options:
   * Group -> Type -> Name
   */
  const columnTypeOptions = selectedColumnGroup
    ? Object.keys(org[selectedColumnGroup] || {})
    : [];

  const columnNameOptions =
    selectedColumnGroup && selectedColumnType
      ? org[selectedColumnGroup]?.[selectedColumnType] || []
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
          placeholder: "All groups",
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: columnTypeOptions,
          clearable: true,
          disabled: !selectedColumnGroup,
          placeholder: selectedColumnGroup
            ? "All types"
            : "Choose group first",
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: columnNameOptions,
          clearable: true,
          disabled: !selectedColumnType,
          placeholder: selectedColumnType
            ? "All names"
            : "Choose type first",
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        mantineFilterSelectProps: {
          data: ["active", "inactive"],
          clearable: true,
          placeholder: "All statuses",
        },
      },
    ],
    [
      columnTypeOptions,
      columnNameOptions,
      selectedColumnGroup,
      selectedColumnType,
    ]
  );

  const table = useMantineReactTable({
    columns,
    data: dashboardFilteredData,

    enableColumnFilters: true,

    state: {
      columnFilters,
    },

    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function"
          ? updater(columnFilters)
          : updater;

      const previousGroup =
        columnFilters.find(
          (filter) => filter.id === "group"
        )?.value || "";

      const nextGroup =
        newFilters.find(
          (filter) => filter.id === "group"
        )?.value || "";

      const previousType =
        columnFilters.find(
          (filter) => filter.id === "type"
        )?.value || "";

      const nextType =
        newFilters.find(
          (filter) => filter.id === "type"
        )?.value || "";

      const groupChanged = previousGroup !== nextGroup;
      const typeChanged = previousType !== nextType;

      let cleanedFilters = [...newFilters];

      /*
       * Clear dependent filters when Group changes.
       */
      if (groupChanged) {
        cleanedFilters = cleanedFilters.filter(
          (filter) =>
            filter.id !== "type" &&
            filter.id !== "name"
        );
      } else if (typeChanged) {
        /*
         * Clear the Name filter when Type changes.
         */
        cleanedFilters = cleanedFilters.filter(
          (filter) => filter.id !== "name"
        );
      }

      setColumnFilters(cleanedFilters);
    },
  });

  /*
   * These rows include:
   * 1. Dashboard Status filtering
   * 2. MRT column filtering
   */
  const filteredRows = table.getFilteredRowModel().rows;

  /*
   * Chart datasets are created from the final filtered rows.
   */
  const statusChartData = useMemo(
    () => aggregateData(filteredRows, "status"),
    [filteredRows]
  );

  const typeChartData = useMemo(
    () => aggregateData(filteredRows, "type"),
    [filteredRows]
  );

  const groupChartData = useMemo(
    () => aggregateData(filteredRows, "group"),
    [filteredRows]
  );

  return (
    <div style={pageStyle}>
      {/* Dashboard Status Filter */}
      <div style={filterContainerStyle}>
        <Select
          placeholder="Status"
          aria-label="Dashboard Status filter"
          data={["active", "inactive"]}
          value={dashboardStatus}
          onChange={setDashboardStatus}
          size="sm"
          clearable
          w={160}
        />
      </div>

      {/* First Chart Row */}
      <div style={chartGridStyle}>
        {/* Status Bar Chart */}
        <Paper
          withBorder
          shadow="sm"
          radius="md"
          p="md"
          style={chartCardStyle}
        >
          <Title order={5} mb="md">
            Status Distribution
          </Title>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={statusChartData}
              margin={{
                top: 10,
                right: 20,
                bottom: 10,
                left: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />

              <Bar
                dataKey="count"
                name="Records"
                radius={[5, 5, 0, 0]}
              >
                {statusChartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      STATUS_COLORS[entry.name] ||
                      "#228be6"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Status Pie Chart */}
        <Paper
          withBorder
          shadow="sm"
          radius="md"
          p="md"
          style={chartCardStyle}
        >
          <Title order={5} mb="md">
            Status Percentage
          </Title>

          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={95}
                label={({ name, value }) =>
                  `${name}: ${value}`
                }
              >
                {statusChartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      PIE_COLORS[
                        index % PIE_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </div>

      {/* Second Chart Row */}
      <div style={chartGridStyle}>
        {/* Type Line Chart */}
        <Paper
          withBorder
          shadow="sm"
          radius="md"
          p="md"
          style={chartCardStyle}
        >
          <Title order={5} mb="md">
            Records by Type
          </Title>

          <ResponsiveContainer width="100%" height="85%">
            <LineChart
              data={typeChartData}
              margin={{
                top: 10,
                right: 20,
                bottom: 10,
                left: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="count"
                name="Records"
                stroke="#40c057"
                strokeWidth={3}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Group Area Chart */}
        <Paper
          withBorder
          shadow="sm"
          radius="md"
          p="md"
          style={chartCardStyle}
        >
          <Title order={5} mb="md">
            Records by Group
          </Title>

          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={groupChartData}
              margin={{
                top: 10,
                right: 20,
                bottom: 10,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="groupColor"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#fd7e14"
                    stopOpacity={0.8}
                  />

                  <stop
                    offset="95%"
                    stopColor="#fd7e14"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="count"
                name="Records"
                stroke="#fd7e14"
                strokeWidth={3}
                fill="url(#groupColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </div>

      {/* Mantine React Table */}
      <Paper
        withBorder
        shadow="sm"
        radius="md"
        p="md"
      >
        <MantineReactTable table={table} />
      </Paper>
    </div>
  );
}