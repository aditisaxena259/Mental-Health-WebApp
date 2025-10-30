# 🔔 Complete Backend Notification System for Go

## Overview

This guide provides a complete implementation of the notification functionality in Go that integrates seamlessly with the React/Next.js frontend.

---

## 📋 Frontend Requirements Analysis

Based on `notification-bell.tsx`, the frontend expects:

### API Endpoints Needed

```
GET    /api/notifications              # List notifications
PATCH  /api/notifications/:id/read     # Mark single as read
PATCH  /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/:id          # Delete notification
```

### Response Structure

```typescript
// GET /api/notifications
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "type": "info" | "success" | "warning" | "error",
      "isRead": boolean,
      "createdAt": "2025-01-15T10:30:00Z",
      "relatedId": "string" (optional - complaint/apology ID),
      "relatedType": "complaint" | "apology" (optional)
    }
  ],
  "unreadCount": number
}
```

---

## 🏗️ Go Backend Implementation

### 1. Database Schema (MySQL/PostgreSQL)

```sql
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_role ENUM('student', 'admin') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_id VARCHAR(36) NULL,  -- ID of complaint/apology
    related_type ENUM('complaint', 'apology') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_user_role (user_role),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 2. Go Structs

**File: `models/notification.go`**

```go
package models

import "time"

type NotificationType string
type NotificationRelatedType string

const (
    NotificationTypeInfo    NotificationType = "info"
    NotificationTypeSuccess NotificationType = "success"
    NotificationTypeWarning NotificationType = "warning"
    NotificationTypeError   NotificationType = "error"
)

const (
    RelatedTypeComplaint NotificationRelatedType = "complaint"
    RelatedTypeApology   NotificationRelatedType = "apology"
)

type Notification struct {
    ID          string                   `json:"id" db:"id"`
    UserID      string                   `json:"userId" db:"user_id"`
    UserRole    string                   `json:"userRole" db:"user_role"`
    Title       string                   `json:"title" db:"title"`
    Message     string                   `json:"message" db:"message"`
    Type        NotificationType         `json:"type" db:"type"`
    IsRead      bool                     `json:"isRead" db:"is_read"`
    RelatedID   *string                  `json:"relatedId,omitempty" db:"related_id"`
    RelatedType *NotificationRelatedType `json:"relatedType,omitempty" db:"related_type"`
    CreatedAt   time.Time                `json:"createdAt" db:"created_at"`
    UpdatedAt   time.Time                `json:"updatedAt" db:"updated_at"`
}

type NotificationResponse struct {
    Data        []Notification `json:"data"`
    UnreadCount int            `json:"unreadCount"`
}

type CreateNotificationRequest struct {
    UserID      string                   `json:"userId" validate:"required"`
    UserRole    string                   `json:"userRole" validate:"required,oneof=student admin"`
    Title       string                   `json:"title" validate:"required,max=255"`
    Message     string                   `json:"message" validate:"required"`
    Type        NotificationType         `json:"type" validate:"omitempty,oneof=info success warning error"`
    RelatedID   *string                  `json:"relatedId,omitempty"`
    RelatedType *NotificationRelatedType `json:"relatedType,omitempty"`
}
```

---

### 3. Repository Layer

**File: `repositories/notification_repository.go`**

```go
package repositories

import (
    "context"
    "database/sql"
    "fmt"
    "time"

    "github.com/google/uuid"
    "yourapp/models"
)

type NotificationRepository interface {
    Create(ctx context.Context, notification *models.CreateNotificationRequest) (*models.Notification, error)
    GetByUserID(ctx context.Context, userID string, role string, limit int) ([]models.Notification, error)
    GetUnreadCount(ctx context.Context, userID string, role string) (int, error)
    MarkAsRead(ctx context.Context, notificationID string, userID string) error
    MarkAllAsRead(ctx context.Context, userID string, role string) error
    Delete(ctx context.Context, notificationID string, userID string) error
    DeleteByRelated(ctx context.Context, relatedID string, relatedType models.NotificationRelatedType) error
}

type notificationRepository struct {
    db *sql.DB
}

func NewNotificationRepository(db *sql.DB) NotificationRepository {
    return &notificationRepository{db: db}
}

