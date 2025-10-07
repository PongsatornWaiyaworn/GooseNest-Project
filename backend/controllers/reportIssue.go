package controllers

import (
	"context"
	"net/http"
	"time"

	"go-auth-mongo/config"
	"go-auth-mongo/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateReportIssue(c *gin.Context) {
	var report models.ReportIssue

	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	report.Email = email.(string)

	report.ID = primitive.NewObjectID()
	report.CreatedAt = time.Now()

	collection := config.DB.Collection("report_issues")

	_, err := collection.InsertOne(context.Background(), report)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report created", "id": report.ID.Hex()})
}

func CreateReportIssuePost(c *gin.Context) {
	var report models.ReportIssuePost

	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	report.Email = email.(string)
	report.ID = primitive.NewObjectID()
	report.CreatedAt = time.Now()

	collection := config.DB.Collection("report_issues_post")
	_, err := collection.InsertOne(context.Background(), report)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report created", "id": report.ID.Hex()})
}

func GetAllReportIssuesForAdmin(c *gin.Context) {

	collection := config.DB.Collection("report_issues")

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reports"})
		return
	}
	defer cursor.Close(context.Background())

	var reports []models.ReportIssue
	if err := cursor.All(context.Background(), &reports); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read reports"})
		return
	}

	c.JSON(http.StatusOK, reports)
}
