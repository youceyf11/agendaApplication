# Agenda Calendar Application

A comprehensive web-based Agenda/To-Do Calendar application built with Angular and Spring Boot.

## Project Structure

### Frontend (Angular)

The frontend is implemented using Angular 19 and provides a user-friendly interface for managing agenda items (tasks and events). Key features include:

- Interactive calendar with monthly/weekly/daily views
- CRUD operations for tasks and events
- Priority levels with color-coding (Low=Green, Medium=Orange, High=Red)
- Reminder and notification system
- Filtering and searching capabilities

### Backend (Spring Boot)

The backend is implemented using Java Spring Boot and provides a RESTful API for managing agenda items:

- RESTful API with CRUD endpoints for tasks, events, categories, etc.
- H2 in-memory database (can be replaced with MySQL/PostgreSQL)
- Spring Data JPA for data access
- Six entities: AgendaItem, Task, Event, User, Category, and Notification

## How to Run the Project

### Frontend

1. Navigate to the project directory:
   ```
   cd agenda-calendar
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the Spring Boot application:
   ```
   ./mvnw spring-boot:run
   ```

The backend API will be available at:
```
http://localhost:8080/api
```

## API Endpoints

### Agenda Items

- GET `/api/items` - Get all items
- GET `/api/items/{id}` - Get item by ID
- GET `/api/items/date?date=YYYY-MM-DD` - Get items for a specific date
- GET `/api/items/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get items in a date range
- GET `/api/items/tasks` - Get all tasks
- GET `/api/items/events` - Get all events
- GET `/api/items/priority/{priority}` - Get items by priority
- GET `/api/items/category/{categoryId}` - Get items by category
- POST `/api/items/task` - Create a new task
- POST `/api/items/event` - Create a new event
- PUT `/api/items/{id}` - Update an item
- DELETE `/api/items/{id}` - Delete an item

### Categories

- GET `/api/categories` - Get all categories
- GET `/api/categories/{id}` - Get category by ID
- POST `/api/categories` - Create a new category
- PUT `/api/categories/{id}` - Update a category
- DELETE `/api/categories/{id}` - Delete a category

### Notifications

- GET `/api/notifications` - Get all notifications
- GET `/api/notifications/unread` - Get unread notifications
- GET `/api/notifications/{id}` - Get notification by ID
- POST `/api/notifications/agenda-item/{agendaItemId}` - Create a notification for an agenda item
- PUT `/api/notifications/{id}/read` - Mark a notification as read
- PUT `/api/notifications/read-all` - Mark all notifications as read
- DELETE `/api/notifications/{id}` - Delete a notification

## Technologies Used

- Frontend:
  - Angular 19
  - TypeScript
  - RxJS
  - Bootstrap
  - date-fns for date manipulation

- Backend:
  - Java 11
  - Spring Boot
  - Spring Data JPA
  - H2 Database
  - RESTful API