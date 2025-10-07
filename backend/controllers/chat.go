package controllers

import (
	"context"
	"fmt"
	"go-auth-mongo/config"
	"go-auth-mongo/models"
	"go-auth-mongo/utils"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ฟังก์ชันแปลง email ให้ใช้เป็น key ได้ใน MongoDB
func encodeEmailKey(email string) string {
	return strings.ReplaceAll(
		strings.ReplaceAll(email, ".", "_dot_"),
		"$", "_dollar_",
	)
}

// ตรวจสอบสมาชิกในกลุ่มเหมือนกันหรือไม่ (ไม่สนใจลำดับ)
func sameMembers(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	count := make(map[string]int)
	for _, m := range a {
		count[m]++
	}
	for _, m := range b {
		count[m]--
		if count[m] < 0 {
			return false
		}
	}
	return true
}

func GetConfirmedTradeGroupsHandler(c *gin.Context) {
	emailVal, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email in context"})
		return
	}

	groupCollection := config.GetCollection("groups")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"$and": []bson.M{
			{
				"$or": []bson.M{
					{"buyer": email},
					{"seller": email},
				},
			},
			{"buyer_confirmed": true},
			{"seller_confirmed": true},
		},
	}

	cursor, err := groupCollection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving confirmed groups"})
		return
	}
	defer cursor.Close(ctx)

	var groups []models.Group
	if err := cursor.All(ctx, &groups); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding groups"})
		return
	}

	var buyerGroups []models.Group
	var sellerGroups []models.Group

	for _, g := range groups {
		if g.Buyer == email {
			buyerGroups = append(buyerGroups, g)
		} else if g.Seller == email {
			sellerGroups = append(sellerGroups, g)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"buyer_groups":  buyerGroups,
		"seller_groups": sellerGroups,
	})
}

func CreateGroupHandler(c *gin.Context) {
	var group models.Group

	if err := c.ShouldBindJSON(&group); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	emailVal, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email in context"})
		return
	}

	if len(group.Members) == 1 && group.Members[0] == email {
		c.JSON(http.StatusBadRequest, gin.H{"error": "คุณกำลังพยายามแชทกับตัวเอง"})
		return
	}

	found := false
	for _, member := range group.Members {
		if member == email {
			found = true
			break
		}
	}
	if !found {
		group.Members = append(group.Members, email)
	}

	if len(group.Members) == 0 || group.ProductID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุสมาชิกและสินค้า"})
		return
	}

	collection := config.GetCollection("groups")

	cursor, err := collection.Find(context.Background(), bson.M{
		"product_id": group.ProductID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var existing models.Group
		if err := cursor.Decode(&existing); err == nil {
			if sameMembers(existing.Members, group.Members) {
				c.JSON(http.StatusConflict, gin.H{
					"error":    "คุณเคยติดต่อเกี่ยวกับสินค้านี้แล้ว โปรดเข้าดูในแชทชื่อ " + existing.Name,
					"group_id": existing.ID,
				})
				return
			}
		}
	}

	now := time.Now().Format(time.RFC3339)

	group.Buyer = email

	var seller string
	for _, member := range group.Members {
		if member != email {
			seller = member
			break
		}
	}
	if seller == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องมีผู้ขายอย่างน้อย 1 คน"})
		return
	}
	group.Seller = seller
	group.BuyerConfirmed = false
	group.SellerConfirmed = false

	group.CreatedAt = now
	group.LastMessageAt = now

	insertResult, err := collection.InsertOne(context.Background(), group)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving group"})
		return
	}

	groupID := insertResult.InsertedID.(primitive.ObjectID)
	message := models.Message{
		GroupID:     groupID,
		SenderEmail: email,
		Content:     "สวัสดี ฉันสนใจสินค้าของคุณ",
		Timestamp:   now,
	}

	messageCol := config.GetCollection("messages")
	_, err = messageCol.InsertOne(context.Background(), message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert initial message"})
		return
	}

	go func() {
		group.ID = groupID
		for _, member := range group.Members {
			if member != email {
				// ส่งอีเมลแจ้งเตือน
				err := utils.SendInterestNotificationEmail(member)
				if err != nil {
					log.Printf("Failed to send notification email to %s: %v", member, err)
				}

				// ส่ง WebSocket notification
				broadcastNewGroup <- NewGroupNotification{
					Group:      group,
					ReceiverEM: member,
				}
			}
		}
	}()

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Group created successfully",
		"group_id": groupID,
	})
}

