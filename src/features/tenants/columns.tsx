import { ColumnDef } from "@tanstack/react-table";
import { Tenant } from "./schema";
import { StatusBadge } from "@/components/ui/badge";

export const tenantColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>,
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => <StatusBadge value={row.original.plan} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} />,
  },
  {
    accessorKey: "maxServices",
    header: "Max services",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.maxServices}</span>,
  },
];
