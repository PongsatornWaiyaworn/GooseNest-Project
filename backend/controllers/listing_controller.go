package controllers

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"go-auth-mongo/config"
	"go-auth-mongo/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SafeUser struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FirstName string             `bson:"firstName" json:"firstName"`
	LastName  string             `bson:"lastName" json:"lastName"`
	NameStore string             `bson:"namestore" json:"namestore"`
	Email     string             `bson:"email" json:"email"`
	Username  string             `bson:"username" json:"username"`
	Phone     string             `bson:"phone" json:"phone"`
	Address   string             `bson:"address" json:"address"`
	Facebook  string             `bson:"facebook" json:"facebook"`
	Instagram string             `bson:"instagram" json:"instagram"`
	Line      string             `bson:"line" json:"line"`
	Discord   string             `bson:"discord" json:"discord"`
	Bio       string             `bson:"bio" json:"bio"`
	Games     []string           `bson:"games" json:"games"`
	Image     string             `bson:"image" json:"image"`
}

type ListingWithUser struct {
	Listing models.Listing `json:"listing"`
	User    SafeUser       `json:"user"`
}

var secretKey []byte

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	key := os.Getenv("SECRET_KEY")

	if key == "" {
		log.Fatal("SECRET_KEY environment variable is not set")
	}

	log.Printf("SECRET_KEY length: %d characters", len(key))

	if len(key) != 32 {
		log.Fatalf("SECRET_KEY must be exactly 32 characters (current: %d)", len(key))
	}

	secretKey = []byte(key)
	log.Println("SECRET_KEY loaded successfully")
}

func Encrypt(text string) (string, error) {
	plaintext := []byte(text)
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}
	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)
	return base64.URLEncoding.EncodeToString(ciphertext), nil
}

func Decrypt(cryptoText string) (string, error) {
	ciphertext, _ := base64.URLEncoding.DecodeString(cryptoText)
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", err
	}
	if len(ciphertext) < aes.BlockSize {
		return "", err
	}
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(ciphertext, ciphertext)
	return string(ciphertext), nil
}

func GetDecryptedListingByID(c *gin.Context) {
	listingID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	collection := config.DB.Collection("listings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var listing models.Listing
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&listing)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	password, _ := Decrypt(listing.Password)
	secondPassword, _ := Decrypt(listing.SecondPassword)

	listing.Password = password
	listing.SecondPassword = secondPassword

	c.JSON(http.StatusOK, listing)
}