func (r *notificationRepository) Create(ctx context.Context, req *models.CreateNotificationRequest) (*models.Notification, error) {
    notif := &models.Notification{
        ID:          uuid.New().String(),
        UserID:      req.UserID,
        UserRole:    req.UserRole,
        Title:       req.Title,
        Message:     req.Message,
        Type:        req.Type,
        IsRead:      false,
        RelatedID:   req.RelatedID,
        RelatedType: req.RelatedType,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }

    if notif.Type == "" {
        notif.Type = models.NotificationTypeInfo
    }

    query := `
        INSERT INTO notifications (id, user_id, user_role, title, message, type, is_read, related_id, related_type, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    _, err := r.db.ExecContext(ctx, query,
        notif.ID, notif.UserID, notif.UserRole, notif.Title, notif.Message,
        notif.Type, notif.IsRead, notif.RelatedID, notif.RelatedType,
        notif.CreatedAt, notif.UpdatedAt,
    )

    if err != nil {
        return nil, fmt.Errorf("failed to create notification: %w", err)
    }

    return notif, nil
}

func (r *notificationRepository) GetByUserID(ctx context.Context, userID string, role string, limit int) ([]models.Notification, error) {
    if limit <= 0 {
        limit = 50 // Default limit
    }

    query := `
        SELECT id, user_id, user_role, title, message, type, is_read, related_id, related_type, created_at, updated_at
        FROM notifications
        WHERE user_id = ? AND user_role = ?
        ORDER BY created_at DESC
        LIMIT ?
    `

    rows, err := r.db.QueryContext(ctx, query, userID, role, limit)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch notifications: %w", err)
    }
    defer rows.Close()

    var notifications []models.Notification
    for rows.Next() {
        var n models.Notification
        err := rows.Scan(
            &n.ID, &n.UserID, &n.UserRole, &n.Title, &n.Message,
            &n.Type, &n.IsRead, &n.RelatedID, &n.RelatedType,
            &n.CreatedAt, &n.UpdatedAt,
        )
        if err != nil {
            return nil, fmt.Errorf("failed to scan notification: %w", err)
        }
        notifications = append(notifications, n)
    }

    if err = rows.Err(); err != nil {
        return nil, err
    }

    if notifications == nil {
        notifications = []models.Notification{}
    }

    return notifications, nil
}

func (r *notificationRepository) GetUnreadCount(ctx context.Context, userID string, role string) (int, error) {
    query := `
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = ? AND user_role = ? AND is_read = FALSE
    `

    var count int
    err := r.db.QueryRowContext(ctx, query, userID, role).Scan(&count)
    if err != nil {
        return 0, fmt.Errorf("failed to get unread count: %w", err)
    }

    return count, nil
}

func (r *notificationRepository) MarkAsRead(ctx context.Context, notificationID string, userID string) error {
    query := `
        UPDATE notifications
        SET is_read = TRUE, updated_at = ?
        WHERE id = ? AND user_id = ?
    `

    result, err := r.db.ExecContext(ctx, query, time.Now(), notificationID, userID)
    if err != nil {
        return fmt.Errorf("failed to mark notification as read: %w", err)
    }

    rows, _ := result.RowsAffected()
    if rows == 0 {
        return fmt.Errorf("notification not found or unauthorized")
    }

    return nil
}

func (r *notificationRepository) MarkAllAsRead(ctx context.Context, userID string, role string) error {
    query := `
        UPDATE notifications
        SET is_read = TRUE, updated_at = ?
        WHERE user_id = ? AND user_role = ? AND is_read = FALSE
    `

    _, err := r.db.ExecContext(ctx, query, time.Now(), userID, role)
    if err != nil {
        return fmt.Errorf("failed to mark all as read: %w", err)
    }

    return nil
}

func (r *notificationRepository) Delete(ctx context.Context, notificationID string, userID string) error {
    query := `DELETE FROM notifications WHERE id = ? AND user_id = ?`

    result, err := r.db.ExecContext(ctx, query, notificationID, userID)
    if err != nil {
        return fmt.Errorf("failed to delete notification: %w", err)
    }

    rows, _ := result.RowsAffected()
    if rows == 0 {
        return fmt.Errorf("notification not found or unauthorized")
    }

    return nil
}

func (r *notificationRepository) DeleteByRelated(ctx context.Context, relatedID string, relatedType models.NotificationRelatedType) error {
    query := `DELETE FROM notifications WHERE related_id = ? AND related_type = ?`
    _, err := r.db.ExecContext(ctx, query, relatedID, relatedType)
    return err
}
```

---

### 4. Service Layer

**File: `services/notification_service.go`**

```go
package services

import (
    "context"
    "fmt"

    "yourapp/models"
    "yourapp/repositories"
)

type NotificationService interface {
    CreateNotification(ctx context.Context, req *models.CreateNotificationRequest) error
    GetUserNotifications(ctx context.Context, userID string, role string) (*models.NotificationResponse, error)
    MarkAsRead(ctx context.Context, notificationID string, userID string) error
    MarkAllAsRead(ctx context.Context, userID string, role string) error
    DeleteNotification(ctx context.Context, notificationID string, userID string) error

    // Helper methods for automatic notifications
    NotifyComplaintStatusChange(ctx context.Context, complaintID string, studentID string, newStatus string) error
    NotifyNewComplaint(ctx context.Context, complaintID string, adminIDs []string) error
    NotifyApologyStatusChange(ctx context.Context, apologyID string, studentID string, newStatus string, isAccepted bool) error
}

type notificationService struct {
    repo repositories.NotificationRepository
}

func NewNotificationService(repo repositories.NotificationRepository) NotificationService {
    return &notificationService{repo: repo}
}

func (s *notificationService) CreateNotification(ctx context.Context, req *models.CreateNotificationRequest) error {
    _, err := s.repo.Create(ctx, req)
    return err
}

func (s *notificationService) GetUserNotifications(ctx context.Context, userID string, role string) (*models.NotificationResponse, error) {
    notifications, err := s.repo.GetByUserID(ctx, userID, role, 50)
    if err != nil {
        return nil, err
    }

    unreadCount, err := s.repo.GetUnreadCount(ctx, userID, role)
    if err != nil {
        return nil, err
    }

    return &models.NotificationResponse{
        Data:        notifications,
        UnreadCount: unreadCount,
    }, nil
}

func (s *notificationService) MarkAsRead(ctx context.Context, notificationID string, userID string) error {
    return s.repo.MarkAsRead(ctx, notificationID, userID)
}

func (s *notificationService) MarkAllAsRead(ctx context.Context, userID string, role string) error {
    return s.repo.MarkAllAsRead(ctx, userID, role)
}

func (s *notificationService) DeleteNotification(ctx context.Context, notificationID string, userID string) error {
    return s.repo.Delete(ctx, notificationID, userID)
}

// Auto-notification helpers
func (s *notificationService) NotifyComplaintStatusChange(ctx context.Context, complaintID string, studentID string, newStatus string) error {
    statusMessages := map[string]struct {
        title   string
        message string
        msgType models.NotificationType
    }{
        "inprogress": {
            title:   "Complaint In Progress",
            message: "Your complaint is now being reviewed by the warden.",
            msgType: models.NotificationTypeInfo,
        },
        "resolved": {
            title:   "Complaint Resolved",
            message: "Your complaint has been resolved. Please check for updates.",
            msgType: models.NotificationTypeSuccess,
        },
    }

    info, exists := statusMessages[newStatus]
    if !exists {
        return nil // Don't notify for unknown statuses
    }

    relatedType := models.RelatedTypeComplaint
    _, err := s.repo.Create(ctx, &models.CreateNotificationRequest{
        UserID:      studentID,
        UserRole:    "student",
        Title:       info.title,
        Message:     info.message,
        Type:        info.msgType,
        RelatedID:   &complaintID,
        RelatedType: &relatedType,
    })

    return err
}

func (s *notificationService) NotifyNewComplaint(ctx context.Context, complaintID string, adminIDs []string) error {
    relatedType := models.RelatedTypeComplaint
    for _, adminID := range adminIDs {
        _, err := s.repo.Create(ctx, &models.CreateNotificationRequest{
            UserID:      adminID,
            UserRole:    "admin",
            Title:       "New Complaint Submitted",
            Message:     "A new complaint has been submitted and requires your attention.",
            Type:        models.NotificationTypeInfo,
            RelatedID:   &complaintID,
            RelatedType: &relatedType,
        })
        if err != nil {
            return err
        }
    }
    return nil
}

func (s *notificationService) NotifyApologyStatusChange(ctx context.Context, apologyID string, studentID string, newStatus string, isAccepted bool) error {
    var title, message string
    var msgType models.NotificationType

    switch newStatus {
    case "reviewed":
        title = "Apology Under Review"
        message = "Your apology letter is being reviewed by the warden."
        msgType = models.NotificationTypeInfo
    case "accepted":
        title = "Apology Accepted"
        message = "Your apology has been accepted."
        msgType = models.NotificationTypeSuccess
    case "rejected":
        title = "Apology Rejected"
        message = "Your apology has been rejected. Please contact the warden for details."
        msgType = models.NotificationTypeWarning
    default:
        return nil
    }

    relatedType := models.RelatedTypeApology
    _, err := s.repo.Create(ctx, &models.CreateNotificationRequest{
        UserID:      studentID,
        UserRole:    "student",
        Title:       title,
        Message:     message,
        Type:        msgType,
        RelatedID:   &apologyID,
        RelatedType: &relatedType,
    })

    return err
}
```

---

### 5. HTTP Handlers

**File: `handlers/notification_handler.go`**

```go
package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "yourapp/middleware"
    "yourapp/services"
)

type NotificationHandler struct {
    service services.NotificationService
}

func NewNotificationHandler(service services.NotificationService) *NotificationHandler {
    return &NotificationHandler{service: service}
}

// GET /api/notifications
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
    userID := c.GetString("user_id")
    role := c.GetString("role")

    if userID == "" || role == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    response, err := h.service.GetUserNotifications(c.Request.Context(), userID, role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, response)
}

// PATCH /api/notifications/:id/read
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
    notificationID := c.Param("id")
    userID := c.GetString("user_id")

    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    err := h.service.MarkAsRead(c.Request.Context(), notificationID, userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// PATCH /api/notifications/read-all
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
    userID := c.GetString("user_id")
    role := c.GetString("role")

    if userID == "" || role == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    err := h.service.MarkAllAsRead(c.Request.Context(), userID, role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// DELETE /api/notifications/:id
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
    notificationID := c.Param("id")
    userID := c.GetString("user_id")

    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    err := h.service.DeleteNotification(c.Request.Context(), notificationID, userID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}
```

---

### 6. Routes Setup

**File: `routes/notification_routes.go`**

```go
package routes

import (
    "github.com/gin-gonic/gin"
    "yourapp/handlers"
    "yourapp/middleware"
)

func SetupNotificationRoutes(r *gin.Engine, handler *handlers.NotificationHandler, authMiddleware gin.HandlerFunc) {
    api := r.Group("/api")
    {
        // Protected routes - require authentication
        api.Use(authMiddleware)
        {
            api.GET("/notifications", handler.GetNotifications)
            api.PATCH("/notifications/:id/read", handler.MarkAsRead)
            api.PATCH("/notifications/read-all", handler.MarkAllAsRead)
            api.DELETE("/notifications/:id", handler.DeleteNotification)
        }
    }
}
```

---

### 7. Integration with Complaint/Apology Handlers

**File: `handlers/complaint_handler.go` (modifications)**

```go
// In your complaint_handler.go - UpdateComplaintStatus method
func (h *ComplaintHandler) UpdateStatus(c *gin.Context) {
    complaintID := c.Param("id")
    var req struct {
        Status string `json:"status" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Update complaint status...
    complaint, err := h.complaintService.UpdateStatus(c.Request.Context(), complaintID, req.Status)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // 🔔 Send notification to student
    if req.Status == "inprogress" || req.Status == "resolved" {
        _ = h.notificationService.NotifyComplaintStatusChange(
            c.Request.Context(),
            complaintID,
            complaint.StudentID,
            req.Status,
        )
    }

    c.JSON(http.StatusOK, complaint)
}

