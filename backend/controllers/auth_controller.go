package controllers

import (
	"context"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"go-auth-mongo/config"
	"go-auth-mongo/models"
	"go-auth-mongo/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func Register(c *gin.Context) {
	var user models.User

	if err := c.ShouldBind(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Password, _ = utils.HashPassword(user.Password)

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"username": user.Username},
			{"email": user.Email},
		},
	}

	var existingUser models.User
	err := collection.FindOne(ctx, filter).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "มีผู้ใช้งานที่ใช้ username หรือ email นี้แล้ว"})
		return
	}

	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้งาน"})
		return
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างผู้ใช้ได้"})
		return
	}

	token, err := utils.GenerateToken(user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง token ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "สมัครสมาชิกสำเร็จ",
		"token":   token,
		"user": gin.H{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func CheckDuplicate(c *gin.Context) {
	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	usernameCount, err := collection.CountDocuments(ctx, bson.M{"username": input.Username})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดขณะตรวจสอบ username"})
		return
	}
	if usernameCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Username นี้ถูกใช้แล้ว"})
		return
	}

	emailCount, err := collection.CountDocuments(ctx, bson.M{"email": input.Email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดขณะตรวจสอบ email"})
		return
	}
	if emailCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email นี้ถูกใช้แล้ว"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "สามารถใช้ username และ email นี้ได้"})
}

func Login(c *gin.Context) {
	var credentials struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"email": credentials.Identifier},
			{"username": credentials.Identifier},
		},
	}

	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil || !utils.CheckPasswordHash(credentials.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, _ := utils.GenerateToken(user.Email)
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func GoogleAuth(c *gin.Context) {
	var req struct {
		Credential string `json:"credential"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	payload, err := utils.VerifyGoogleToken(req.Credential)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token"})
		return
	}

	emailRaw, ok := payload["email"]
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found in token"})
		return
	}
	email, ok := emailRaw.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email format in token"})
		return
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err = collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err == nil {

		token, err := utils.GenerateToken(user.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"token":   token,
			"user": gin.H{
				"username": user.Username,
				"email":    user.Email,
			},
		})
		return
	}

	username := generateUsernameFromEmail(email)
	password := generateRandomPassword(12)

	token, err := utils.GenerateToken(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "New user - please complete profile",
		"token":   token,
		"user": gin.H{
			"username": username,
			"email":    email,
			"password": password,
		},
		"needCompleteProfile": true,
	})
}

func generateUsernameFromEmail(email string) string {
	parts := strings.Split(email, "@")
	return parts[0]
}

func generateRandomPassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	password := make([]byte, length)
	for i := range password {
		password[i] = charset[rand.Intn(len(charset))]
	}
	return string(password)
}

func ChangePassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email"`
		NewPassword string `json:"newPassword"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้งานนี้"})
		return
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเข้ารหัสรหัสผ่านใหม่ได้"})
		return
	}

	update := bson.M{"$set": bson.M{"password": hashedPassword}}
	_, err = collection.UpdateOne(ctx, bson.M{"email": req.Email}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเปลี่ยนรหัสผ่านได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "เปลี่ยนรหัสผ่านสำเร็จ"})
}
