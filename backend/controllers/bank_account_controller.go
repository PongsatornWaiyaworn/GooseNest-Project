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

func CreateBankAccount(c *gin.Context) {
	var account models.BankAccount

	if err := c.ShouldBindJSON(&account); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	account.Email = email.(string)

	account.ID = primitive.NewObjectID()
	account.CreatedAt = time.Now()
	account.UpdatedAt = time.Now()

	collection := config.DB.Collection("bank_accounts")

	if account.IsDefault {
		_, err := collection.UpdateMany(
			context.Background(),
			bson.M{"email": account.Email, "isDefault": true},
			bson.M{"$set": bson.M{"isDefault": false}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update default account"})
			return
		}
	}

	_, err := collection.InsertOne(context.Background(), account)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bank account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bank account created", "id": account.ID.Hex()})
}

func GetDefaultBankAccount(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	collection := config.DB.Collection("bank_accounts")

	var defaultAccount models.BankAccount
	err := collection.FindOne(
		context.Background(),
		bson.M{"email": email.(string), "isDefault": true},
	).Decode(&defaultAccount)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Default bank account not found"})
		return
	}

	c.JSON(http.StatusOK, defaultAccount)
}

func SetDefaultBankAccount(c *gin.Context) {
	accountID := c.Param("id")
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(accountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	collection := config.DB.Collection("bank_accounts")

	_, err = collection.UpdateMany(
		context.Background(),
		bson.M{"email": email.(string), "isDefault": true},
		bson.M{"$set": bson.M{"isDefault": false}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset default accounts"})
		return
	}

	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID, "email": email.(string)},
		bson.M{"$set": bson.M{"isDefault": true}},
	)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found or not yours"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Default bank account set successfully"})
}

func DeleteBankAccount(c *gin.Context) {
	accountID := c.Param("id")
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(accountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	collection := config.DB.Collection("bank_accounts")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{
		"_id":   objID,
		"email": email.(string),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete bank account"})
		return
	}
	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bank account not found or not authorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bank account deleted successfully"})
}

func GetBankAccounts(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	collection := config.DB.Collection("bank_accounts")

	cursor, err := collection.Find(context.Background(), bson.M{
		"email": email.(string),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bank accounts"})
		return
	}
	defer cursor.Close(context.Background())

	var accounts []models.BankAccount
	if err := cursor.All(context.Background(), &accounts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reading bank accounts"})
		return
	}

	c.JSON(http.StatusOK, accounts)
}

func UpdateBankAccount(c *gin.Context) {
	accountID := c.Param("id")
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(accountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	var updatedData models.BankAccount
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	collection := config.DB.Collection("bank_accounts")

	updateFields := bson.M{
		"accountNo":   updatedData.AccountNo,
		"accountName": updatedData.AccountName,
		"bankName":    updatedData.BankName,
		"type":        updatedData.Type,
		"updatedAt":   time.Now(),
	}

	if updatedData.IsDefault {
		_, err := collection.UpdateMany(
			context.Background(),
			bson.M{"email": email.(string), "isDefault": true},
			bson.M{"$set": bson.M{"isDefault": false}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update default account"})
			return
		}
		updateFields["isDefault"] = true
	}

	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objID, "email": email.(string)},
		bson.M{"$set": updateFields},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bank account"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bank account not found or not authorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bank account updated successfully"})
}

func GetBankAccountByID(c *gin.Context) {
	accountID := c.Param("id")

	objID, err := primitive.ObjectIDFromHex(accountID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid account ID"})
		return
	}

	collection := config.DB.Collection("bank_accounts")

	var account models.BankAccount
	err = collection.FindOne(
		context.Background(),
		bson.M{"_id": objID},
	).Decode(&account)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bank account not found"})
		return
	}

	c.JSON(http.StatusOK, account)
}