// In your complaint_handler.go - CreateComplaint method
func (h *ComplaintHandler) CreateComplaint(c *gin.Context) {
    // ... create complaint logic ...

    // 🔔 Notify all admins
    adminIDs, _ := h.userService.GetAllAdminIDs(c.Request.Context())
    _ = h.notificationService.NotifyNewComplaint(c.Request.Context(), complaint.ID, adminIDs)

    c.JSON(http.StatusCreated, complaint)
}
```

**File: `handlers/apology_handler.go` (modifications)**

```go
// In your apology_handler.go - UpdateApologyStatus method
func (h *ApologyHandler) UpdateStatus(c *gin.Context) {
    apologyID := c.Param("id")
    var req struct {
        Status string `json:"status" binding:"required"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Update apology status...
    apology, err := h.apologyService.UpdateStatus(c.Request.Context(), apologyID, req.Status)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // 🔔 Send notification to student
    isAccepted := req.Status == "accepted"
    _ = h.notificationService.NotifyApologyStatusChange(
        c.Request.Context(),
        apologyID,
        apology.StudentID,
        req.Status,
        isAccepted,
    )

    c.JSON(http.StatusOK, apology)
}
```

---

### 8. Main Setup

**File: `main.go`**

```go
package main

import (
    "log"

    "github.com/gin-gonic/gin"
    "yourapp/config"
    "yourapp/handlers"
    "yourapp/middleware"
    "yourapp/repositories"
    "yourapp/routes"
    "yourapp/services"
)

func main() {
    // Database setup
    db := config.SetupDatabase()
    defer db.Close()

    // Repositories
    notifRepo := repositories.NewNotificationRepository(db)
    complaintRepo := repositories.NewComplaintRepository(db)
    apologyRepo := repositories.NewApologyRepository(db)
    userRepo := repositories.NewUserRepository(db)

    // Services
    notifService := services.NewNotificationService(notifRepo)
    complaintService := services.NewComplaintService(complaintRepo)
    apologyService := services.NewApologyService(apologyRepo)
    userService := services.NewUserService(userRepo)

    // Handlers (inject notification service into complaint/apology handlers)
    notifHandler := handlers.NewNotificationHandler(notifService)
    complaintHandler := handlers.NewComplaintHandler(complaintService, notifService, userService)
    apologyHandler := handlers.NewApologyHandler(apologyService, notifService)

    // Router
    r := gin.Default()

    // Middleware
    r.Use(middleware.CORS())
    authMiddleware := middleware.AuthMiddleware()

    // Routes
    routes.SetupNotificationRoutes(r, notifHandler, authMiddleware)
    routes.SetupComplaintRoutes(r, complaintHandler, authMiddleware)
    routes.SetupApologyRoutes(r, apologyHandler, authMiddleware)

    // Start server
    log.Println("Server starting on :8080")
    if err := r.Run(":8080"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

---

## 🔧 Additional Features (Optional)

### Real-time Notifications with WebSocket

**File: `websocket/hub.go`**

```go
package websocket

import (
    "sync"
)

type Hub struct {
    clients    map[string]*Client // userID -> Client
    broadcast  chan *Message
    register   chan *Client
    unregister chan *Client
    mu         sync.RWMutex
}

type Message struct {
    UserID string
    Data   interface{}
}

type Client struct {
    UserID string
    send   chan interface{}
}

func NewHub() *Hub {
    return &Hub{
        clients:    make(map[string]*Client),
        broadcast:  make(chan *Message, 256),
        register:   make(chan *Client),
        unregister: make(chan *Client),
    }
}

func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.mu.Lock()
            h.clients[client.UserID] = client
            h.mu.Unlock()
        case client := <-h.unregister:
            h.mu.Lock()
            if _, ok := h.clients[client.UserID]; ok {
                delete(h.clients, client.UserID)
                close(client.send)
            }
            h.mu.Unlock()
        case message := <-h.broadcast:
            h.mu.RLock()
            if client, ok := h.clients[message.UserID]; ok {
                select {
                case client.send <- message.Data:
                default:
                    close(client.send)
                    delete(h.clients, message.UserID)
                }
            }
            h.mu.RUnlock()
        }
    }
}

