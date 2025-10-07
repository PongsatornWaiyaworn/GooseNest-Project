package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Favorite struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserEmail string             `bson:"userEmail" json:"userEmail"`
	ListingID primitive.ObjectID `bson:"listingID" json:"listingID"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}
