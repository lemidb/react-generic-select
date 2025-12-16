# react-generic-select

[![npm version](https://img.shields.io/npm/v/react-generic-select)](https://www.npmjs.com/package/react-generic-select)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

You must have the following components installed:

- button
- input
- command
- popover
- badge
- separator

This library does **not** bundle shadcn components by design.

Shadcn UI intentionally avoids complex, opinionated components.
However, real-world apps often need:

- Generic object-based selects
- Infinite scrolling
- Custom rendering
- Single & multi select in one pattern

This library embraces Shadcn’s philosophy while providing
a reusable, production-ready select abstraction.

#### Configure Path Aliases 
For Next.js
Add to your tsconfig.json or jsconfig.json:
```typescript
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@/*": ["./src/*"]
		}
	}
}
```
For Vite
Add to your vite.config.ts:

```typescript
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
```


## Installation
**Assuming you've already installed the requirements above**

```bash
npm install react-generic-select
```
if not already installed.

```bash 
npx shadcn-ui@latest add button input command popover badge separator
```

## Usage

Example with server-side search and infinite scroll and shadcn form and tanstack query.

```tsx
const {
  courseData,
  fetchNextCourse,
  hasNextCoursePage,
  isFetchingCourse,
  isFetchingNextCourse,
} = useInfiniteCourseQuery(courseTerm)

// Let's we get list of courses as an example.

{/*
[{
"id": "8c6af505-6850-4ae4-baaf-e050ba793546",
"code": "CS 101",
"name": "Introduction to Computer Science",
"createdAt": "2025-11-27T09:30:46.473392",
"createdBy": "System",
"updatedAt": "2025-11-27T09:30:46.473392",
"updatedBy": "System"
}]
*/}

const handleCourseSearchChange = useCallback(
  (newSearchTerm: string) => {
    setCourseTerm(newSearchTerm)
  },
  [courseTerm]
)

<FormField
  control={form.control}
  name="courseId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Course</FormLabel>
      <FormControl>
        <GenericSingleSelect
          options={courseData}
          labelKey="name"
          valueKey="id"
          value={field.value}
          onValueChange={field.onChange}
          onLoadMore={fetchNextCourse}
          hasNextPage={hasNextCoursePage}
          isFetchingNextPage={isFetchingNextCourse}
          onSearchChange={handleCourseSearchChange}
          isLoading={isFetchingCourse && isFetchingNextCourse}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>;
```

Notes:
- `onSearchChange` enables server-side search.
- `onLoadMore`, `hasNextPage`, and `isFetchingNextPage` support infinite scroll.
- `labelKey` and `valueKey` define which properties are displayed and stored.