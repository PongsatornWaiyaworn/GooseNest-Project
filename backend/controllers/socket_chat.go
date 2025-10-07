package controllers

import (
	"context"
	"fmt"
	"go-auth-mongo/config"
	"go-auth-mongo/models"
	"go-auth-mongo/utils"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Client struct {
	Conn    *websocket.Conn
	Email   string
	GroupID primitive.ObjectID
}

type BroadcastMessage struct {
	Message    models.Message
	SenderConn *websocket.Conn
}

type NewGroupNotification struct {
	Group      models.Group
	ReceiverEM string
}

var broadcastNewGroup = make(chan NewGroupNotification)
var clients = make(map[*websocket.Conn]Client)
var clientsMutex_chat = sync.RWMutex{}
var broadcast = make(chan BroadcastMessage)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func encodeEmailKey_(email string) string {
	return strings.ReplaceAll(
		strings.ReplaceAll(email, ".", "_dot_"),
		"$", "_dollar_",
	)
}

func WebSocketHandlerChat(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	email := c.Query("email")
	groupIDStr := c.Query("group_id")
	encodedEmail := encodeEmailKey_(email)

	groupID, err := primitive.ObjectIDFromHex(groupIDStr)
	if err != nil {
		fmt.Println("Invalid GroupID:", err)
		conn.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid GroupID"})
		return
	}

	client := Client{
		Conn:    conn,
		Email:   email,
		GroupID: groupID,
	}

	clientsMutex_chat.Lock()
	clients[conn] = client
	fmt.Println("Client connected:", email, "in group", groupID.Hex())
	clientsMutex_chat.Unlock()

	done := make(chan struct{})
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				groupsCollection := config.GetCollection("groups")
				filter := bson.M{"_id": groupID}
				update := bson.M{
					"$set": bson.M{
						"read_status." + encodedEmail: time.Now().Format(time.RFC3339),
					},
				}
				_, err := groupsCollection.UpdateOne(context.Background(), filter, update)
				if err != nil {
					fmt.Println("Failed to update read_statuses for", email, ":", err)
				} else {
					fmt.Println("Updated read_statuses for", email)
				}
			case <-done:
				return
			}
		}
	}()

	defer func() {
		clientsMutex_chat.Lock()
		delete(clients, conn)
		clientsMutex_chat.Unlock()
		conn.Close()
		close(done)
		fmt.Println("Client disconnected:", email)
	}()

	for {
		var msg models.Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Error reading json from", email, ":", err)
			break
		}

		msg.GroupID = groupID
		msg.Timestamp = time.Now().Format(time.RFC3339)

		fmt.Println("Received message from", email, ":", msg.Content)

		collection := config.GetCollection("messages")
		_, err = collection.InsertOne(context.Background(), msg)
		if err != nil {
			fmt.Println("Error saving message to DB:", err)
			continue
		}
		fmt.Println("Message saved to DB:", msg.Content)

		groupsCollection := config.GetCollection("groups")

		var groupData struct {
			Members       []string `bson:"members"`
			LastMessageAt string   `bson:"last_message_at"`
		}

		err = groupsCollection.FindOne(context.Background(), bson.M{"_id": groupID}).Decode(&groupData)
		if err != nil {
			fmt.Println("Failed to fetch group data:", err)
		} else {
			// ตรวจสอบเวลาห่างจาก last_message_at
			lastTime, err := time.Parse(time.RFC3339, groupData.LastMessageAt)
			if err == nil {
				if time.Since(lastTime) > 30*time.Minute {
					fmt.Println("Sending email notifications to group members (inactive > 30m)")
					for _, member := range groupData.Members {
						if member != msg.SenderEmail {
							go func(m string) {
								err := utils.SendNewMessageNotificationEmail(m)
								if err != nil {
									fmt.Println("Failed to send email to", m, ":", err)
								} else {
									fmt.Println("Sent email to", m)
								}
							}(member)
						}
					}
				}
			}
		}

		// อัปเดต last_message_at
		_, err = groupsCollection.UpdateOne(
			context.Background(),
			bson.M{"_id": groupID},
			bson.M{"$set": bson.M{"last_message_at": msg.Timestamp}},
		)
		if err != nil {
			fmt.Println("Failed to update last_message_at:", err)
		} else {
			fmt.Println("Updated last_message_at")
		}

		// อัปเดต read_status สำหรับ sender
		encodedSender := encodeEmailKey_(msg.SenderEmail)
		_, err = groupsCollection.UpdateOne(
			context.Background(),
			bson.M{"_id": groupID},
			bson.M{"$set": bson.M{"read_status." + encodedSender: msg.Timestamp}},
		)
		if err != nil {
			fmt.Println("Failed to update read_status for sender:", err)
		}

		broadcast <- BroadcastMessage{
			Message:    msg,
			SenderConn: conn,
		}
		fmt.Println("Message sent to broadcast channel")
	}
}