func (h *Hub) BroadcastToUser(userID string, data interface{}) {
    h.broadcast <- &Message{
        UserID: userID,
        Data:   data,
    }
}
```

**File: `websocket/client.go`**

```go
package websocket

import (
    "log"
    "time"

    "github.com/gorilla/websocket"
)

const (
    writeWait      = 10 * time.Second
    pongWait       = 60 * time.Second
    pingPeriod     = (pongWait * 9) / 10
    maxMessageSize = 512
)

func (c *Client) ReadPump(conn *websocket.Conn, hub *Hub) {
    defer func() {
        hub.unregister <- c
        conn.Close()
    }()

    conn.SetReadDeadline(time.Now().Add(pongWait))
    conn.SetPongHandler(func(string) error {
        conn.SetReadDeadline(time.Now().Add(pongWait))
        return nil
    })

    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            break
        }
    }
}

func (c *Client) WritePump(conn *websocket.Conn) {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        conn.Close()
    }()

    for {
        select {
        case message, ok := <-c.send:
            conn.SetWriteDeadline(time.Now().Add(writeWait))
            if !ok {
                conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }

            err := conn.WriteJSON(message)
            if err != nil {
                return
            }

        case <-ticker.C:
            conn.SetWriteDeadline(time.Now().Add(writeWait))
            if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
                return
            }
        }
    }
}
```

**File: `handlers/websocket_handler.go`**

```go
package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
    ws "yourapp/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true // Configure properly in production
    },
}

