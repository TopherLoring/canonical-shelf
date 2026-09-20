# Topics restoration note

The v4 Topics corpus already contains authored detail that the current v7 projection had stopped exposing. The restoration must render and search the existing fields rather than summarize or replace them.

Required fields and relationships:
- `kind`
- `aliases`
- `tags`
- `answer`
- `sections`
- `refs`
- `related`

The dedicated `public/topics-experience.js` renderer is responsible for exposing those fields. Topic pages remain unscored reference surfaces and must preserve Guide, Scripture/search, and Course handoffs without creating a second curriculum.