func WebSocketHandlerListenAllGroups(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	email := c.Query("email")
	if email == "" {
		conn.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	client := Client{
		Conn:  conn,
		Email: email,
	}

	clientsMutex_chat.Lock()
	clients[conn] = client
	fmt.Println("Client connected to group-listener:", email)
	clientsMutex_chat.Unlock()

	defer func() {
		clientsMutex_chat.Lock()
		delete(clients, conn)
		clientsMutex_chat.Unlock()
		conn.Close()
		fmt.Println("Client disconnected:", email)
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Client disconnected (read error):", email, err)
			break
		}
	}
}

func WebSocketHandlerWatchNewGroups(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	email := c.Query("email")
	if email == "" {
		conn.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	client := Client{
		Conn:  conn,
		Email: email,
	}

	clientsMutex_chat.Lock()
	clients[conn] = client
	fmt.Println("Client connected to group-creation-listener:", email)
	clientsMutex_chat.Unlock()

	defer func() {
		clientsMutex_chat.Lock()
		delete(clients, conn)
		clientsMutex_chat.Unlock()
		conn.Close()
		fmt.Println("Client disconnected from group-creation-listener:", email)
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Group creation listener disconnected:", email, err)
			break
		}
	}
}

func Broadcaster() {
	for {
		b := <-broadcast
		msg := b.Message
		sender := b.SenderConn

		fmt.Println("Broadcasting message:", msg.Content)

		clientsMutex_chat.RLock()
		for conn, client := range clients {
			if conn == sender {
				continue
			}

			if client.GroupID != primitive.NilObjectID {
				if client.GroupID == msg.GroupID {
					err := conn.WriteJSON(msg)
					if err != nil {
						fmt.Println("Error sending to", client.Email, ":", err)
						conn.Close()
						clientsMutex_chat.RUnlock()
						clientsMutex_chat.Lock()
						delete(clients, conn)
						clientsMutex_chat.Unlock()
						break
					}
					fmt.Println("Message sent to", client.Email)
				}
			} else {
				notification := map[string]interface{}{
					"type":      "new_message_notification",
					"group_id":  msg.GroupID.Hex(),
					"timestamp": msg.Timestamp,
				}
				err := conn.WriteJSON(notification)
				if err != nil {
					fmt.Println("Error sending notification to", client.Email, ":", err)
					conn.Close()
					clientsMutex_chat.RUnlock()
					clientsMutex_chat.Lock()
					delete(clients, conn)
					clientsMutex_chat.Unlock()
					break
				}
				fmt.Println("Notification sent to", client.Email)
			}
		}
		clientsMutex_chat.RUnlock()
	}
}

func GroupCreationBroadcaster() {
	for {
		notification := <-broadcastNewGroup

		clientsMutex_chat.RLock()
		for conn, client := range clients {
			if client.Email == notification.ReceiverEM {
				err := conn.WriteJSON(map[string]interface{}{
					"type": "new_group_created",
					"group": map[string]interface{}{
						"id":              notification.Group.ID.Hex(),
						"name":            notification.Group.Name,
						"members":         notification.Group.Members,
						"product_id":      notification.Group.ProductID,
						"cover_image":     notification.Group.CoverImage,
						"created_at":      notification.Group.CreatedAt,
						"last_message_at": notification.Group.LastMessageAt,
						"read_status":     notification.Group.ReadStatus,
					},
				})
				if err != nil {
					fmt.Println("Error sending new group to", client.Email, ":", err)
					conn.Close()
					clientsMutex_chat.RUnlock()
					clientsMutex_chat.Lock()
					delete(clients, conn)
					clientsMutex_chat.Unlock()
					break
				}
				fmt.Println("New group notification sent to", client.Email)
			}
		}
		clientsMutex_chat.RUnlock()
	}
}
