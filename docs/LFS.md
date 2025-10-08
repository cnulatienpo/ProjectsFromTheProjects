# Git LFS Guidance

Use Git LFS for large binary assets that must live in the repo.

## Install
- macOS: `brew install git-lfs`
- Windows: Download from https://git-lfs.github.com/
- Linux: Use your package manager

Then:

```
git lfs install
git lfs track "*.png"
git add .gitattributes
```

## When to use
- Images, audio, video, design sources > 5 MB that you MUST version.
- Otherwise, prefer external storage (object storage, CDN) and keep pointers here.

## Notes
- LFS has bandwidth limits on GitHub Free. Keep it modest.

