package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Listing struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserEmail      string             `bson:"userEmail" json:"userEmail"`
	Game           string             `bson:"game" json:"game"`
	Title          string             `bson:"title" json:"title"`
	Price          int                `bson:"price" json:"price"`
	Description    string             `bson:"description" json:"description"`
	Images         []string           `bson:"images" json:"images"`
	BankAccount    primitive.ObjectID `bson:"bankAccount" json:"bankAccount"`
	Status         string             `bson:"status" json:"status"`
	Favorites      int                `bson:"favorites" json:"favorites"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
	FormType       string             `bson:"formType,omitempty" json:"formType,omitempty"`
	Username       string             `bson:"username,omitempty" json:"username,omitempty"`
	Password       string             `bson:"password,omitempty" json:"password,omitempty"`
	SecondPassword string             `bson:"secondPassword,omitempty" json:"secondPassword,omitempty"`
}
