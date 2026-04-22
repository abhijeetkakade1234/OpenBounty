import { CreateBountyForm } from "@/components/bounty/create-bounty-form";

export default function CreatePage() {
  return (
    <section className="page-shell py-16 md:py-20">
      <div className="mb-12 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
          Create a bounty
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight text-on-background">
          Post work and fund the reward
        </h1>
        <p className="mt-4 text-lg leading-8 text-on-surface-variant">
          Share the issue you want solved, set the reward, and optionally add a
          deadline if you want a refund path later.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CreateBountyForm />
        <aside className="space-y-6">
          <div className="soft-panel">
            <h2 className="text-xl font-bold tracking-tight text-on-surface">
              Before you publish
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-on-surface-variant">
              <li>
                Use a repository URL that contributors can access publicly.
              </li>
              <li>
                Write a precise issue description so contributors know exactly
                what counts as done.
              </li>
              <li>
                Choose a deadline only if you want refund eligibility later.
              </li>
            </ul>
          </div>
          <div className="editorial-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              What contributors will see
            </p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              They will be able to review the issue, submit a pull request link,
              and wait for your final selection.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
