package controllers

import (
	"context"
	"fmt"
	"go-auth-mongo/config"
	"go-auth-mongo/models"
	"go-auth-mongo/utils"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func SendOTPHandler(c *gin.Context) {
	var req struct {
		Identifier string `json:"email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.Identifier == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	email := req.Identifier
	if !strings.Contains(email, "@") {
		userCollection := config.GetCollection("users")
		var user models.User
		filter := bson.M{"username": req.Identifier}
		err := userCollection.FindOne(context.Background(), filter).Decode(&user)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		email = user.Email
	}

	rand.Seed(time.Now().UnixNano())
	base := time.Now().UnixNano() % 1000000
	randomHundred := rand.Intn(900) + 100
	code_ := (base + int64(randomHundred)) % 1000000
	code := fmt.Sprintf("%06d", code_)
	expiration := time.Now().Add(5 * time.Minute)
	otpCollection := config.GetCollection("otps")

	_, err := otpCollection.DeleteMany(context.Background(), bson.M{"email": email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete old OTP"})
		return
	}

	otp := models.OTP{
		ID:        primitive.NewObjectID(),
		Email:     email,
		Code:      code,
		ExpiresAt: expiration.Format(time.RFC3339),
	}

	_, err = otpCollection.InsertOne(context.Background(), otp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store OTP"})
		return
	}

	err = utils.SendEmail(email, otp.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP sent successfully",
		"email":   email,
	})
}

func VerifyOTPHandler(c *gin.Context) {
	var req struct {
		Identifier string `json:"email"`
		Code       string `json:"code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.Identifier == "" || req.Code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	email := req.Identifier

	if !strings.Contains(email, "@") {
		userCollection := config.GetCollection("users")
		var user models.User

		err := userCollection.FindOne(context.Background(), bson.M{
			"$or": []bson.M{
				{"username": req.Identifier},
				{"email": req.Identifier},
			},
		}).Decode(&user)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		email = user.Email
	}

	otpCollection := config.GetCollection("otps")

	var stored models.OTP
	err := otpCollection.FindOne(context.Background(), bson.M{"email": email, "code": req.Code}).Decode(&stored)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "OTP not found or invalid"})
		return
	}

	exp, err := time.Parse(time.RFC3339, stored.ExpiresAt)
	if err != nil || time.Now().After(exp) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "OTP expired"})
		return
	}

	otpCollection.DeleteOne(context.Background(), bson.M{"_id": stored.ID})

	c.JSON(http.StatusOK, gin.H{"message": "OTP verified successfully"})
}