type WebSocketHandler struct {
    hub *ws.Hub
}

func NewWebSocketHandler(hub *ws.Hub) *WebSocketHandler {
    return &WebSocketHandler{hub: hub}
}

func (h *WebSocketHandler) HandleConnection(c *gin.Context) {
    userID := c.GetString("user_id")
    if userID == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        return
    }

    client := &ws.Client{
        UserID: userID,
        send:   make(chan interface{}, 256),
    }

    h.hub.register <- client

    go client.WritePump(conn)
    go client.ReadPump(conn, h.hub)
}
```

**Integration in Notification Service:**

```go
// Add hub to notification service
type notificationService struct {
    repo repositories.NotificationRepository
    hub  *websocket.Hub // Add this
}

// Modify Create to broadcast via WebSocket
func (s *notificationService) CreateNotification(ctx context.Context, req *models.CreateNotificationRequest) error {
    notif, err := s.repo.Create(ctx, req)
    if err != nil {
        return err
    }

    // Broadcast to WebSocket if available
    if s.hub != nil {
        s.hub.BroadcastToUser(req.UserID, notif)
    }

    return nil
}
```

---

## ✅ Testing Checklist

### Using cURL

```bash
# Set your token
TOKEN="your_jwt_token_here"

# 1. Get notifications
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/notifications

