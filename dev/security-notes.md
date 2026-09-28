# Security & Diagnostics Notes

- All local data transactions are scoped hermetically inside the client's `localStorage`.
- Handled potential XSS breakout paths by validating HTML syntax inputs preceding save commits.
- ZIP outputs are created safely in-memory using JSZip and are fully immune to Zip-Slip directory traversal exploits.
