package utils

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"google.golang.org/api/idtoken"
)

func VerifyGoogleToken(idToken string) (map[string]interface{}, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	audience := os.Getenv("GOOGLE_CLIENT_ID")

	payload, err := idtoken.Validate(context.Background(), idToken, audience)
	if err != nil {
		return nil, err
	}

	return payload.Claims, nil
}
