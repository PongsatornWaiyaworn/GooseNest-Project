package config

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

var S3Client *s3.Client

func InitS3Client() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(GetS3Region()),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	S3Client = s3.NewFromConfig(cfg)
}

func GetS3BucketName() string {
	return os.Getenv("AWS_BUCKET_NAME")
}

func GetS3Region() string {
	region := os.Getenv("AWS_REGION")
	if region == "" {
		region = os.Getenv("AWS_REGION")
	}
	return region
}
