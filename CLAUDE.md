# Project conventions

## Icon imports

Always import icons using their `Icon`-suffixed name (e.g. `SearchIcon`, not `Search`). This repo uses `lucide-react`, which exports both a bare name and an `Icon`-suffixed alias for every icon (e.g. `Search`/`SearchIcon`, `X`/`XIcon`) — always import the `Icon`-suffixed one.

Why: bare names like `Search`, `Menu`, `X`, or `Info` collide with common variable/component names and other libraries (e.g. Headless UI's `Menu`), and are harder to grep for or recognize at a glance as icons.
