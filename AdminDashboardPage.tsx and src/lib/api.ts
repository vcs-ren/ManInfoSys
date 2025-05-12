The current implementation for displaying activity logs in `AdminDashboardPage.tsx` includes a de-duplication step based on unique log entry IDs:
```typescript
      const uniqueActivityDataById = activityDataResult
        ? Array.from(new Map(activityDataResult.map(log => [log.id, log])).values())
        : [];
```
This ensures that if the `activityDataResult` (fetched from the mock API or a real backend) were to contain entries with identical `id`s, only one instance of each would be kept.

The `logActivity` function in `src/lib/api.ts` generates unique IDs for each log entry using `nextActivityLogId++`.

Given these mechanisms:
1.  Technical duplicates (entries with the exact same `id`) should already be filtered out by the `AdminDashboardPage`.
2.  If "duplicate" refers to multiple distinct log entries (with different `id`s) that describe the same conceptual user event, this would imply that the `logActivity` function is being called multiple times for that single event. A review of the `logActivity` calls in the codebase (e.g., after adding a student, deleting faculty, etc.) shows that it's generally called once per successful operation.

Therefore, based on the current code, technical duplication of log entries with the same ID should not occur in the displayed list. If the user is observing what appears to be duplicate entries, it might be due to:
*   Two or more distinct log entries (with different IDs) being generated for actions that the user perceives as a single event. This would require a review of the specific workflow leading to such perceived duplicates.
*   A misunderstanding of how the "Recent Activity" log updates, especially as it's typically sliced to show only the top N recent entries.

Without a specific scenario demonstrating the duplication, further changes to the de-duplication logic are not warranted as the current ID-based de-duplication is robust.

```