# Expected Response:
# {
#   "data": [...],
#   "unreadCount": 5
# }

# 2. Mark single notification as read
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/notifications/notification-id-here/read

# Expected Response:
# {
#   "message": "Notification marked as read"
# }

# 3. Mark all notifications as read
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/notifications/read-all

# Expected Response:
# {
#   "message": "All notifications marked as read"
# }

# 4. Delete notification
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/notifications/notification-id-here

# Expected Response:
# {
#   "message": "Notification deleted"
# }
```

### Using Postman

1. **GET** `http://localhost:8080/api/notifications`

   - Headers: `Authorization: Bearer {token}`
   - Expected: 200 OK with notification list

2. **PATCH** `http://localhost:8080/api/notifications/{id}/read`

   - Headers: `Authorization: Bearer {token}`
   - Expected: 200 OK

3. **PATCH** `http://localhost:8080/api/notifications/read-all`

   - Headers: `Authorization: Bearer {token}`
   - Expected: 200 OK

4. **DELETE** `http://localhost:8080/api/notifications/{id}`
   - Headers: `Authorization: Bearer {token}`
   - Expected: 200 OK

---

## 🎯 Automatic Notification Triggers

### When to Create Notifications

1. **New Complaint Submitted** (Student → Admin)

   - Trigger: `POST /api/student/complaints`
   - Notify: All admins
   - Type: `info`
   - Message: "A new complaint has been submitted and requires your attention."

