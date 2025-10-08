# Merge Strategy Helpers

This repo ships with `.gitattributes` rules and a sample Git merge driver configuration to keep noisy files from causing unnecessary conflicts.

## Using the merge drivers

If you want Git to apply the same drivers locally, copy `.gitconfig.merge-drivers.sample` into either your global git config or the repo config:

```sh
# Global (applies to all repos)
git config --global include.path "$(pwd)/.gitconfig.merge-drivers.sample"

# Repo-only (within ProjectsFromTheProjects)
cat .gitconfig.merge-drivers.sample >> .git/config
```

These drivers ensure lockfiles, generated reports, and documentation resolve more smoothly when merging.
