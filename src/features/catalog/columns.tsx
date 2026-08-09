import { ColumnDef } from "@tanstack/react-table";
import { Service } from "./schema";
import { StatusBadge, TierBadge } from "@/components/ui/badge";

export const serviceColumns: ColumnDef<Service>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => <TierBadge tier={row.original.tier} />,
  },
  {
    accessorKey: "lifecycle",
    header: "Lifecycle",
    cell: ({ row }) => <StatusBadge value={row.original.lifecycle} />,
  },
  {
    id: "owningTeam",
    header: "Owning team",
    accessorFn: (s) => s.ownership.owningTeam,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.ownership.owningTeam}</span>,
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.version}</span>,
  },
];
