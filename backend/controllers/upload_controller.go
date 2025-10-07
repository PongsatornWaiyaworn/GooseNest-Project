package controllers

import (
	"context"
	"log"
	"net/http"
	"path/filepath"

	"go-auth-mongo/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image is required"})
		return
	}
	defer file.Close()

	filename := uuid.New().String() + filepath.Ext(header.Filename)

	uploader := manager.NewUploader(config.S3Client)

	contentType := "application/octet-stream"
	if ct, ok := header.Header["Content-Type"]; ok && len(ct) > 0 {
		contentType = ct[0]
	}

	result, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(config.GetS3BucketName()),
		Key:         aws.String(filename),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		log.Println("S3 Upload Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": result.Location})
}
