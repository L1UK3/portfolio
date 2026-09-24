# Project Fragments

Parsed a 16.7M voxel medical dataset (256³ 16-bit binary CT volume) by implementing custom byte-swapping and bitwise masking in Java to handle endianness differences and normalize 4,927 density levels.

---

Implemented Maximum Intensity Projection (MIP) and 3D direct volume raycasting completely from scratch without external graphics or compute libraries, projecting 256 depth samples per ray into JavaFX `WritableImage` pixel buffers.

---

Engineered a piecewise transfer function and alpha-blending accumulator to cleanly segment skull bone from soft cranial tissue, driven by an interactive opacity slider.

---

Constructed a synchronized 3×3 multi-view diagnostic interface in JavaFX showing orthogonal slice planes (axial, sagittal, coronal), MIP, and volume renders with zero-lag slider scrub controls.

---

Architected an AlphaZero-style reinforcement learning agent combining Monte Carlo Tree Search (MCTS) with PyTorch neural evaluations to navigate the imperfect-information game tree of competitive Pokémon TCG.

---

Integrated the Python MCTS rollout loop with native C++ game engine binaries (`libcg.so` / `cg.dll`) via shared library bindings for high-throughput headless state simulation.

---

Trained value estimation networks using Generalized Advantage Estimation (GAE) and HL-Gauss continuous distributions to stabilize gradient updates in stochastic card draw environments.

---

Engineered an encoder-decoder transformer network that parses dense multi-component board state observations to predict action policy distributions and scalar position values.

---

Hybridized neural tree search with domain-specific board heuristics to prune illegal and low-value actions, ensuring search budgets stayed strictly within tournament turn time limits.

---

Designed a hierarchical decision system for Kaggle Kaggriculture separating daily macroeconomic planning (neural macro-policy) from turn-by-turn tactical unit coordination (spatial dispatcher).

---

Engineered a centralized spatial dispatcher that scores candidate field jobs via distance-discounted utility functions, coordinating collision-free harvesting, watering, and center-drop logistics across multi-agent worker teams.

---

Constructed an end-to-end simulation runner generating Apache Parquet replay databases, browser-based HTML episode replays, and `.npz` imitation learning datasets.

---

Optimized multi-agent chore weights through parallel Optuna hyperparameter studies, guarded by a 68-test Pytest suite enforcing behavioral episode invariants.

---

Built and scaled a full-stack tournament pairing and league scheduling SaaS serving 70+ weekly active players, 16 tournament organizers, and 200+ weekly page views across South Wales.

---

Engineered a modern web client with React 19, TypeScript, TanStack Router (type-safe file routing), TanStack Query (server state caching), Clerk Auth, and Tailwind CSS v4.

---

Developed an asynchronous FastAPI backend backed by PostgreSQL on Supabase, leveraging Pydantic v2 models and connection pooling for sub-50ms query latencies.

---

Wrote automated asynchronous worker tasks to scrape tournament calendars, major event schedules, and card set releases from community APIs.

---

Built an event-driven Discord companion bot that automatically synchronizes pairings, round alerts, and live standings directly into local game store Discord servers.

---

Created a client-side scientific analysis web application in TypeScript, React, and Vite, replacing legacy proprietary software locked to an aging Windows XP lab machine.

---

Wrote a resilient browser-based FileReader parser capable of ingesting arbitrary whitespace-, tab-, and comma-delimited measurement exports with multi-column fault tolerance.

---

Built a custom SVG visualization canvas featuring linear auto-scaling, multi-dataset overlay comparisons, and an O(log n) binary-search crosshair for real-time spectral wavelength inspection.

---

Deployed statically via GitHub Pages, adopted by Swansea University faculty and students for active dissertation research data processing.
