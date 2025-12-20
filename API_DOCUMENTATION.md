# API Documentation

This document provides a reference for the REST API endpoints in the Reddit Clone application.

## Base URL
All API routes are prefixed with `/api`.

## Authentication

### `GET /api/auth/[...nextauth]`
NextAuth.js handler for authentication sessions.

### `POST /api/auth/[...nextauth]`
NextAuth.js handler for sign-in/sign-out actions.

### `POST /api/auth/signup`
Registers a new user.
- **Body**: `{ "username": "string", "email": "string", "password": "string" }`
- **Response**: `{ "message": "string", "user": { "username": "string", "email": "string" } }`

## Users & Profiles

### `GET /api/u/[username]`
Fetches a user's public profile.
- **Params**: `username`
- **Response**: User object (password excluded).

### `GET /api/settings`
*Note: This endpoint is not explicitly defined as a GET in the provided code, but typically handled by the UI via session or direct page data.*

### `PUT /api/settings`
Updates user profile settings.
- **Auth**: Required
- **Body**: `{ "image": "url", "banner": "url", "about": "string", "username": "string", "password": "string" (optional) }`
- **Response**: Updated User object.

### `DELETE /api/settings`
Deletes the authenticated user's account and all associated data.
- **Auth**: Required
- **Response**: `{ "message": "Account and all associated data deleted successfully" }`

### `GET /api/user/favorites`
Lists the authenticated user's favorite communities.
- **Auth**: Required
- **Response**: Array of Community objects.

### `POST /api/user/favorites`
Toggles a community as a favorite.
- **Auth**: Required
- **Body**: `{ "communityName": "string" }`
- **Response**: `{ "isFavorite": boolean }`

### `DELETE /api/user/favorites`
Removes a community from favorites.
- **Auth**: Required
- **Body**: `{ "communityName": "string", "communityId": "string" }` (provide one)
- **Response**: `{ "success": true }`

### `GET /api/user/custom-feeds`
Lists the authenticated user's custom feeds.
- **Auth**: Required
- **Response**: Array of Custom Feed objects.

### `POST /api/user/custom-feeds`
Creates a custom feed or adds a community to one.
- **Auth**: Required
- **Body**:
  - Create: `{ "action": "create", "feedName": "string" }`
  - Add: `{ "action": "add_community", "feedName": "string", "communityName": "string" }`
- **Response**:
  - Create: `{ "success": true, "feed": object }`
  - Add: `{ "success": true, "added": boolean }`

### `PUT /api/user/custom-feeds`
Updates a custom feed (e.g., remove community).
- **Auth**: Required
- **Body**: `{ "action": "remove_community", "feedName": "string", "communityId": "string" }`
- **Response**: `{ "success": true, "communities": [ids] }`

### `DELETE /api/user/custom-feeds`
Deletes a custom feed.
- **Auth**: Required
- **Body**: `{ "feedName": "string" }`
- **Response**: `{ "success": true }`

### `GET /api/user/feeds/[feedName]/posts`
Fetches posts for a custom feed.
- **Auth**: Required
- **Params**: `feedName`
- **Response**: `{ "posts": [Post], "communities": [Community] }`

## Communities

### `GET /api/communities`
Lists communities.
- **Query Params**: `joined=true` (optional, requires auth) to get user's communities.
- **Response**: Array of Community objects.

### `POST /api/communities`
Creates a new community.
- **Auth**: Required
- **Body**: `{ "name": "string", "description": "string", "icon": "url", "banner": "url" }`
- **Response**: Created Community object.

### `GET /api/communities/[name]`
Fetches details of a specific community.
- **Params**: `name`
- **Response**: Community object.

### `POST /api/communities/[name]/join`
Joins or leaves a community.
- **Auth**: Required
- **Params**: `name`
- **Response**: `{ "message": "string", "isMember": boolean }`

### `GET /api/communities/[name]/posts`
Fetches posts from a specific community.
- **Params**: `name`
- **Response**: Array of Post objects (with `commentCount`).

### `POST /api/communities/[name]/posts`
Creates a post in a specific community.
- **Auth**: Required
- **Params**: `name`
- **Body**: `{ "title": "string", "content": "string", "image": "url", "video": "url", "link": "url" }`
- **Response**: Created Post object.

