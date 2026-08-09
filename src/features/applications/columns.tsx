import { ColumnDef } from "@tanstack/react-table";
import { Application } from "./schema";
import { PhaseBadge, TierBadge } from "@/components/ui/badge";

export const applicationColumns: ColumnDef<Application>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "namespace",
    header: "Namespace",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.namespace}</span>,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.image}</span>,
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => <TierBadge tier={row.original.tier} />,
  },
  {
    accessorKey: "phase",
    header: "Phase",
    cell: ({ row }) => <PhaseBadge phase={row.original.phase} />,
  },
  {
    id: "replicas",
    header: "Ready",
    accessorFn: (a) => a.readyReplicas,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.readyReplicas}/{row.original.desiredReplicas}
      </span>
    ),
  },
];
