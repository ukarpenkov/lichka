Read the requirements file at the specified path.
Write to prompted.md with a list of implementation steps. These should be ready prompts — each step is a separate request to LLM that does one specific thing.
Break down into small steps. 10 simple tasks are better than 3 complex ones.
Next to each step, add a status: empty if not done, "Done" if completed.
Each time before starting a new step — verify that the previous one has status "Done". If not — report it and do not start work.
This is a fullstack project — write code for both frontend and backend.
Write tests for each step, run them after implementation.
Insert general rules into each step so they are always visible.
After completing each step, write a report to `docs/reports/`. File name: `<YYYY-MM-DD>-<task-id>-step-<N>.md`. Contents: what was done, which files were changed, test results, issues (if any).
Requirements path -
prompted.md path -
