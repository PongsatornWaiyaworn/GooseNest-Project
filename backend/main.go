package main

import (
	"go-auth-mongo/config"
	"go-auth-mongo/controllers"
	"go-auth-mongo/routes"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}

	config.ConnectDB()
	config.InitS3Client()

	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     getAllowedOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.RegisterRoutes(r)

	go controllers.Broadcaster()
	go controllers.GroupCreationBroadcaster()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Println("PORT not set, defaulting to " + port)
	}

	log.Printf("🚀 Server starting on port %s (env: %s)", port, env)

	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}

func getAllowedOrigins() []string {
	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins != "" {
		return strings.Split(origins, ",")
	}
	return []string{"https://goosenest.onrender.com"}
}
