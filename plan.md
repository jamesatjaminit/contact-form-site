# Plan

## Packages:

- Types
  - Containing global types shared between apps

## Apps:

- Web
  - Main package containing next.js site
- Notification server
  - Independant backend tasked with sending notifications over various channels

## Routes:

### /

Main dashboard, showing main stats

### /form/new

Form creation page

### /form/:id

Individual form page, displaying responses

### /user/:id

User page

## API Routes:

Prefixed with /api/

### POST /form/new

Create new form

### GET /form/:id

Generic form info

### PATCH /form/:id

Update form settings

### GET /form/:id/responses

Form responses, paginated

### POST /form/:id

Post form response

### GET /response/:id

Get individual response

### DELETE /response/:id

Delete response

### GET /users

Get a list of invited/current users

### GET /user/:id

Get user information

### PATCH /user/:id

Update user info

### POST /user/invite

Send an invite to a user to join system

### DELETE /user/:id

Delete user with given ID

### GET /notifications

Get a list of notifications

### GET /notification/:id

Get specific notification

### DELETE /notification/:id

Delete notification with given ID

### PATCH /notification/:id

Update notification with given ID

### POST /notification

Create new notification (admin only)

