import { ColumnDef } from "@tanstack/react-table";
import { Workflow } from "./schema";
import { WorkflowStatusBadge } from "@/components/ui/badge";

export const workflowColumns: ColumnDef<Workflow>[] = [
  {
    accessorKey: "workflowId",
    header: "Workflow",
    cell: ({ row }) => <span className="font-medium">{row.original.workflowId}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <WorkflowStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "startTime",
    header: "Started",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.startTime ? new Date(row.original.startTime).toLocaleString() : "-"}
      </span>
    ),
  },
  {
    accessorKey: "historyLength",
    header: "Events",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.historyLength}</span>,
  },
];