2. **Complaint Status Changed to In Progress** (Admin → Student)

   - Trigger: `PATCH /api/complaints/{id}/status` with `status: "inprogress"`
   - Notify: Complaint owner (student)
   - Type: `info`
   - Message: "Your complaint is now being reviewed by the warden."

3. **Complaint Resolved** (Admin → Student)

   - Trigger: `PATCH /api/complaints/{id}/status` with `status: "resolved"`
   - Notify: Complaint owner (student)
   - Type: `success`
   - Message: "Your complaint has been resolved. Please check for updates."

4. **Apology Status Changed** (Admin → Student)
   - Trigger: `PATCH /api/apologies/{id}/status`
   - Notify: Apology owner (student)
   - Type:
     - `info` for "reviewed"
     - `success` for "accepted"
     - `warning` for "rejected"

---

## 📊 Database Indexes Explanation

```sql
INDEX idx_user_id (user_id)         -- Fast lookup by user
INDEX idx_user_role (user_role)     -- Filter by role
INDEX idx_is_read (is_read)         -- Unread count queries
INDEX idx_created_at (created_at)   -- Ordering by date
```

These indexes ensure:

- Fast retrieval of notifications for a specific user
- Efficient unread count calculations
- Quick ordering by creation date
- Optimal performance for role-based queries

---

## 🔒 Security Considerations

1. **Authorization**: Always verify that users can only access their own notifications
2. **Input Validation**: Validate all input data using struct tags
3. **SQL Injection**: Use parameterized queries (already implemented)
4. **Rate Limiting**: Consider adding rate limiting to prevent spam
5. **Soft Delete**: Consider implementing soft delete instead of hard delete

---

## 📈 Performance Optimization Tips

1. **Pagination**: Implement pagination for large notification lists
2. **Caching**: Cache unread count using Redis
3. **Batch Operations**: Support marking multiple notifications as read
4. **Database Connection Pooling**: Configure `db.SetMaxOpenConns()` and `db.SetMaxIdleConns()`
5. **Indexes**: Ensure all indexes are created (see schema)

---

## 🚀 Deployment Checklist

- [ ] Run database migration to create `notifications` table
- [ ] Create necessary indexes
- [ ] Test all API endpoints
- [ ] Configure CORS properly for production
- [ ] Set up proper logging
- [ ] Configure WebSocket (if using real-time)
- [ ] Set up monitoring/alerts
- [ ] Test notification creation on complaint/apology actions
- [ ] Verify authorization works correctly
- [ ] Load test with multiple concurrent users

---

## 📝 Summary

You now have a complete notification system with:

✅ **Database Schema** - Properly indexed and normalized
✅ **Repository Layer** - All CRUD operations with error handling
✅ **Service Layer** - Business logic and automatic notification triggers
✅ **HTTP Handlers** - RESTful API matching frontend expectations
✅ **Route Setup** - Protected routes with authentication
✅ **Integration** - Hooks into complaint/apology workflows
✅ **WebSocket Support** - Optional real-time updates
✅ **Testing Guide** - Examples for all endpoints

This implementation will integrate seamlessly with your React/Next.js frontend!

---

## 🆘 Troubleshooting

### Notifications not appearing?

- Check if user_id and role are correctly set in JWT token
- Verify database connection
- Check if notifications are created in the database
- Ensure frontend is calling the correct endpoint

### WebSocket connection failing?

- Verify CORS settings
- Check if upgrader.CheckOrigin allows your frontend origin
- Ensure WebSocket endpoint is properly registered

### Performance issues?

- Check if indexes are created
- Monitor slow query log
- Consider implementing pagination
- Add Redis caching for unread counts

---

## 📚 Additional Resources

- [Gin Framework Documentation](https://gin-gonic.com/docs/)
- [Gorilla WebSocket](https://github.com/gorilla/websocket)
- [Go Database/SQL Tutorial](https://go.dev/doc/database/overview)
- [JWT in Go](https://github.com/golang-jwt/jwt)

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0  
**Author**: HostelCare Development Team
