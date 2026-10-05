---
'@kvirn-ui/react': patch
---

Re-export the types `FileUploadContext`, `FileUploadFailure` and `FileUploadRejection` from `@kvirn-ui/react`. They type the `upload` function's second argument, its failure and the `onFilesReject` list, so you no longer import them from `@kvirn-ui/core`. The upload guide in `file-upload.md` now names `FileUploadContext` (it said `UploadContext`).
