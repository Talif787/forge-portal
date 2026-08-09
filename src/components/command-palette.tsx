"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Boxes, Building2, LayoutDashboard, Moon, Plus, Server, Sun, Workflow } from "lucide-react";
import { useServices } from "@/features/catalog/api";
import { useTenants } from "@/features/tenants/api";
import { useApplications } from "@/features/applications/api";
import { useWorkflows } from "@/features/provisioning/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  // Only fetch the lists while the palette is open.
  const services = useServices();
  const tenants = useTenants();
  const applications = useApplications();
  const workflows = useWorkflows();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  const go = React.useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search services, tenants, or run a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/services/new")}>
            <Plus className="h-4 w-4" />
            New service
          </CommandItem>
          <CommandItem onSelect={() => go("/tenants/new")}>
            <Plus className="h-4 w-4" />
            New tenant
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); setTheme(resolvedTheme === "dark" ? "light" : "dark"); }}>
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Toggle theme
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => go("/")}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/services")}>
            <Boxes className="h-4 w-4" />
            Services
          </CommandItem>
          <CommandItem onSelect={() => go("/tenants")}>
            <Building2 className="h-4 w-4" />
            Tenants
          </CommandItem>
          <CommandItem onSelect={() => go("/applications")}>
            <Server className="h-4 w-4" />
            Applications
          </CommandItem>
          <CommandItem onSelect={() => go("/provisioning")}>
            <Workflow className="h-4 w-4" />
            Provisioning
          </CommandItem>
        </CommandGroup>

        {services.data && services.data.items.length > 0 && (
          <CommandGroup heading="Services">
            {services.data.items.slice(0, 20).map((s) => (
              <CommandItem key={s.id} value={`service ${s.name}`} onSelect={() => go(`/services/${s.id}`)}>
                <Boxes className="h-4 w-4" />
                {s.name}
                <span className="ml-auto text-xs text-muted-foreground">{s.lifecycle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tenants.data && tenants.data.items.length > 0 && (
          <CommandGroup heading="Tenants">
            {tenants.data.items.slice(0, 20).map((t) => (
              <CommandItem key={t.id} value={`tenant ${t.name}`} onSelect={() => go(`/tenants/${t.id}`)}>
                <Building2 className="h-4 w-4" />
                {t.name}
                <span className="ml-auto text-xs text-muted-foreground">{t.plan}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {applications.data && applications.data.items.length > 0 && (
          <CommandGroup heading="Applications">
            {applications.data.items.slice(0, 20).map((a) => (
              <CommandItem
                key={`${a.namespace}/${a.name}`}
                value={`application ${a.name}`}
                onSelect={() => go(`/applications/${a.namespace}/${a.name}`)}
              >
                <Server className="h-4 w-4" />
                {a.name}
                <span className="ml-auto text-xs text-muted-foreground">{a.phase || "pending"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {workflows.data && workflows.data.items.length > 0 && (
          <CommandGroup heading="Provisioning">
            {workflows.data.items.slice(0, 20).map((w) => (
              <CommandItem
                key={w.workflowId}
                value={`provisioning ${w.workflowId}`}
                onSelect={() => go(`/provisioning/${encodeURIComponent(w.workflowId)}`)}
              >
                <Workflow className="h-4 w-4" />
                {w.workflowId}
                <span className="ml-auto text-xs text-muted-foreground">{w.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
