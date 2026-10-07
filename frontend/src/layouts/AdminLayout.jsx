import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  const tabs = [
    {
      to: "/admin",
      label: "Dashboard",
      end: true,
    },
    {
      to: "/admin/problems",
      label: "Manage Problems",
    },
    {
      to: "/admin/users",
      label: "Users",
    },
    {
      to: "/admin/submissions",
      label: "All Submissions",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-border-subtle/80 bg-bg-surface/90 shadow-card">
        <header className="flex flex-col gap-4 border-b border-border-subtle/80 bg-gradient-to-r from-bg-surface to-bg-surface-hover/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-primary/30 bg-accent-primary/10 font-display text-sm font-bold text-accent-primary">
              {"</>"}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
                Code Arena
              </p>
              <h1 className="mt-0.5 text-lg font-semibold text-text-primary">
                Admin Console
              </h1>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-verdict-accepted/25 bg-verdict-accepted/10 px-3 py-1.5 text-xs font-medium text-verdict-accepted">
            <span className="h-1.5 w-1.5 rounded-full bg-verdict-accepted" />
            Administrator access
          </span>
        </header>

        <div className="border-b border-border-subtle/80 px-4 pt-3 sm:px-8">
          <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto pb-2 text-sm font-medium">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-4 py-2.5 transition-colors ${
                    isActive
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-5 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;