// ดึงรายชื่อกลุ่มที่ user เป็นสมาชิกอยู่
func GetUserChatsHandler(c *gin.Context) {
	emailVal, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email"})
		return
	}

	groupCollection := config.GetCollection("groups")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := groupCollection.Find(ctx, bson.M{"members": email})
	if err != nil {
		fmt.Println("Mongo Find error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching chat groups"})
		return
	}
	defer cursor.Close(ctx)

	var groups []models.Group
	if err := cursor.All(ctx, &groups); err != nil {
		fmt.Println("Cursor decode error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding groups"})
		return
	}

	c.JSON(http.StatusOK, groups)
}

// ดึงข้อความทั้งหมดในกลุ่ม
func GetMessagesHandler(c *gin.Context) {
	groupID := c.Param("id")
	if groupID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group ID is required"})
		return
	}

	groupIDObj, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Group ID"})
		return
	}
	groupCollection := config.GetCollection("groups")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var group models.Group
	err = groupCollection.FindOne(ctx, bson.M{"_id": groupIDObj}).Decode(&group)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	messageCollection := config.GetCollection("messages")
	cursor, err := messageCollection.Find(ctx, bson.M{"group_id": groupIDObj})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving messages"})
		return
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err := cursor.All(ctx, &messages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}

func ConfirmTradeHandler(c *gin.Context) {
	groupIDParam := c.Param("id")
	groupID, err := primitive.ObjectIDFromHex(groupIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group ID"})
		return
	}

	emailVal, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailVal.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email in context"})
		return
	}

	// รับค่าที่ส่งมาจาก body เช่น { "confirmed": true }
	var reqBody struct {
		Confirmed bool `json:"confirmed"`
	}
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	collection := config.GetCollection("groups")

	var group models.Group
	err = collection.FindOne(context.Background(), bson.M{"_id": groupID}).Decode(&group)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	update := bson.M{}
	role := ""

	if group.Buyer == email {
		update["buyer_confirmed"] = reqBody.Confirmed
		role = "buyer"
	} else if group.Seller == email {
		update["seller_confirmed"] = reqBody.Confirmed
		role = "seller"
	} else {
		c.JSON(http.StatusForbidden, gin.H{"error": "คุณไม่มีสิทธิ์ยืนยันหรือยกเลิกในกลุ่มนี้"})
		return
	}

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": groupID},
		bson.M{"$set": update},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตสถานะการยืนยันได้"})
		return
	}

	action := "ยืนยัน"
	if !reqBody.Confirmed {
		action = "ยกเลิก"
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      action + "การใช้ระบบซื้อขายกลางสำเร็จ",
		"confirmed_by": role,
		"status":       reqBody.Confirmed,
	})
}

// อัปเดตสถานะอ่านข้อความของ user ในกลุ่ม
func UpdateReadStatusHandler(c *gin.Context) {
	groupIDStr := c.Param("id")

	groupID, err := primitive.ObjectIDFromHex(groupIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group ID"})
		return
	}

	emailVal, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailVal.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	encodedEmail := encodeEmailKey(email)

	filter := bson.M{"_id": groupID}
	update := bson.M{
		"$set": bson.M{
			"read_status." + encodedEmail: time.Now().Format(time.RFC3339),
		},
	}

	collection := config.GetCollection("groups")
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		fmt.Println("Failed to update read_status:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update read status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Read status updated"})
}

// ดึงข้อมูลกลุ่มตาม group_id
func GetGroupByIDHandler(c *gin.Context) {
	groupID := c.Param("id")
	if groupID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Group ID is required"})
		return
	}

	groupIDObj, err := primitive.ObjectIDFromHex(groupID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Group ID"})
		return
	}

	collection := config.GetCollection("groups")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var group models.Group
	err = collection.FindOne(ctx, bson.M{"_id": groupIDObj}).Decode(&group)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	c.JSON(http.StatusOK, group)
}