## Posts

### `GET /api/posts/[postId]`
This route file `app/api/posts/[postId]/route.js` handles PUT and DELETE. GET requests for a single post are currently handled by Next.js Page Server Components or directly via `app/api/posts/[postId]/route.js` if implicit, but the code provided only exports PUT and DELETE.
*Note: Typical patterns might imply a GET handler existed or is needed, but based on scanning, only PUT/DELETE are exported in this specific file.*
*(Correction based on standard Next.js patterns: If GET is not exported, it returns 405 Method Not Allowed. Single post viewing seems to be server-rendered in `app/r/[name]/comments/[postId]/page.js`)*

### `PUT /api/posts/[postId]`
Updates a post's content.
- **Auth**: Required (Author)
- **Params**: `postId`
- **Body**: `{ "content": "string" }`
- **Response**: Updated Post object.

### `DELETE /api/posts/[postId]`
Deletes a post.
- **Auth**: Required (Author)
- **Params**: `postId`
- **Response**: `{ "message": "Post and associated data deleted" }`

### `GET /api/posts/[postId]/comments`
Fetches comments for a post.
- **Params**: `postId`
- **Response**: Array of Comment objects.

### `POST /api/posts/[postId]/comments`
Adds a comment to a post.
- **Auth**: Required
- **Params**: `postId`
- **Body**: `{ "content": "string", "parentComment": "id" (optional) }`
- **Response**: Created Comment object.

### `POST /api/posts/[postId]/vote`
Upvotes or downvotes a post.
- **Auth**: Required
- **Params**: `postId`
- **Body**: `{ "type": "up" | "down" }`
- **Response**: `{ "upvotes": [], "downvotes": [], "score": number }`

### `GET /api/posts/[postId]/save`
Checks if a post is saved by the user.
- **Auth**: Required
- **Params**: `postId`
- **Response**: `{ "saved": boolean }`

### `POST /api/posts/[postId]/save`
Toggles save status of a post.
- **Auth**: Required
- **Params**: `postId`
- **Response**: `{ "saved": boolean, "message": "string" }`

### `GET /api/posts/[postId]/hide`
Checks if a post is hidden by the user.
- **Auth**: Required
- **Params**: `postId`
- **Response**: `{ "hidden": boolean }`

### `POST /api/posts/[postId]/hide`
Toggles hide status of a post.
- **Auth**: Required
- **Params**: `postId`
- **Response**: `{ "hidden": boolean, "message": "string" }`

## Comments

### `PUT /api/comments/[commentId]`
Updates a comment.
- **Auth**: Required (Author)
- **Params**: `commentId`
- **Body**: `{ "content": "string" }`
- **Response**: Updated Comment object.

### `DELETE /api/comments/[commentId]`
Deletes (or soft deletes) a comment.
- **Auth**: Required (Author)
- **Params**: `commentId`
- **Response**: `{ "message": "string" }`

### `POST /api/comments/[commentId]/vote`
Upvotes or downvotes a comment.
- **Auth**: Required
- **Params**: `commentId`
- **Body**: `{ "type": "up" | "down" }`
- **Response**: `{ "upvotes": [], "downvotes": [], "score": number }`

## Notifications

### `GET /api/notifications`
Fetches user notifications.
- **Auth**: Required
- **Response**: `{ "notifications": [Notification], "unreadCount": number }`

### `PATCH /api/notifications`
Marks all notifications as read.
- **Auth**: Required
- **Response**: `{ "success": true }`

## AI & Utilities

### `POST /api/ai/summary`
Generates an AI summary for a post.
- **Body**: `{ "title": "string", "content": "string" }`
- **Response**: `{ "summary": "string" }`

### `POST /api/upload`
Uploads a file to the server.
- **Body**: FormData with `file` field.
- **Response**: `{ "message": "string", "url": "string" }`

### `GET /api/search`
Searches for users and communities.
- **Query Params**: `q` (search query)
- **Response**: `{ "users": [{ "username", "image" }], "communities": [{ "name", "description", "members", "icon" }] }`

### `GET /api/debug`
Returns database connection status and post count.
- **Response**: `{ "status": "Connected", "postCount": number, "uriStatus": "string", "maskedUri": "string" }`
