# react-generic-select

All-in-one, type-safe select components built on top of **shadcn/ui**.

Shadcn provides great primitives, but it doesn’t offer a single select component
that handles **generic object types, search, async loading, and infinite scroll**
out of the box. This library aims to fill that gap.

## Features
- Works with any object type (fully generic)
- Searchable & filterable
- Async loading & infinite scroll
- Built using shadcn/ui primitives
- Highly customizable and extensible

## Requirements

This component is designed to work with **shadcn/ui**.

Your project must include:
- shadcn/ui
- `@/lib/utils` with `cn`
- Required shadcn components (button, command, popover, etc.)

This library does **not** bundle shadcn components by design.


## Installation
```bash
npm install react-generic-select
