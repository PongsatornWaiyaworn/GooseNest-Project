package controllers

import (
	"context"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"go-auth-mongo/config"
	"go-auth-mongo/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetProfile(c *gin.Context) {
	emailRaw, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found in context"})
		return
	}
	email := emailRaw.(string)

	var user models.User
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, user)
}

func GetProfileByEmail(c *gin.Context) {
	email := c.Param("email")
	var user models.User
	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	emailRaw, _ := c.Get("email")
	email := emailRaw.(string)

	var input models.User
	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.GetCollection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existingUser models.User
	if err := collection.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	if input.Image != "" && existingUser.Image != "" {
		oldImageKey := filepath.Base(existingUser.Image)

		_, err := config.S3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
			Bucket: aws.String(config.GetS3BucketName()),
			Key:    aws.String(oldImageKey),
		})
		if err != nil {
			log.Println("Failed to delete old image from S3:", err)
		}
	}

	update := bson.M{
		"$set": bson.M{
			"firstName": input.FirstName,
			"lastName":  input.LastName,
			"namestore": input.NameStore,
			"phone":     input.Phone,
			"address":   input.Address,
			"facebook":  input.Facebook,
			"instagram": input.Instagram,
			"line":      input.Line,
			"discord":   input.Discord,
			"bio":       input.Bio,
			"games":     input.Games,
			"image":     input.Image,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"email": email}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated"})
}