func CreateListing(c *gin.Context) {
	var input struct {
		Game           string   `json:"game"`
		Title          string   `json:"title"`
		Price          int      `json:"price"`
		Description    string   `json:"description"`
		Images         []string `json:"images"`
		BankAccount    string   `json:"bankAccount"`
		Status         string   `json:"status"`
		FormType       string   `json:"formType"`
		Username       string   `json:"username"`
		Password       string   `json:"password"`
		SecondPassword string   `json:"secondPassword"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	bankAccountID, err := primitive.ObjectIDFromHex(input.BankAccount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bank account ID"})
		return
	}

	emailValue, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email format"})
		return
	}

	encPassword, _ := Encrypt(input.Password)
	encSecondPassword, _ := Encrypt(input.SecondPassword)

	listing := models.Listing{
		ID:             primitive.NewObjectID(),
		UserEmail:      email,
		Game:           input.Game,
		Title:          input.Title,
		Price:          input.Price,
		Description:    input.Description,
		Images:         input.Images,
		BankAccount:    bankAccountID,
		Status:         input.Status,
		FormType:       input.FormType,
		Username:       input.Username,
		Password:       encPassword,
		SecondPassword: encSecondPassword,
		Favorites:      0,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	collection := config.DB.Collection("listings")
	_, err = collection.InsertOne(context.Background(), listing)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing created", "listing": listing})
}

func GetListingsAll(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	listingsCollection := config.DB.Collection("listings")
	usersCollection := config.DB.Collection("users")

	cursor, err := listingsCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get listings"})
		return
	}
	defer cursor.Close(ctx)

	var listings []models.Listing
	if err := cursor.All(ctx, &listings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse listings"})
		return
	}

	var results []ListingWithUser

	for _, listing := range listings {
		var user models.User
		err := usersCollection.FindOne(ctx, bson.M{"email": listing.UserEmail}).Decode(&user)
		if err != nil {
			continue
		}

		safeUser := SafeUser{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			NameStore: user.NameStore,
			Email:     user.Email,
			Username:  user.Username,
			Phone:     user.Phone,
			Address:   user.Address,
			Facebook:  user.Facebook,
			Instagram: user.Instagram,
			Line:      user.Line,
			Discord:   user.Discord,
			Bio:       user.Bio,
			Games:     user.Games,
			Image:     user.Image,
		}

		results = append(results, ListingWithUser{
			Listing: listing,
			User:    safeUser,
		})
	}

	c.JSON(http.StatusOK, results)
}

func GetListingByID(c *gin.Context) {
	listingID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	collection := config.DB.Collection("listings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var listing models.Listing
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&listing)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	c.JSON(http.StatusOK, listing)
}

func GetListingsUser(c *gin.Context) {
	collection := config.DB.Collection("listings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	emailValue, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email, ok := emailValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid email format"})
		return
	}

	cursor, err := collection.Find(ctx, bson.M{"userEmail": email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get listings"})
		return
	}
	defer cursor.Close(ctx)

	var listings []models.Listing
	if err := cursor.All(ctx, &listings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse listings"})
		return
	}

	c.JSON(http.StatusOK, listings)
}

func UpdateListing(c *gin.Context) {
	listingID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	var input struct {
		Game           string   `json:"game"`
		Title          string   `json:"title"`
		Price          int      `json:"price"`
		Description    string   `json:"description"`
		Images         []string `json:"images"`
		BankAccount    string   `json:"bankAccount"`
		Status         string   `json:"status"`
		FormType       string   `json:"formType"`
		Username       string   `json:"username"`
		Password       string   `json:"password"`
		SecondPassword string   `json:"secondPassword"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	bankAccountID, err := primitive.ObjectIDFromHex(input.BankAccount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bank account ID"})
		return
	}

	collection := config.DB.Collection("listings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingListing struct {
		Images []string `bson:"images"`
	}
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&existingListing)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	if len(input.Images) > 0 && len(existingListing.Images) > 0 {
		for _, oldURL := range existingListing.Images {
			oldKey := filepath.Base(oldURL)
			_, err := config.S3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
				Bucket: aws.String(config.GetS3BucketName()),
				Key:    aws.String(oldKey),
			})
			if err != nil {
				log.Println("Failed to delete old image from S3:", oldKey, err)
			}
		}
	}

	update := bson.M{
		"$set": bson.M{
			"game":           input.Game,
			"title":          input.Title,
			"price":          input.Price,
			"description":    input.Description,
			"images":         input.Images,
			"bankAccount":    bankAccountID,
			"status":         input.Status,
			"formType":       input.FormType,
			"username":       input.Username,
			"password":       input.Password,
			"secondPassword": input.SecondPassword,
			"updatedAt":      time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing updated successfully"})
}

func GetListingWithUserByID(c *gin.Context) {
	fmt.Println(">>> Handler GetListingWithUserByID called with id:", c.Param("id"))
	listingID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	listingsCollection := config.DB.Collection("listings")
	usersCollection := config.DB.Collection("users")

	var listing models.Listing
	err = listingsCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&listing)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	password, _ := Decrypt(listing.Password)
	secondPassword, _ := Decrypt(listing.SecondPassword)
	listing.Password = password
	listing.SecondPassword = secondPassword

	var user models.User
	err = usersCollection.FindOne(ctx, bson.M{"email": listing.UserEmail}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	safeUser := SafeUser{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		NameStore: user.NameStore,
		Email:     user.Email,
		Username:  user.Username,
		Phone:     user.Phone,
		Address:   user.Address,
		Facebook:  user.Facebook,
		Instagram: user.Instagram,
		Line:      user.Line,
		Discord:   user.Discord,
		Bio:       user.Bio,
		Games:     user.Games,
		Image:     user.Image,
	}

	result := ListingWithUser{
		Listing: listing,
		User:    safeUser,
	}

	c.JSON(http.StatusOK, result)
}

func DeleteListing(c *gin.Context) {
	listingID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

	collection := config.DB.Collection("listings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var listing models.Listing
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&listing)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listing not found"})
		return
	}

	for _, imgURL := range listing.Images {
		imgKey := filepath.Base(imgURL)

		_, err := config.S3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
			Bucket: aws.String(config.GetS3BucketName()),
			Key:    aws.String(imgKey),
		})
		if err != nil {
			log.Println("Failed to delete image from S3:", imgKey, err)
		}
	}

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil || result.DeletedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Listing deleted successfully"})
}

func ToggleFavoriteListing(c *gin.Context) {
	listingID := c.Param("id")
	listingObjID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

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

	favCollection := config.DB.Collection("favorites")
	listingCollection := config.DB.Collection("listings")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existing models.Favorite
	err = favCollection.FindOne(ctx, bson.M{
		"userEmail": email,
		"listingID": listingObjID,
	}).Decode(&existing)

	if err == nil {
		_, err := favCollection.DeleteOne(ctx, bson.M{
			"userEmail": email,
			"listingID": listingObjID,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favorite"})
			return
		}

		_, err = listingCollection.UpdateOne(ctx, bson.M{"_id": listingObjID}, bson.M{
			"$inc": bson.M{"favorites": -1},
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Removed from favorites", "isFavorited": false})
		return
	}

	newFav := models.Favorite{
		ID:        primitive.NewObjectID(),
		UserEmail: email,
		ListingID: listingObjID,
		CreatedAt: time.Now(),
	}
	_, err = favCollection.InsertOne(ctx, newFav)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to favorites"})
		return
	}

	_, err = listingCollection.UpdateOne(ctx, bson.M{"_id": listingObjID}, bson.M{
		"$inc": bson.M{"favorites": 1},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update listing"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Added to favorites", "isFavorited": true})
}

func IsListingFavorited(c *gin.Context) {
	listingID := c.Param("id")
	listingObjID, err := primitive.ObjectIDFromHex(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid listing ID"})
		return
	}

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

	favCollection := config.DB.Collection("favorites")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	count, err := favCollection.CountDocuments(ctx, bson.M{
		"userEmail": email,
		"listingID": listingObjID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check favorite"})
		return
	}

	isFavorited := count > 0

	c.JSON(http.StatusOK, gin.H{"isFavorited": isFavorited})
}

func GetUserFavorites(c *gin.Context) {
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

	favCollection := config.DB.Collection("favorites")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := favCollection.Find(ctx, bson.M{"userEmail": email})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
		return
	}
	defer cursor.Close(ctx)

	var favorites []models.Favorite
	if err := cursor.All(ctx, &favorites); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse favorites"})
		return
	}

	var favoritesListingIds []string
	for _, fav := range favorites {
		favoritesListingIds = append(favoritesListingIds, fav.ListingID.Hex())
	}

	c.JSON(http.StatusOK, gin.H{"favoritesListingIds": favoritesListingIds})
}
